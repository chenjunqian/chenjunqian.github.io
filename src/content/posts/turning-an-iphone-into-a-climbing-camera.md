---
title: 'Turning an iPhone into a climbing camera'
description: 'MovTrak exists because climbing footage is usually filmed by a friend with shaky hands. Here is what it takes to make the phone do the framing itself.'
date: 2026-10-24
author: 'Junqian Chen'
tag: 'Build log'
cover: '/images/covers/movtrak.svg'
coverAlt: 'A glowing tracking reticle over a dark mountain ridge'
---

The first time I filmed a bouldering session, the footage was unusable. The phone was propped on a chalk bag, the climber spent half the problem out of frame, and the one good move happened somewhere near the top-left corner. Buying a gimbal felt absurd for something I do twice a week. Building an app felt only slightly less absurd.

MovTrak is that app: point an iPhone at the wall, and it keeps the climber centred while they move.

## The constraint

The whole design falls out of one sentence: **one phone, no operator, no extra hardware.**

That rules out a lot. No depth sensor tricks, no external tracking box, no cloud round-trip. Everything has to happen on-device, in real time, on battery, while the camera is also recording. It also means the app has to degrade gracefully — when the person disappears behind a volume, the camera should hold still rather than panicking across the wall.

## How it works

The pipeline is less exotic than it sounds:

1. **Find the person.** Apple's Vision framework gives a body detection on each frame. No third-party computer-vision dependency, no model download, no privacy tradeoff — the frame never leaves the phone.
2. **Turn a box into a target.** The detected region becomes a target point and a target scale. A person walking left should move the frame left; a person moving closer should pull the frame back a little.
3. **Smooth the motion.** The raw target jitters frame to frame. Feeding it straight into the camera produces exactly the seasick footage the app is supposed to eliminate, so the target is filtered into a slower, deliberate camera move.
4. **Crop and record.** AVFoundation records from a region that the smoothing layer moves. The result feels like a camera operator who is paying attention, not a robot locked onto a bounding box.

The interesting work is all in steps 2 and 3. Detection is a solved problem; *tasteful* tracking is not.

## What was actually hard

**Latency versus smoothness.** Every extra frame of smoothing makes the motion nicer and the framing later. On a fast dyno, a camera that reacts in 400ms has already missed the move. The tuning is a constant negotiation between "cinematic" and "present".

**Detection is not continuous.** Vision loses the subject when they turn, when the wall is busy, when the light drops. A naive implementation snaps the frame to the wall and back. The app instead treats a lost detection as a pause: hold the last good framing, wait, reacquire.

**Thermals.** Real-time vision plus video encoding is a warm combination. Recording a full session on a phone that is also running the detector means thinking about resolution and frame rate as battery decisions, not just quality decisions.

**The boring parts matter.** Orientation changes, interruptions from a phone call, the camera permission flow, the fact that the preview and the recording need to agree about what is in frame. None of that is fun, and all of it is the difference between a demo and an app.

## Where it is

MovTrak is live on the [App Store](https://apps.apple.com/app/movtrak/id6755912677), with a landing page at [movtrak.app](https://movtrak.app). The core loop works: set the phone down, frame the wall, start recording, climb. The next version is about the edges — low light, multiple people in frame, and a way to export a clip that is already trimmed to the interesting part.

If you climb and want to try it, email me. Feedback from people who will actually fall off a wall is worth more than any amount of simulator testing.
