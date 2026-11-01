    partHasClothing(part) {
        if (!part || !part.Parent) return false;
        const model = this.getCharacterModelAncestor(part);
        if (!model) return false;
        const name = part.Name;
        const hasShirt = model.GetChildren().some(c => c.ClassName === 'Shirt' && c.ShirtTemplate);
        const hasPants = model.GetChildren().some(c => c.ClassName === 'Pants' && c.PantsTemplate);
        const charMesh = this.getCharacterMeshForPart(part);
        const hasMeshTex = Boolean(charMesh && (charMesh.BaseTextureId || charMesh.OverlayTextureId));
        if (name === 'Torso') return hasShirt || hasPants || hasMeshTex;
        if (name === 'Left Arm' || name === 'Right Arm') return hasShirt || hasMeshTex;
        if (name === 'Left Leg' || name === 'Right Leg') return hasPants || hasMeshTex;
        return false;
    }

    createClothingBoxGeometry(part, sx, sy, sz) {
        const geo = new THREE.BoxGeometry(sx, sy, sz);
        if (!geo.attributes.uv) return geo;
        const uvs = geo.attributes.uv.array;
        const name = part.Name;

        let rects = null;
        if (name === 'Torso') {
            rects = {
                right:  { x: 165, y: 74,  w: 64,  h: 128 },
                left:   { x: 361, y: 74,  w: 64,  h: 128 },
                top:    { x: 231, y: 8,   w: 128, h: 64  },
                bottom: { x: 231, y: 204, w: 128, h: 64  },
                front:  { x: 231, y: 74,  w: 128, h: 128 },
                back:   { x: 427, y: 74,  w: 128, h: 128 }
            };
        } else if (name === 'Right Arm' || name === 'Right Leg') {
            rects = {
                left:   { x: 19,  y: 355, w: 64, h: 128 },
                back:   { x: 85,  y: 355, w: 64, h: 128 },
                right:  { x: 151, y: 355, w: 64, h: 128 },
                front:  { x: 217, y: 355, w: 64, h: 128 },
                top:    { x: 217, y: 289, w: 64, h: 64  },
                bottom: { x: 217, y: 485, w: 64, h: 64  }
            };
        } else if (name === 'Left Arm' || name === 'Left Leg') {
            rects = {
                front:  { x: 307, y: 355, w: 64, h: 128 },
                left:   { x: 373, y: 355, w: 64, h: 128 },
                back:   { x: 439, y: 355, w: 64, h: 128 },
                right:  { x: 505, y: 355, w: 64, h: 128 },
                top:    { x: 307, y: 289, w: 64, h: 64  },
                bottom: { x: 307, y: 485, w: 64, h: 64  }
            };
        }

        if (rects) {
            const W = 585, H = 559;
            const setFaceUVs = (faceIndex, r, flipU = false, flipV = false) => {
                const u0 = r.x / W;
                const u1 = (r.x + r.w) / W;
                const v1 = 1.0 - (r.y / H);
                const v0 = 1.0 - ((r.y + r.h) / H);
                const off = faceIndex * 8;
                const leftU = flipU ? u1 : u0;
                const rightU = flipU ? u0 : u1;
                const topV = flipV ? v0 : v1;
                const bottomV = flipV ? v1 : v0;
                uvs[off + 0] = leftU;  uvs[off + 1] = topV;
                uvs[off + 2] = rightU; uvs[off + 3] = topV;
                uvs[off + 4] = leftU;  uvs[off + 5] = bottomV;
                uvs[off + 6] = rightU; uvs[off + 7] = bottomV;
            };

            setFaceUVs(0, rects.right, false, false);
            setFaceUVs(1, rects.left, false, false);
            setFaceUVs(2, rects.top, true, true);
            setFaceUVs(3, rects.bottom, true, true);
            setFaceUVs(4, rects.back, false, false);
            setFaceUVs(5, rects.front, false, false);

            geo.attributes.uv.needsUpdate = true;
        }

        return geo;
    }

    applyClothingUVMappingToGeometry(geometry, limbName) {
        if (!geometry || !geometry.attributes.position) return geometry;
        const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
        const pos = nonIndexed.attributes.position.array;
        const norm = nonIndexed.attributes.normal?.array;
        const count = nonIndexed.attributes.position.count;
        const uvs = new Float32Array(count * 2);

        let rects = null;
        let halfX = 1, halfY = 1, halfZ = 0.5;
        if (limbName === 'Torso') {
            halfX = 1; halfY = 1; halfZ = 0.5;
            rects = {
                right:  { x: 165, y: 74,  w: 64,  h: 128 },
                left:   { x: 361, y: 74,  w: 64,  h: 128 },
                top:    { x: 231, y: 8,   w: 128, h: 64  },
                bottom: { x: 231, y: 204, w: 128, h: 64  },
                front:  { x: 231, y: 74,  w: 128, h: 128 },
                back:   { x: 427, y: 74,  w: 128, h: 128 }
            };
        } else if (limbName === 'Right Arm' || limbName === 'Right Leg') {
            halfX = 0.5; halfY = 1; halfZ = 0.5;
            rects = {
                left:   { x: 19,  y: 355, w: 64, h: 128 },
                back:   { x: 85,  y: 355, w: 64, h: 128 },
                right:  { x: 151, y: 355, w: 64, h: 128 },
                front:  { x: 217, y: 355, w: 64, h: 128 },
                top:    { x: 217, y: 289, w: 64, h: 64  },
                bottom: { x: 217, y: 485, w: 64, h: 64  }
            };
        } else if (limbName === 'Left Arm' || limbName === 'Left Leg') {
            halfX = 0.5; halfY = 1; halfZ = 0.5;
            rects = {
                front:  { x: 307, y: 355, w: 64, h: 128 },
                left:   { x: 373, y: 355, w: 64, h: 128 },
                back:   { x: 439, y: 355, w: 64, h: 128 },
                right:  { x: 505, y: 355, w: 64, h: 128 },
                top:    { x: 307, y: 289, w: 64, h: 64  },
                bottom: { x: 307, y: 485, w: 64, h: 64  }
            };
        }

        if (!rects) return nonIndexed;

        const W = 585, H = 559;
        for (let i = 0; i < count; i++) {
            const px = pos[i * 3];
            const py = pos[i * 3 + 1];
            const pz = pos[i * 3 + 2];
            const nx = norm ? norm[i * 3] : 0;
            const ny = norm ? norm[i * 3 + 1] : 0;
            const nz = norm ? norm[i * 3 + 2] : 1;

            const nxa = Math.abs(nx);
            const nya = Math.abs(ny);
            const nza = Math.abs(nz);

            let r = rects.front;
            let fu = 0.5;
            let fv = 0.5;

            if (nza >= nxa && nza >= nya) {
                if (nz <= 0) {
                    r = rects.front;
                    fu = (1.0 - px / halfX) * 0.5;
                    fv = (1.0 - py / halfY) * 0.5;
                } else {
                    r = rects.back;
                    fu = (px / halfX + 1.0) * 0.5;
                    fv = (1.0 - py / halfY) * 0.5;
                }
            } else if (nxa >= nya) {
                if (nx >= 0) {
                    r = rects.right;
                    fu = (1.0 - pz / halfZ) * 0.5;
                    fv = (1.0 - py / halfY) * 0.5;
                } else {
                    r = rects.left;
                    fu = (pz / halfZ + 1.0) * 0.5;
                    fv = (1.0 - py / halfY) * 0.5;
                }
            } else {
                if (ny >= 0) {
                    r = rects.top;
                    fu = (1.0 - px / halfX) * 0.5;
                    fv = (pz / halfZ + 1.0) * 0.5;
                } else {
                    r = rects.bottom;
                    fu = (1.0 - px / halfX) * 0.5;
                    fv = (1.0 - pz / halfZ) * 0.5;
                }
            }

            fu = Math.max(0, Math.min(1, fu));
            fv = Math.max(0, Math.min(1, fv));

            const u = (r.x + fu * r.w) / W;
            const v = 1.0 - ((r.y + fv * r.h) / H);
            uvs[i * 2] = u;
            uvs[i * 2 + 1] = v;
        }

        nonIndexed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        nonIndexed.attributes.uv.needsUpdate = true;
        return nonIndexed;
    }

    getClothingTextureForPart(part) {
        if (!part || !part.Parent) return null;
        const model = this.getCharacterModelAncestor(part);
        if (!model) return null;

        const shirt = model.GetChildren().find(c => c.ClassName === 'Shirt' && c.ShirtTemplate);
        const pants = model.GetChildren().find(c => c.ClassName === 'Pants' && c.PantsTemplate);
        const charMesh = this.getCharacterMeshForPart(part);
        const name = part.Name;

        let needsShirt = false;
        let needsPants = false;
        if (name === 'Torso') {
            needsShirt = Boolean(shirt);
            needsPants = Boolean(pants);
        } else if (name === 'Left Arm' || name === 'Right Arm') {
            needsShirt = Boolean(shirt);
        } else if (name === 'Left Leg' || name === 'Right Leg') {
            needsPants = Boolean(pants);
        }

        const baseTexVal = charMesh?.BaseTextureId ? String(charMesh.BaseTextureId).trim() : '';
        const overlayTexVal = charMesh?.OverlayTextureId ? String(charMesh.OverlayTextureId).trim() : '';

        if (!needsShirt && !needsPants && !baseTexVal && !overlayTexVal) return null;

        const shirtVal = needsShirt ? String(shirt.ShirtTemplate).trim() : '';
        const pantsVal = needsPants ? String(pants.PantsTemplate).trim() : '';

        const colorVal = part.Color || new Color3(1, 1, 1);
        const rgb = colorVal.toRGB ? colorVal.toRGB() : { r: 160, g: 160, b: 160 };
        const skinHex = '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);

        if (!this.clothingTextureCache) {
            this.clothingTextureCache = new Map();
        }

        const hashStr = (s) => (s && s.length > 50 ? s.slice(0, 20) + '_' + s.length + '_' + s.slice(-20) : (s || ''));
        const cacheKey = name + '_' + hashStr(shirtVal) + '_' + hashStr(pantsVal) + '_' + hashStr(baseTexVal) + '_' + hashStr(overlayTexVal) + '_' + skinHex;
        if (this.clothingTextureCache.has(cacheKey)) {
            return this.clothingTextureCache.get(cacheKey);
        }

        this.buildClothingTexture(cacheKey, part, name, shirtVal, pantsVal, baseTexVal, overlayTexVal, skinHex);
        return null;
    }

    async buildClothingTexture(cacheKey, part, limbName, shirtVal, pantsVal, baseTexVal, overlayTexVal, skinHex) {
        if (this._clothingLoadingSet?.has(cacheKey)) return;
        if (!this._clothingLoadingSet) this._clothingLoadingSet = new Set();
        this._clothingLoadingSet.add(cacheKey);

        const resolveUrl = (val) => {
            if (!val || val === '0' || val === 'rbxassetid://0') return null;
            const str = String(val).trim();
            if (str.startsWith('data:') || str.startsWith('blob:')) return str;
            if (str.startsWith('/') || str.startsWith('./')) return str;
            if (str.startsWith('http://') || str.startsWith('https://')) {
                if (!str.includes('roblox.com') && !str.includes('rbxassetid')) return str;
            }
            const assetId = extractRobloxAssetId(str);
            if (assetId) return '/api/roblox-asset?id=' + encodeURIComponent(assetId);
            return str;
        };

        const loadImage = (val) => {
            const url = resolveUrl(val);
            if (!url) return Promise.resolve(null);
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => {
                    console.warn('[Clothing] Failed to load texture from:', url);
                    resolve(null);
                };
                img.src = url;
            });
        };

        try {
            const [shirtImg, pantsImg, baseMeshImg, overMeshImg] = await Promise.all([
                shirtVal ? loadImage(shirtVal) : null,
                pantsVal ? loadImage(pantsVal) : null,
                baseTexVal ? loadImage(baseTexVal) : null,
                overlayTexVal ? loadImage(overlayTexVal) : null
            ]);

            const canvas = document.createElement('canvas');
            canvas.width = 585;
            canvas.height = 559;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = skinHex;
            ctx.fillRect(0, 0, 585, 559);

            if (baseMeshImg) {
                ctx.drawImage(baseMeshImg, 0, 0, 585, 559);
            }
            if (pantsImg) {
                ctx.drawImage(pantsImg, 0, 0, 585, 559);
            }
            if (shirtImg) {
                ctx.drawImage(shirtImg, 0, 0, 585, 559);
            }
            if (overMeshImg) {
                ctx.drawImage(overMeshImg, 0, 0, 585, 559);
            }

            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.needsUpdate = true;

            this.clothingTextureCache.set(cacheKey, tex);
            this._clothingLoadingSet.delete(cacheKey);

            this.rebuildPartMesh(part);
        } catch (err) {
            console.warn('[Clothing] Failed to build clothing texture:', err);
            this._clothingLoadingSet.delete(cacheKey);
        }
    }
