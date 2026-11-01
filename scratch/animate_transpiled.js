// humanoidAnimatePlayEmote.lua

var Figure = script.Parent
var Torso = Figure.WaitForChild("Torso")
var RightShoulder = Torso.WaitForChild("Right Shoulder")
var LeftShoulder = Torso.WaitForChild("Left Shoulder")
var RightHip = Torso.WaitForChild("Right Hip")
var LeftHip = Torso.WaitForChild("Left Hip")
var Neck = Torso.WaitForChild("Neck")
var Humanoid = Figure.WaitForChild("Humanoid")
var pose = "Standing"

var FFlagUserAnimateRemoveEmoteChatHook
do
	var [success, result] = [pcall(async () => {]
		return UserSettings().IsUserFeatureEnabled("UserAnimateRemoveEmoteChatHook")
	})
	FFlagUserAnimateRemoveEmoteChatHook = success && result
}

var EMOTE_TRANSITION_TIME = 0.1

async function getRigScale() {
	return Figure.GetScale()
}

var currentAnim = ""
var currentAnimInstance = null
var currentAnimTrack = null
var currentAnimKeyframeHandler = null
var currentAnimSpeed = 1.0
var animTable = {}
var animNames = { 
	idle = 	{	
				{ id = "http://www.roblox.com/asset/?id=180435571", weight = 9 },
				{ id = "http://www.roblox.com/asset/?id=180435792", weight = 1 }
			},
	walk = 	{ 	
				{ id = "http://www.roblox.com/asset/?id=180426354", weight = 10 } 
			}, 
	run = 	{
				{ id = "run.xml", weight = 10 } 
			}, 
	jump = 	{
				{ id = "http://www.roblox.com/asset/?id=125750702", weight = 10 } 
			}, 
	fall = 	{
				{ id = "http://www.roblox.com/asset/?id=180436148", weight = 10 } 
			}, 
	climb = {
				{ id = "http://www.roblox.com/asset/?id=180436334", weight = 10 } 
			}, 
	sit = 	{
				{ id = "http://www.roblox.com/asset/?id=178130996", weight = 10 } 
			},	
	toolnone = {
				{ id = "http://www.roblox.com/asset/?id=182393478", weight = 10 } 
			},
	toolslash = {
				{ id = "http://www.roblox.com/asset/?id=129967390", weight = 10 } 
//				{ id = "slash.xml", weight = 10 } 
			},
	toollunge = {
				{ id = "http://www.roblox.com/asset/?id=129967478", weight = 10 } 
			},
	wave = {
				{ id = "http://www.roblox.com/asset/?id=128777973", weight = 10 } 
			},
	point = {
				{ id = "http://www.roblox.com/asset/?id=128853357", weight = 10 } 
			},
	dance1 = {
				{ id = "http://www.roblox.com/asset/?id=182435998", weight = 10 }, 
				{ id = "http://www.roblox.com/asset/?id=182491037", weight = 10 }, 
				{ id = "http://www.roblox.com/asset/?id=182491065", weight = 10 } 
			},
	dance2 = {
				{ id = "http://www.roblox.com/asset/?id=182436842", weight = 10 }, 
				{ id = "http://www.roblox.com/asset/?id=182491248", weight = 10 }, 
				{ id = "http://www.roblox.com/asset/?id=182491277", weight = 10 } 
			},
	dance3 = {
				{ id = "http://www.roblox.com/asset/?id=182436935", weight = 10 }, 
				{ id = "http://www.roblox.com/asset/?id=182491368", weight = 10 }, 
				{ id = "http://www.roblox.com/asset/?id=182491423", weight = 10 } 
			},
	laugh = {
				{ id = "http://www.roblox.com/asset/?id=129423131", weight = 10 } 
			},
	cheer = {
				{ id = "http://www.roblox.com/asset/?id=129423030", weight = 10 } 
			},
}
var dances = {"dance1", "dance2", "dance3"}

// Existance in this list signifies that it is an emote, the value indicates if it is a looping emote
var emoteNames = { wave = false, point = false, dance1 = true, dance2 = true, dance3 = true, laugh = false, cheer = false}

