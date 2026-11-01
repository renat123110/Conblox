file_path = r'C:\Users\Renat\Desktop\Conblox\app\js\engine\OtherInstances.js'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
target_import = "import { Vector3, Color3, CFrame } from './Math3D.js';"
repl_import = "import { Vector3, Color3, CFrame, nearestEulerYXZ } from './Math3D.js';"
assert target_import in code

code = code.replace(target_import, repl_import, 1)

# 2. Add signals and LoadAnimation to Humanoid
target_humanoid_init = '''        this.Died = new Signal();
        this.HealthChanged = new Signal();
    }'''

repl_humanoid_init = '''        this.Died = new Signal();
        this.HealthChanged = new Signal();
        this.Running = new Signal();
        this.Jumping = new Signal();
        this.Climbing = new Signal();
        this.FreeFalling = new Signal();
        this.FallingDown = new Signal();
        this.GettingUp = new Signal();
        this.Seated = new Signal();
        this.PlatformStanding = new Signal();
        this.Swimming = new Signal();
        this._activeAnimationTracks = new Set();
    }

    LoadAnimation(animation) {
        if (!this._activeAnimationTracks) this._activeAnimationTracks = new Set();
        if (animation instanceof AnimationTrack) return animation;

        if (animation && animation.ClassName === 'KeyframeSequence') {
            return new AnimationTrack(this, animation, animation.Name);
        }

        let animId = '';
        if (animation && animation.AnimationId) animId = animation.AnimationId;
        else if (typeof animation === 'string') animId = animation;

        const match = String(animId).match(/\\d{4,20}/);
        const numericId = match ? match[0] : null;

        const track = new AnimationTrack(this, null, (animation && animation.Name) || numericId || 'Animation');
        if (numericId) {
            const fetchUrl = `/content/animations/${numericId}.rbxm`;
            fetch(fetchUrl).then(async resp => {
                let buf;
                if (resp.ok) {
                    buf = await resp.arrayBuffer();
                } else {
                    const fallback = await fetch(`/api/roblox-animation?id=${numericId}`);
                    if (fallback.ok) buf = await fallback.arrayBuffer();
                }
                if (buf) {
                    const { parseRbxm } = await import('../studio/RbxmImporter.js');
                    const parsed = parseRbxm(new Uint8Array(buf));
                    const seq = parsed.roots.find(r => r.ClassName === 'KeyframeSequence') || parsed.roots[0];
                    if (seq) {
                        track.setSequence(seq);
                    }
                }
            }).catch(err => console.warn('Could not load animation asset', numericId, err));
        }

        return track;
    }'''

assert target_humanoid_init in code
code = code.replace(target_humanoid_init, repl_humanoid_init, 1)

