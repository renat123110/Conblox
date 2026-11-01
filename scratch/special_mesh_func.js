    getSpecialMeshTexture(texVal, part) {
        if (!texVal) return null;
        if (!this.specialMeshTextureLoader) this.specialMeshTextureLoader = new THREE.TextureLoader();
        if (!this.specialMeshTextureCache) this.specialMeshTextureCache = new Map();
        if (!this._specialMeshRawImages) this._specialMeshRawImages = new Map();

        let rgb = { r: 255, g: 255, b: 255 };
        if (part) {
            if (part.Color && typeof part.Color.toRGB === 'function') {
                rgb = part.Color.toRGB();
            } else if (part.Color && typeof part.Color.r === 'number') {
                rgb = {
                    r: Math.round(part.Color.r * (part.Color.r <= 1 ? 255 : 1)),
                    g: Math.round(part.Color.g * (part.Color.g <= 1 ? 255 : 1)),
                    b: Math.round(part.Color.b * (part.Color.b <= 1 ? 255 : 1))
                };
            }
        }

        const cacheKey = String(texVal) + '__' + rgb.r + '_' + rgb.g + '_' + rgb.b;

        const configureTexture = (tex) => {
            if (!tex) return;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 1);
            tex.offset.set(0, 0);
            if (typeof THREE.SRGBColorSpace !== 'undefined') {
                tex.colorSpace = THREE.SRGBColorSpace;
            } else if (typeof THREE.sRGBEncoding !== 'undefined') {
                tex.encoding = THREE.sRGBEncoding;
            }
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            if (this.renderer && this.renderer.capabilities) {
                const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
                if (maxAniso > 1) {
                    tex.anisotropy = Math.min(16, maxAniso);
                }
            }
            tex.needsUpdate = true;
        };

        if (this.specialMeshTextureCache.has(cacheKey)) {
            const cached = this.specialMeshTextureCache.get(cacheKey);
            configureTexture(cached);
            return cached;
        }

        const processImageWithColor = (rawImg, colorRgb) => {
            if (!rawImg) return null;
            const w = rawImg.naturalWidth || rawImg.width || 0;
            const h = rawImg.naturalHeight || rawImg.height || 0;
            if (!w || !h) return null;

            try {
                const testCanvas = document.createElement('canvas');
                testCanvas.width = w;
                testCanvas.height = h;
                const testCtx = testCanvas.getContext('2d', { willReadFrequently: true });
                testCtx.drawImage(rawImg, 0, 0);
                const imgData = testCtx.getImageData(0, 0, w, h);
                const data = imgData.data;

                let hasAlpha = false;
                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] < 250) {
                        hasAlpha = true;
                        break;
                    }
                }

                if (hasAlpha) {
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = 'rgb(' + colorRgb.r + ', ' + colorRgb.g + ', ' + colorRgb.b + ')';
                    ctx.fillRect(0, 0, w, h);
                    ctx.drawImage(rawImg, 0, 0);
                    return canvas;
                }
            } catch (err) {
                console.warn('[Viewport] Failed to process special mesh texture alpha:', err);
            }
            return null;
        };

        if (this._specialMeshRawImages.has(texVal)) {
            const rawImg = this._specialMeshRawImages.get(texVal);
            const canvas = processImageWithColor(rawImg, rgb);
            const tex = canvas ? new THREE.CanvasTexture(canvas) : this.specialMeshTextureLoader.load(texVal);
            configureTexture(tex);
            this.specialMeshTextureCache.set(cacheKey, tex);
            return tex;
        }

        const assetId = extractRobloxAssetId(texVal);
        let loadUrl = texVal;
        if (assetId && !texVal.startsWith('data:') && !texVal.startsWith('/')) {
            loadUrl = '/api/roblox-asset?id=' + encodeURIComponent(assetId);
        }

        const texture = this.specialMeshTextureLoader.load(loadUrl, (t) => {
            if (t.image) {
                this._specialMeshRawImages.set(texVal, t.image);
                const canvas = processImageWithColor(t.image, rgb);
                if (canvas) {
                    const canvasTex = new THREE.CanvasTexture(canvas);
                    configureTexture(canvasTex);
                    this.specialMeshTextureCache.set(cacheKey, canvasTex);
                    if (part) {
                        const mesh = this.partMeshes.get(part);
                        if (mesh && mesh.material) {
                            if (Array.isArray(mesh.material)) {
                                mesh.material.forEach(m => {
                                    m.map = canvasTex;
                                    m.needsUpdate = true;
                                });
                            } else {
                                mesh.material.map = canvasTex;
                                mesh.material.needsUpdate = true;
                            }
                        }
                    }
                    return;
                }
            }
            configureTexture(t);
            t.needsUpdate = true;
            if (part) {
                const mesh = this.partMeshes.get(part);
                if (mesh && mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => {
                            m.map = t;
                            m.needsUpdate = true;
                        });
                    } else {
                        mesh.material.map = t;
                        mesh.material.needsUpdate = true;
                    }
                }
            }
        });

        configureTexture(texture);
        this.specialMeshTextureCache.set(cacheKey, texture);
        return texture;
    }
}
