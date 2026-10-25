/**
 * Conblox Place Templates & Asset Library
 * Pre-made templates: Classic Baseplate, Obby Starter, Physics Sandbox, and Quick Assets
 */

import { Vector3, Color3 } from '../engine/Math3D.js';
import { Part, SpawnLocation } from '../engine/BasePart.js';
import { Model, Script, PointLight, BloomEffect, Atmosphere, SunRaysEffect, DepthOfFieldEffect, Sky, Clouds } from '../engine/OtherInstances.js';

export class TemplateManager {
    static setupDefaultLightingAndAtmosphere(dataModel) {
        if (!dataModel) return;

        // Clouds in Workspace
        const existingClouds = dataModel.Workspace.GetChildren().find(c => c.ClassName === 'Clouds');
        if (!existingClouds) {
            const clouds = new Clouds();
            clouds.Cover = 0.5;
            clouds.Density = 0.7;
            clouds.Speed = 1.0;
            clouds.Color = Color3.fromRGB(255, 255, 255);
            clouds.Enabled = true;
            clouds.Parent = dataModel.Workspace;
        }

        // Lighting effects
        if (dataModel.Lighting) {
            if (!dataModel.Lighting.GetChildren().some(c => c.ClassName === 'Sky' || c.ClassName === 'SkyBox')) {
                const sky = new Sky();
                sky.Preset = 'Classic Roblox';
                sky.Parent = dataModel.Lighting;
            }
            if (!dataModel.Lighting.GetChildren().some(c => c.ClassName === 'Atmosphere')) {
                const atmo = new Atmosphere();
                atmo.Parent = dataModel.Lighting;
            }
            if (!dataModel.Lighting.GetChildren().some(c => c.ClassName === 'BloomEffect')) {
                const bloom = new BloomEffect();
                bloom.Parent = dataModel.Lighting;
            }
            if (!dataModel.Lighting.GetChildren().some(c => c.ClassName === 'SunRaysEffect')) {
                const sunrays = new SunRaysEffect();
                sunrays.Parent = dataModel.Lighting;
            }
        }
    }
    static loadBaseplate(dataModel) {
        dataModel.Workspace.ClearAllChildren();

        // Baseplate
        const baseplate = new Part();
        baseplate.Name = 'Baseplate';
        baseplate.Size = new Vector3(512, 4, 512);
        baseplate.Position = new Vector3(0, -2, 0);
        baseplate.Color = Color3.fromRGB(58, 125, 45); // Classic lush grass green
        baseplate.Material = 'Grass';
        baseplate.Anchored = true;
        baseplate.Locked = true;
        baseplate.Parent = dataModel.Workspace;

        // Spawn
        const spawn = new SpawnLocation();
        spawn.Position = new Vector3(0, 0.5, 0);
        spawn.Parent = dataModel.Workspace;

        TemplateManager.setupDefaultLightingAndAtmosphere(dataModel);
    }