async function configureAnimationSet(name, fileList) {
	if ((animTable[name] !== null)) {
		for (var [_, connection] of pairs(animTable[name].connections)) {
			connection.disconnect()
		}
	}
	animTable[name] = {}
	animTable[name].count = 0
	animTable[name].totalWeight = 0	
	animTable[name].connections = {}

	// check for config values
	var config = script.FindFirstChild(name)
	if ((config !== null)) {
//		print("Loading anims " + name)
		table.insert(animTable[name].connections, config.ChildAdded.Connect(async (child) => { configureAnimationSet(name, fileList) }))
		table.insert(animTable[name].connections, config.ChildRemoved.Connect(async (child) => { configureAnimationSet(name, fileList) }))
		var idx = 1
		for (var [_, childPart] of pairs(config.GetChildren())) {
			if ((childPart.IsA("Animation"))) {
				table.insert(animTable[name].connections, childPart.Changed.Connect(async (property) => { configureAnimationSet(name, fileList) }))
				animTable[name][idx] = {}
				animTable[name][idx].anim = childPart
				var weightObject = childPart.FindFirstChild("Weight")
				if ((weightObject == null)) {
					animTable[name][idx].weight = 1
				} else {
					animTable[name][idx].weight = weightObject.Value
				}
				animTable[name].count = animTable[name].count + 1
				animTable[name].totalWeight = animTable[name].totalWeight + animTable[name][idx].weight
	//			print(name + " [" + idx + "] " + animTable[name][idx].anim.AnimationId + " (" + animTable[name][idx].weight + ")")
				idx = idx + 1
			}
		}
	}

	// fallback to defaults
	if ((animTable[name].count <= 0)) {
		for (var [idx, anim] of pairs(fileList)) {
			animTable[name][idx] = {}
			animTable[name][idx].anim = Instance.new("Animation")
			animTable[name][idx].anim.Name = name
			animTable[name][idx].anim.AnimationId = anim.id
			animTable[name][idx].weight = anim.weight
			animTable[name].count = animTable[name].count + 1
			animTable[name].totalWeight = animTable[name].totalWeight + anim.weight
//			print(name + " [" + idx + "] " + anim.id + " (" + anim.weight + ")")
		}
	}
}

// Setup animation objects
async function scriptChildModified(child) {
	var fileList = animNames[child.Name]
	if ((fileList !== null)) {
		configureAnimationSet(child.Name, fileList)
	}	
}

script.ChildAdded.connect(scriptChildModified)
script.ChildRemoved.connect(scriptChildModified)

