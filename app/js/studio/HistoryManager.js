/**
 * Conblox Undo / Redo History Manager
 * Linear timeline history ensuring Ctrl+Z and Ctrl+Y respond instantly on the first press.
 */

export class HistoryManager {
    constructor(dataModel, onRestore, getSelectedInfo = null) {
        this.dataModel = dataModel;
        this.onRestore = onRestore;
        this.getSelectedInfo = getSelectedInfo;
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = 20;
        this.isRestoring = false;
    }

    clear() {
        this.history = [];
        this.currentIndex = -1;
    }

    recordState(forcedSelectedId = undefined, forcedSelectedName = undefined) {
        if (this.isRestoring || !this.dataModel || !this.dataModel.Workspace) return;

        // Snapshot all root services so cross-service moves/reparenting undo cleanly without duplicates
        const servicesMap = {};
        for (const service of this.dataModel.GetChildren()) {
            servicesMap[service.Name] = service.serialize();
        }

        let selId = null;
        let selName = null;
        let selectedItems = [];
        if (forcedSelectedId !== undefined) {
            selId = forcedSelectedId;
            selName = forcedSelectedName || null;
            if (selId) selectedItems = [{ id: selId, name: selName }];
        } else if (this.getSelectedInfo) {
            const info = this.getSelectedInfo();
            if (info) {
                selId = info.id || null;
                selName = info.name || null;
                selectedItems = Array.isArray(info.items)
                    ? info.items.filter(item => item && item.id)
                    : [];
            }
        }
        if (selectedItems.length === 0 && selId) {
            selectedItems = [{ id: selId, name: selName }];
        }

        const newHash = JSON.stringify(servicesMap);

        const entry = {
            services: servicesMap,
            workspace: servicesMap['Workspace'],
            selectedId: selId,
            selectedName: selName,
            selectedItems,
            hash: newHash
        };

        // Discard any forward redo history if a new action is performed
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Avoid recording duplicate identical states
        if (this.history.length > 0 && this.currentIndex >= 0) {
            const currentRecord = this.history[this.currentIndex];
            const prevHash = currentRecord.hash || JSON.stringify(currentRecord.services || currentRecord.workspace);
            const previousSelection = currentRecord.selectedItems || (currentRecord.selectedId
                ? [{ id: currentRecord.selectedId }]
                : []);
            if (prevHash === newHash && currentRecord.selectedId === selId &&
                JSON.stringify(previousSelection.map(item => item.id)) === JSON.stringify(selectedItems.map(item => item.id))) {
                return;
            }
        }

        this.history.push(entry);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        this.currentIndex = this.history.length - 1;
    }

    undo(fallbackId = null, fallbackName = null) {
        if (this.currentIndex <= 0 || this.history.length === 0) return;

        this.currentIndex--;
        const prevState = this.history[this.currentIndex];
        this.restoreState(prevState, fallbackId, fallbackName);
    }

    redo(fallbackId = null, fallbackName = null) {
        if (this.currentIndex >= this.history.length - 1 || this.history.length === 0) return;

        this.currentIndex++;
        const nextState = this.history[this.currentIndex];
        this.restoreState(nextState, fallbackId, fallbackName);
    }

    restoreState(stateData, fallbackId = null, fallbackName = null) {
        if (!stateData) return;
        this.isRestoring = true;
        try {
            const targetId = stateData.selectedId || fallbackId;
            const targetName = stateData.selectedName || fallbackName;

            if (stateData.services) {
                // Restore all services to eliminate ghost duplicates across services
                for (const [serviceName, serviceData] of Object.entries(stateData.services)) {
                    const service = this.dataModel.FindFirstChild(serviceName);
                    if (!service) continue;

                    if (serviceName === 'StarterPlayer') {
                        if (service.StarterCharacterScripts) service.StarterCharacterScripts.ClearAllChildren();
                        if (service.StarterPlayerScripts) service.StarterPlayerScripts.ClearAllChildren();
                        if (serviceData.children) {
                            for (const folderData of serviceData.children) {
                                const targetFolder = (folderData.name === 'StarterCharacterScripts')
                                    ? service.StarterCharacterScripts
                                    : (folderData.name === 'StarterPlayerScripts' ? service.StarterPlayerScripts : null);
                                if (targetFolder && folderData.children) {
                                    for (const childData of folderData.children) {
                                        const child = window.conbloxInstance.deserialize(childData, false);
                                        child.Parent = targetFolder;
                                    }
                                }
                            }
                        }
                    } else if (serviceName === 'Workspace') {
                        // Protect permanent singletons (Terrain, Camera) from being duplicated or destroyed
                        for (const child of [...service.GetChildren()]) {
                            if (child.ClassName === 'Terrain' || child.ClassName === 'Camera') continue;
                            child.Destroy();
                        }
                        if (serviceData.children) {
                            for (const childData of serviceData.children) {
                                if (childData.className === 'Terrain' || childData.className === 'Camera') {
                                    const singleton = service.FindFirstChild(childData.className);
                                    if (singleton) {
                                        if (childData.properties && singleton.deserializeProperties) {
                                            singleton.deserializeProperties(childData.properties);
                                        }
                                        if (childData.children && Array.isArray(childData.children)) {
                                            for (const c of [...singleton.GetChildren()]) c.Destroy();
                                            for (const cData of childData.children) {
                                                const c = window.conbloxInstance.deserialize(cData, false);
                                                c.Parent = singleton;
                                            }
                                        }
                                        continue;
                                    }
                                }
                                const child = window.conbloxInstance.deserialize(childData, false);
                                child.Parent = service;
                            }
                        }
                    } else {
                        service.ClearAllChildren();
                        if (serviceData.children) {
                            for (const childData of serviceData.children) {
                                const child = window.conbloxInstance.deserialize(childData, false);
                                child.Parent = service;
                            }
                        }
                    }
                }
            } else {
                // Backwards-compatible single workspace restore
                const wsData = stateData.workspace || stateData;
                for (const child of [...this.dataModel.Workspace.GetChildren()]) {
                    if (child.ClassName === 'Terrain' || child.ClassName === 'Camera') continue;
                    child.Destroy();
                }
                if (wsData.children) {
                    for (const childData of wsData.children) {
                        if (childData.className === 'Terrain' || childData.className === 'Camera') {
                            const singleton = this.dataModel.Workspace.FindFirstChild(childData.className);
                            if (singleton) {
                                if (childData.properties && singleton.deserializeProperties) {
                                    singleton.deserializeProperties(childData.properties);
                                }
                                if (childData.children && Array.isArray(childData.children)) {
                                    for (const c of [...singleton.GetChildren()]) c.Destroy();
                                    for (const cData of childData.children) {
                                        const c = window.conbloxInstance.deserialize(cData, false);
                                        c.Parent = singleton;
                                    }
                                }
                                continue;
                            }
                        }
                        const child = window.conbloxInstance.deserialize(childData, false);
                        child.Parent = this.dataModel.Workspace;
                    }
                }
            }

            if (this.onRestore) this.onRestore(targetId, targetName, stateData.selectedItems || []);
        } finally {
            this.isRestoring = false;
        }
    }
}
