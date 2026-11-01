        let template = null;
        const starterPlayer = this.dataModel.StarterPlayer;
        if (starterPlayer) {
            const sc = starterPlayer.FindFirstChild('StarterCharacter');
            if (sc && sc.IsA && sc.IsA('Model')) {
                template = sc;
            } else {
                const models = (starterPlayer.GetChildren ? starterPlayer.GetChildren() : []).filter(c =>
                    c && c.IsA && c.IsA('Model') &&
                    c.Name !== 'StarterPlayerScripts' &&
                    c.Name !== 'StarterCharacterScripts'
                );
                if (models.length > 0) {
                    template = models.find(m => m.FindFirstChildOfClass && m.FindFirstChildOfClass('Humanoid', true)) || models[0];
                }
            }
        }
        if (!template) {
            template = this.starterCharacterTemplate;
        }

        const char = template.Clone();
        if (!char) throw new Error('Character template could not be cloned');
        char.Name = 'Player';
        this.humanoid = char.FindFirstChildOfClass('Humanoid', true);
        if (!this.humanoid) {
            this.humanoid = new Instance('Humanoid');
            this.humanoid.Name = 'Humanoid';
            this.humanoid.Parent = char;
        }

        let rootPart = char.FindFirstChild('HumanoidRootPart', true);
        const torso = char.FindFirstChild('Torso', true) || char.FindFirstChild('UpperTorso', true);
        const head = char.FindFirstChild('Head', true);
        const leftArm = char.FindFirstChild('Left Arm', true) || char.FindFirstChild('LeftUpperArm', true);
        const rightArm = char.FindFirstChild('Right Arm', true) || char.FindFirstChild('RightUpperArm', true);
        const leftLeg = char.FindFirstChild('Left Leg', true) || char.FindFirstChild('LeftUpperLeg', true);
        const rightLeg = char.FindFirstChild('Right Leg', true) || char.FindFirstChild('RightUpperLeg', true);

        if (!rootPart && torso) {
            rootPart = torso;
        }
        if (!rootPart) {
            rootPart = char.GetDescendants().find(instance => instance.IsA && instance.IsA('BasePart'));
        }

        if (head) {
            const faceDecal = head.FindFirstChild('face', true);
            if (faceDecal) faceDecal.Face = 'Front';
            head.Orientation = new Vector3(0, head.Orientation.y, 0);
        }

        this.humanoid.WalkSpeed = 16;
        this.humanoid.JumpPower = 50;
        this.humanoid.MaxHealth = 100;
        this.humanoid.Health = 100;

        const rootPos = rootPart ? rootPart.Position : (torso ? torso.Position : new Vector3(spawnX, rootCenterY, spawnZ));
        const offset = new Vector3(spawnX, rootCenterY, spawnZ).sub(rootPos);
        for (const part of char.GetDescendants().filter(instance => instance.IsA && instance.IsA('BasePart'))) {
            part.Position = part.Position.add(offset);
            part.Anchored = false;
            part.CanCollide = false;
            part.Locked = true;
        }
        if (rootPart) {
            rootPart.CanCollide = true;
            char.PrimaryPart = rootPart;
        }

        char.Parent = this.dataModel.Workspace;

        this.character = char;
        this.rootPart = rootPart;