# 3. Add AnimationTrack class definition
track_class = '''
export class AnimationTrack {
    constructor(humanoid, sequence = null, name = 'Animation') {
        this.humanoid = humanoid;
        this.sequence = sequence;
        this.name = name || (sequence ? sequence.Name : 'Animation');
        this.isPlaying = false;
        this.timePosition = 0;
        this.speed = 1.0;
        this.weight = 1.0;
        this.priority = sequence ? sequence.Priority : 'Core';
        this.looped = sequence ? Boolean(sequence.Loop) : true;
        this.length = sequence ? sequence.Length : 1.0;

        this.KeyframeReached = new Signal();
        this.DidLoop = new Signal();
        this.Stopped = new Signal();

        this._samples = [];
        this._keyframes = [];
        if (sequence) {
            this.setSequence(sequence);
        }
    }

    setSequence(sequence) {
        this.sequence = sequence;
        if (!sequence) return;
        this.length = Math.max(0.1, sequence.Length || sequence.Duration || 1.0);
        this.looped = Boolean(sequence.Loop);
        this._samples = [];
        const kfs = (sequence.GetKeyframes ? sequence.GetKeyframes() : []).sort((a, b) => a.Time - b.Time);
        for (const kf of kfs) {
            const sample = { time: kf.Time, name: kf.Name, poses: new Map() };
            const poses = kf.GetDescendants ? kf.GetDescendants().filter(i => i.ClassName === 'Pose') : [];
            for (const pose of poses) {
                if (pose.CFrame) sample.poses.set(pose.Name, pose.CFrame);
            }
            this._samples.push(sample);
        }
        if (this._samples.length > 0) {
            this.length = Math.max(this.length, this._samples[this._samples.length - 1].time, 0.1);
        }
    }

    get IsPlaying() { return this.isPlaying; }
    get Length() { return this.length; }
    get Looped() { return this.looped; }
    set Looped(v) { this.looped = Boolean(v); }
    get Priority() { return this.priority; }
    set Priority(v) { this.priority = String(v); }
    get TimePosition() { return this.timePosition; }
    set TimePosition(v) { this.timePosition = Number(v) || 0; }
    get Speed() { return this.speed; }
    set Speed(v) { this.speed = Number(v) || 0; }

    Play(transitionTime = 0.1, weight = 1.0, speed = 1.0) {
        this.isPlaying = true;
        this.timePosition = 0;
        this.weight = Number(weight) || 1.0;
        this.speed = Number(speed) || 1.0;
        if (this.humanoid && this.humanoid._activeAnimationTracks) {
            this.humanoid._activeAnimationTracks.add(this);
        }
    }

    Stop(transitionTime = 0.1) {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        if (this.humanoid && this.humanoid._activeAnimationTracks) {
            this.humanoid._activeAnimationTracks.delete(this);
        }
        this.Stopped.Fire();
    }

    AdjustSpeed(speed = 1.0) {
        this.speed = Number(speed) || 0;
    }

    AdjustWeight(weight = 1.0, transitionTime = 0.1) {
        this.weight = Number(weight) || 1.0;
    }

    Destroy() {
        this.Stop();
    }

    step(dt) {
        if (!this.isPlaying || !this._samples.length) return;
        const prevTime = this.timePosition;
        this.timePosition += dt * this.speed;

        for (const sample of this._samples) {
            if (sample.time > prevTime && sample.time <= this.timePosition) {
                if (sample.name) this.KeyframeReached.Fire(sample.name);
            }
        }

        if (this.timePosition >= this.length) {
            if (this.looped) {
                this.timePosition = this.timePosition % this.length;
                this.DidLoop.Fire();
            } else {
                this.Stop();
            }
        }
    }

    poseAt(trackName, time) {
        const keys = this._samples.filter(s => s.poses.has(trackName));
        if (!keys.length) return null;
        if (time <= keys[0].time) return keys[0].poses.get(trackName);
        if (time >= keys[keys.length - 1].time) return keys[keys.length - 1].poses.get(trackName);
        const nextIndex = keys.findIndex(s => s.time >= time);
        if (nextIndex <= 0) return keys[0].poses.get(trackName);
        const prev = keys[nextIndex - 1];
        const next = keys[nextIndex];
        const alpha = (time - prev.time) / Math.max(1e-6, next.time - prev.time);
        return this._interpolateCFrame(prev.poses.get(trackName), next.poses.get(trackName), alpha);
    }

    _interpolateCFrame(a, b, alpha) {
        if (!a) return b ? b.clone() : new CFrame();
        if (!b) return a ? a.clone() : new CFrame();
        const pos = a.position.lerp(b.position, alpha);
        if (typeof THREE !== 'undefined') {
            const qa = new THREE.Quaternion().setFromEuler(new THREE.Euler(
                (a.orientation.x * Math.PI) / 180,
                (a.orientation.y * Math.PI) / 180,
                (a.orientation.z * Math.PI) / 180,
                'YXZ'
            ));
            const qb = new THREE.Quaternion().setFromEuler(new THREE.Euler(
                (b.orientation.x * Math.PI) / 180,
                (b.orientation.y * Math.PI) / 180,
                (b.orientation.z * Math.PI) / 180,
                'YXZ'
            ));
            const q = qa.slerp(qb, alpha);
            const euler = new THREE.Euler().setFromQuaternion(q, 'YXZ');
            return new CFrame(pos, nearestEulerYXZ(euler, a.orientation));
        }
        return new CFrame(pos, a.orientation.lerp(b.orientation, alpha));
    }
}
'''

# Place AnimationTrack after Humanoid class
humanoid_end_pattern = "TakeDamage(amount) {\n        this.Health = this.Health - amount;\n    }\n"
# Find deserializeProperties
target_humanoid_end = '''    deserializeProperties(props) {
        if (props.health !== undefined) this.health = props.health;
        if (props.maxHealth !== undefined) this.maxHealth = props.maxHealth;
        if (props.walkSpeed !== undefined) this.walkSpeed = props.walkSpeed;
        if (props.jumpPower !== undefined) this.jumpPower = props.jumpPower;
        if (props.hipHeight !== undefined) this.hipHeight = Number(props.hipHeight) || 0;
        if (props.automaticScalingEnabled !== undefined) this.automaticScalingEnabled = Boolean(props.automaticScalingEnabled);
    }
}'''

assert target_humanoid_end in code
code = code.replace(target_humanoid_end, target_humanoid_end + "\n" + track_class, 1)

# Register AnimationTrack
code += "\nInstance.register('AnimationTrack', AnimationTrack);\n"

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated OtherInstances.js successfully')