    static loadObby(dataModel) {
        dataModel.Workspace.ClearAllChildren();

        // Start Island
        const startIsland = new Part();
        startIsland.Name = 'StartIsland';
        startIsland.Size = new Vector3(20, 2, 20);
        startIsland.Position = new Vector3(0, -1, 0);
        startIsland.Color = Color3.fromRGB(90, 95, 105);
        startIsland.Material = 'SmoothPlastic';
        startIsland.Anchored = true;
        startIsland.Parent = dataModel.Workspace;

        // Spawn
        const spawn = new SpawnLocation();
        spawn.Position = new Vector3(0, 0.5, 0);
        spawn.Parent = dataModel.Workspace;

        TemplateManager.setupDefaultLightingAndAtmosphere(dataModel);

        // Stage 1: Floating steps
        const stepColors = [
            Color3.fromRGB(0, 162, 255),
            Color3.fromRGB(0, 220, 130),
            Color3.fromRGB(245, 205, 47),
            Color3.fromRGB(230, 80, 50),
            Color3.fromRGB(180, 70, 220),
            Color3.fromRGB(0, 162, 255)
        ];

        for (let i = 0; i < 6; i++) {
            const stone = new Part();
            stone.Name = `Step_${i + 1}`;
            stone.Size = new Vector3(4, 1, 4);
            stone.Position = new Vector3(Math.sin(i * 0.8) * 4, 0.5 + i * 1.2, -14 - i * 9);
            stone.Color = stepColors[i % stepColors.length];
            stone.Material = 'Plastic';
            stone.Anchored = true;
            stone.Parent = dataModel.Workspace;
        }

        // Mid-way Platform
        const midPlatform = new Part();
        midPlatform.Name = 'MidPlatform';
        midPlatform.Size = new Vector3(8, 2, 8);
        midPlatform.Position = new Vector3(0, 7.5, -74);
        midPlatform.Color = Color3.fromRGB(0, 160, 230);
        midPlatform.Material = 'SmoothPlastic';
        midPlatform.Anchored = true;
        midPlatform.Parent = dataModel.Workspace;

        // High Lava Platform (Kill Bricks)
        const lavaPlatform = new Part();
        lavaPlatform.Name = 'LavaSection';
        lavaPlatform.Size = new Vector3(14, 1, 36);
        lavaPlatform.Position = new Vector3(0, 18, -110);
        lavaPlatform.Color = Color3.fromRGB(40, 42, 48);
        lavaPlatform.Material = 'SmoothPlastic';
        lavaPlatform.Anchored = true;
        lavaPlatform.Parent = dataModel.Workspace;

        // Lava Strips with Kill Script
        for (let j = 0; j < 4; j++) {
            const lava = new Part();
            lava.Name = `LavaStrip_${j}`;
            lava.Size = new Vector3(14, 1.2, 2.5);
            lava.Position = new Vector3(0, 18.5, -96 - j * 8);
            lava.Color = Color3.fromRGB(255, 35, 10);
            lava.Material = 'Neon';
            lava.Anchored = true;
            lava.Parent = dataModel.Workspace;

            const killScript = new Script();
            killScript.Name = 'KillScript';
            killScript.Source = `script.Parent.Touched.Connect((hit) => {
    const humanoid = hit.Parent.FindFirstChildOfClass("Humanoid");
    if (humanoid) {
        humanoid.TakeDamage(100);
        print("Player touched lava!");
    }
});`;
            killScript.Parent = lava;
        }

        // Winner Island
        const winIsland = new Part();
        winIsland.Name = 'WinnerIsland';
        winIsland.Size = new Vector3(18, 2, 18);
        winIsland.Position = new Vector3(0, 19, -145);
        winIsland.Color = Color3.fromRGB(245, 205, 47); // Radiant Golden
        winIsland.Material = 'Neon';
        winIsland.Anchored = true;
        winIsland.Parent = dataModel.Workspace;

        const trophyLight = new PointLight();
        trophyLight.Name = 'WinLight';
        trophyLight.Color = Color3.fromRGB(255, 230, 120);
        trophyLight.Brightness = 4;
        trophyLight.Range = 30;
        trophyLight.Parent = winIsland;
    }

    static loadPhysicsSandbox(dataModel) {
        dataModel.Workspace.ClearAllChildren();

        // Floor
        const baseplate = new Part();
        baseplate.Name = 'Baseplate';
        baseplate.Size = new Vector3(256, 4, 256);
        baseplate.Position = new Vector3(0, -2, 0);
        baseplate.Color = Color3.fromRGB(110, 115, 120);
        baseplate.Material = 'Plastic';
        baseplate.Anchored = true;
        baseplate.Parent = dataModel.Workspace;

        // Spawn
        const spawn = new SpawnLocation();
        spawn.Position = new Vector3(0, 0.5, 30);
        spawn.Parent = dataModel.Workspace;

        // Domino Chain (14 dominoes)
        for (let i = 0; i < 14; i++) {
            const domino = new Part();
            domino.Name = `Domino_${i + 1}`;
            domino.Size = new Vector3(2, 4, 0.6);
            domino.Position = new Vector3(-12, 2, 18 - i * 3);
            domino.Color = Color3.fromRGB(220, 40, 40);
            domino.Material = 'SmoothPlastic';
            domino.Anchored = false;
            domino.Parent = dataModel.Workspace;
        }

        // Wrecking ball pusher
        const pusher = new Part();
        pusher.Name = 'PusherBall';
        pusher.Shape = 'Ball';
        pusher.Size = new Vector3(3, 3, 3);
        pusher.Position = new Vector3(-12, 7, 21);
        pusher.Color = Color3.fromRGB(0, 162, 255);
        pusher.Material = 'Metal';
        pusher.Anchored = false;
        pusher.Parent = dataModel.Workspace;

        // Crate Pyramid
        const startX = 14;
        const layers = 5;
        for (let row = 0; row < layers; row++) {
            const count = layers - row;
            const startZ = -(count - 1) * 1.6;
            for (let c = 0; c < count; c++) {
                const crate = new Part();
                crate.Name = `Crate_${row}_${c}`;
                crate.Size = new Vector3(3, 3, 3);
                crate.Position = new Vector3(startX, 1.5 + row * 3.05, startZ + c * 3.2);
                crate.Color = Color3.fromRGB(150, 100, 50);
                crate.Material = 'Wood';
                crate.Anchored = false;
                crate.Parent = dataModel.Workspace;
            }
        }
        TemplateManager.setupDefaultLightingAndAtmosphere(dataModel);
    }
}