// Clear any existing animation tracks
// Fixes issue with characters that are moved in && out of the Workspace accumulating tracks
var animator = if (Humanoid) { Humanoid.FindFirstChildOfClass("Animator") } else { null
if (animator) {
	var animTracks = animator.GetPlayingAnimationTracks()
	for (var [i, track] of ipairs(animTracks)) {
		track.Stop(0)
		track.Destroy()
	}
}


for (var [name, fileList] of pairs(animNames)) { 
	configureAnimationSet(name, fileList)
}	

// ANIMATION

// declarations
var toolAnim = "None"
var toolAnimTime = 0

var jumpAnimTime = 0
var jumpAnimDuration = 0.3

var toolTransitionTime = 0.1
var fallTransitionTime = 0.3
var jumpMaxLimbVelocity = 0.75

// functions

async function stopAllAnimations() {
	var oldAnim = currentAnim

	// return to idle if finishing an emote
	if ((emoteNames[oldAnim] !== null && emoteNames[oldAnim] == false)) {
		oldAnim = "idle"
	}

	currentAnim = ""
	currentAnimInstance = null
	if ((currentAnimKeyframeHandler !== null)) {
		currentAnimKeyframeHandler.disconnect()
	}

	if ((currentAnimTrack !== null)) {
		currentAnimTrack.Stop()
		currentAnimTrack.Destroy()
		currentAnimTrack = null
	}
	return oldAnim
}

async function setAnimationSpeed(speed) {
	if (speed !== currentAnimSpeed) {
		currentAnimSpeed = speed
		currentAnimTrack.AdjustSpeed(currentAnimSpeed)
	}
}

async function keyFrameReachedFunc(frameName) {
	if ((frameName == "End")) {

		var repeatAnim = currentAnim
		// return to idle if finishing an emote
		if ((emoteNames[repeatAnim] !== null && emoteNames[repeatAnim] == false)) {
			repeatAnim = "idle"
		}
		
		var animSpeed = currentAnimSpeed
		playAnimation(repeatAnim, 0.0, Humanoid)
		setAnimationSpeed(animSpeed)
	}
}

// Preload animations
async function playAnimation(animName, transitionTime, humanoid) { 
		
	var roll = math.random(1, animTable[animName].totalWeight) 
	var origRoll = roll
	var idx = 1
	while ((roll > animTable[animName][idx].weight)) {
		roll = roll - animTable[animName][idx].weight
		idx = idx + 1
	}
//		print(animName + " " + idx + " [" + origRoll + "]")
	var anim = animTable[animName][idx].anim

	// switch animation		
	if ((anim !== currentAnimInstance)) {
		
		if ((currentAnimTrack !== null)) {
			currentAnimTrack.Stop(transitionTime)
			currentAnimTrack.Destroy()
		}

		currentAnimSpeed = 1.0
	
		// load it to the humanoid; get AnimationTrack
		currentAnimTrack = humanoid.LoadAnimation(anim)
		currentAnimTrack.Priority = Enum.AnimationPriority.Core
		 
		// play the animation
		currentAnimTrack.Play(transitionTime)
		currentAnim = animName
		currentAnimInstance = anim

		// set up keyframe name triggers
		if ((currentAnimKeyframeHandler !== null)) {
			currentAnimKeyframeHandler.disconnect()
		}
		currentAnimKeyframeHandler = currentAnimTrack.KeyframeReached.connect(keyFrameReachedFunc)
		
	}

}

//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------

var toolAnimName = ""
var toolAnimTrack = null
var toolAnimInstance = null
var currentToolAnimKeyframeHandler = null

async function toolKeyFrameReachedFunc(frameName) {
	if ((frameName == "End")) {
//		print("Keyframe : " + frameName)	
		playToolAnimation(toolAnimName, 0.0, Humanoid)
	}
}


async function playToolAnimation(animName, transitionTime, humanoid, priority) {	 
		
		var roll = math.random(1, animTable[animName].totalWeight) 
		var origRoll = roll
		var idx = 1
		while ((roll > animTable[animName][idx].weight)) {
			roll = roll - animTable[animName][idx].weight
			idx = idx + 1
		}
//		print(animName + " * " + idx + " [" + origRoll + "]")
		var anim = animTable[animName][idx].anim

		if ((toolAnimInstance !== anim)) {
			
			if ((toolAnimTrack !== null)) {
				toolAnimTrack.Stop()
				toolAnimTrack.Destroy()
				transitionTime = 0
			}
					
			// load it to the humanoid; get AnimationTrack
			toolAnimTrack = humanoid.LoadAnimation(anim)
			if (priority) {
				toolAnimTrack.Priority = priority
			}
			 
			// play the animation
			toolAnimTrack.Play(transitionTime)
			toolAnimName = animName
			toolAnimInstance = anim

			currentToolAnimKeyframeHandler = toolAnimTrack.KeyframeReached.connect(toolKeyFrameReachedFunc)
		}
}

async function stopToolAnimations() {
	var oldAnim = toolAnimName

	if ((currentToolAnimKeyframeHandler !== null)) {
		currentToolAnimKeyframeHandler.disconnect()
	}

	toolAnimName = ""
	toolAnimInstance = null
	if ((toolAnimTrack !== null)) {
		toolAnimTrack.Stop()
		toolAnimTrack.Destroy()
		toolAnimTrack = null
	}


	return oldAnim
}

//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------


async function onRunning(speed) {
	speed /= getRigScale()
	
	if (speed > 0.01) {
		playAnimation("walk", 0.1, Humanoid)
		if (currentAnimInstance && currentAnimInstance.AnimationId == "http://www.roblox.com/asset/?id=180426354") {
			setAnimationSpeed(speed / 14.5)
		}
		pose = "Running"
	else
		if (emoteNames[currentAnim] == null) {
			playAnimation("idle", 0.1, Humanoid)
			pose = "Standing"
		}
	}
}

async function onDied() {
	pose = "Dead"
}

async function onJumping() {
	playAnimation("jump", 0.1, Humanoid)
	jumpAnimTime = jumpAnimDuration
	pose = "Jumping"
}

async function onClimbing(speed) {
	speed /= getRigScale()
	
	playAnimation("climb", 0.1, Humanoid)
	setAnimationSpeed(speed / 12.0)
	pose = "Climbing"
}

async function onGettingUp() {
	pose = "GettingUp"
}

async function onFreeFall() {
	if ((jumpAnimTime <= 0)) {
		playAnimation("fall", fallTransitionTime, Humanoid)
	}
	pose = "FreeFall"
}

async function onFallingDown() {
	pose = "FallingDown"
}

async function onSeated() {
	pose = "Seated"
}

async function onPlatformStanding() {
	pose = "PlatformStanding"
}

async function onSwimming(speed) {
	if (speed > 0) {
		pose = "Running"
	} else {
		pose = "Standing"
	}
}

async function getTool() {	
	for (var [_, kid] of ipairs(Figure.GetChildren())) {
		if (kid.className == "Tool") { return kid }
	}
	return null
}

async function getToolAnim(tool) {
	for (var [_, c] of ipairs(tool.GetChildren())) {
		if (c.Name == "toolanim" && c.className == "StringValue") {
			return c
		}
	}
	return null
}

async function animateTool() {
	
	if ((toolAnim == "None")) {
		playToolAnimation("toolnone", toolTransitionTime, Humanoid, Enum.AnimationPriority.Idle)
		return
	}

	if ((toolAnim == "Slash")) {
		playToolAnimation("toolslash", 0, Humanoid, Enum.AnimationPriority.Action)
		return
	}

	if ((toolAnim == "Lunge")) {
		playToolAnimation("toollunge", 0, Humanoid, Enum.AnimationPriority.Action)
		return
	}
}

async function moveSit() {
	RightShoulder.MaxVelocity = 0.15
	LeftShoulder.MaxVelocity = 0.15
	RightShoulder.SetDesiredAngle(3.14 /2)
	LeftShoulder.SetDesiredAngle(-3.14 /2)
	RightHip.SetDesiredAngle(3.14 /2)
	LeftHip.SetDesiredAngle(-3.14 /2)
}

var lastTick = 0

async function move(time) {
	var amplitude = 1
	var frequency = 1
  	var deltaTime = time - lastTick
  	lastTick = time

	var climbFudge = 0
	var setAngles = false

  	if ((jumpAnimTime > 0)) {
  		jumpAnimTime = jumpAnimTime - deltaTime
  	}

	if ((pose == "FreeFall" && jumpAnimTime <= 0)) {
		playAnimation("fall", fallTransitionTime, Humanoid)
	} else if ((pose == "Seated")) {
		playAnimation("sit", 0.5, Humanoid)
		return
	} else if ((pose == "Running")) {
		playAnimation("walk", 0.1, Humanoid)
	} else if ((pose == "Dead" || pose == "GettingUp" || pose == "FallingDown" || pose == "Seated" || pose == "PlatformStanding")) {
//		print("Wha " + pose)
		stopAllAnimations()
		amplitude = 0.1
		frequency = 1
		setAngles = true
	}

	if ((setAngles)) {
		var desiredAngle = amplitude * math.sin(time * frequency)

		RightShoulder.SetDesiredAngle(desiredAngle + climbFudge)
		LeftShoulder.SetDesiredAngle(desiredAngle - climbFudge)
		RightHip.SetDesiredAngle(-desiredAngle)
		LeftHip.SetDesiredAngle(-desiredAngle)
	}

	// Tool Animation handling
	var tool = getTool()
	if (tool && tool.FindFirstChild("Handle")) {
	
		var animStringValueObject = getToolAnim(tool)

		if (animStringValueObject) {
			toolAnim = animStringValueObject.Value
			// message recieved, delete StringValue
			animStringValueObject.Parent = null
			toolAnimTime = time + .3
		}

		if (time > toolAnimTime) {
			toolAnimTime = 0
			toolAnim = "None"
		}

		animateTool()		
	} else {
		stopToolAnimations()
		toolAnim = "None"
		toolAnimInstance = null
		toolAnimTime = 0
	}
}

// connect events
Humanoid.Died.connect(onDied)
Humanoid.Running.connect(onRunning)
Humanoid.Jumping.connect(onJumping)
Humanoid.Climbing.connect(onClimbing)
Humanoid.GettingUp.connect(onGettingUp)
Humanoid.FreeFalling.connect(onFreeFall)
Humanoid.FallingDown.connect(onFallingDown)
Humanoid.Seated.connect(onSeated)
Humanoid.PlatformStanding.connect(onPlatformStanding)
Humanoid.Swimming.connect(onSwimming)

if (! FFlagUserAnimateRemoveEmoteChatHook) {
	//-- setup emote chat hook
	game.GetService("Players").LocalPlayer.Chatted.Connect(async (msg) => {
		var emote = ""
		if (msg == "/e dance") {
			emote = dances[math.random(1, #dances)]
		} else if ((string.sub(msg, 1, 3) == "/e ")) {
			emote = string.sub(msg, 4)
		} else if ((string.sub(msg, 1, 7) == "/emote ")) {
			emote = string.sub(msg, 8)
		}
		
		if ((pose == "Standing" && emoteNames[emote] !== null)) {
			playAnimation(emote, 0.1, Humanoid)
		}
	})
}

// emote bindable hook
script.WaitForChild("PlayEmote").OnInvoke = async (emote) => {
	// Only play emotes when idling
	if (pose !== "Standing") {
		return
	}
	if (emoteNames[emote] !== null) {
		// Default emotes
		playAnimation(emote, EMOTE_TRANSITION_TIME, Humanoid)

		return true, currentAnimTrack
	}

	// Return false to indicate that the emote could ! be played
	return false
}
// main program

// initialize to idle
playAnimation("idle", 0.1, Humanoid)
pose = "Standing"

while (Figure.Parent !== null) {
	var [_, time] = [await wait(0.1)]
	move(time)
}


