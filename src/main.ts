import './style.css'
import * as THREE from 'three'
import { Text } from 'troika-three-text'
import { createNoise3D } from 'simplex-noise';
import { Pane } from 'tweakpane';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene()

// --- Tweakpane Parameters --- (Replaces Configuration Constants)
const PARAMS = {
    // Radii
    radiusSeconds: 1.8,
    radiusMinutes: 1.4,
    radiusHours: 1.0,
    splineRadiusFactor: 0.9,
    // Z Coords (Might not need tweaking, but can add)
    zCoordSeconds: 0,
    zCoordMinutes: -0.8,
    zCoordHours: -1.6,
    // Colors (Using hex numbers)
    baseColorSeconds: 0xffffff,
    baseColorMinutes: 0xaaaaff,
    baseColorHours: 0xffffaa,
    highlightColor: 0xffaa00,
    fontSize: 0.1,
    // Noise Seconds
    noiseFreqSec: 0.1,
    noiseAmpSec: 0.12,
    // Noise Minutes
    noiseFreqMin: 0.08,
    noiseAmpMin: 0.18,
    // Noise Hours
    noiseFreqHrs: 0.05,
    noiseAmpHrs: 0.22,
    // Neighbor Push
    pushFactor: 0.05,
    pushDecay: 0.9,
    // Scale Spring
    scaleStiffness: 150,
    scaleDamping: 0.26,
    // Lerp Factors
    offsetLerp: 0.01,
    angleLerp: 0.1
};

// Initialize Noise Functions
const noiseSeconds = createNoise3D();
const noiseMinutes = createNoise3D();
const noiseHours = createNoise3D();

// Groups to hold text meshes and control rotation
const secondsGroup = new THREE.Group();
const minutesGroup = new THREE.Group();
const hoursGroup = new THREE.Group();
scene.add(secondsGroup, minutesGroup, hoursGroup);

// Re-introduce Arrays to hold text meshes for individual rotation correction
const secondTexts: Text[] = [];
const minuteTexts: Text[] = [];
const hourTexts: Text[] = []; // Will hold 0-23

// --- Spline Objects ---
const curveSegments = 128; // Number of segments for the smooth curve

// Materials
const splineMatSeconds = new THREE.LineBasicMaterial({ color: PARAMS.baseColorSeconds });
const splineMatMinutes = new THREE.LineBasicMaterial({ color: PARAMS.baseColorMinutes });
const splineMatHours = new THREE.LineBasicMaterial({ color: PARAMS.baseColorHours });

// Geometries (Update size for curve segments)
const splineGeomSeconds = new THREE.BufferGeometry();
splineGeomSeconds.setAttribute('position', new THREE.BufferAttribute(new Float32Array((curveSegments + 1) * 3), 3));
const splineGeomMinutes = new THREE.BufferGeometry();
splineGeomMinutes.setAttribute('position', new THREE.BufferAttribute(new Float32Array((curveSegments + 1) * 3), 3));
const splineGeomHours = new THREE.BufferGeometry();
splineGeomHours.setAttribute('position', new THREE.BufferAttribute(new Float32Array((curveSegments + 1) * 3), 3));

// Lines
const splineSeconds = new THREE.Line(splineGeomSeconds, splineMatSeconds);
const splineMinutes = new THREE.Line(splineGeomMinutes, splineMatMinutes);
const splineHours = new THREE.Line(splineGeomHours, splineMatHours);

// Add lines to the scene
scene.add(splineSeconds, splineMinutes, splineHours);

// Helper function to create text
function createClockText(value: number, radius: number, baseColor: number | string, digits: number = 2) { // Default digits to 2
  console.log(radius);
  const textMesh = new Text();
    // Format number with leading zeros to ensure 2 digits
    textMesh.text = String(value).padStart(digits, '0');
    textMesh.fontSize = PARAMS.fontSize;
    textMesh.color = baseColor;
    textMesh.anchorX = 'center';
    textMesh.anchorY = 'middle';
    textMesh.userData.targetScale = 1;
    textMesh.userData.currentScale = 1;
    textMesh.userData.scaleVelocity = 0;
    textMesh.userData.targetAngleOffset = 0;
    textMesh.userData.currentAngleOffset = 0;
    return textMesh;
}

// Function to calculate position on a circle (relative to group center)
function positionText(textMesh: Text, value: number, totalUnits: number, radius: number) {
    const angle = (Math.PI / 2) - (value / totalUnits) * Math.PI * 2;
    // Initial positioning still uses the initial radius value from PARAMS
    textMesh.position.x = radius * Math.cos(angle);
    textMesh.position.y = radius * Math.sin(angle);
    textMesh.userData.initialAngle = angle;
    textMesh.scale.set(1, 1, 1);
    textMesh.sync();
}

// Set Z positions for the groups using PARAMS
secondsGroup.position.z = PARAMS.zCoordSeconds;
minutesGroup.position.z = PARAMS.zCoordMinutes;
hoursGroup.position.z = PARAMS.zCoordHours;

// Create Seconds Text (0-59)
for (let i = 0; i < 60; i++) {
    const secondText = createClockText(i, PARAMS.radiusSeconds, PARAMS.baseColorSeconds, 2); // Explicitly pass digits=2
    positionText(secondText, i, 60, PARAMS.radiusSeconds);
    secondsGroup.add(secondText);
    secondTexts.push(secondText);
}

// Create Minutes Text (0-59)
for (let i = 0; i < 60; i++) {
    const minuteText = createClockText(i, PARAMS.radiusMinutes, PARAMS.baseColorMinutes, 2); // Explicitly pass digits=2
    positionText(minuteText, i, 60, PARAMS.radiusMinutes);
    minutesGroup.add(minuteText);
    minuteTexts.push(minuteText);
}

// Create Hours Text (00-23)
for (let i = 0; i < 24; i++) { // Loop 0-23
    const hourText = createClockText(i, PARAMS.radiusHours, PARAMS.baseColorHours, 2); // Pass digits=2
    // Angle calculation uses value i (0-23) and totalUnits 24
    positionText(hourText, i, 24, PARAMS.radiusHours);
    hoursGroup.add(hourText);
    hourTexts.push(hourText);
}

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
// scene.add(camera) // Add camera to rig instead

// Camera Rig
const cameraRig = new THREE.Group();
cameraRig.add(camera);
scene.add(cameraRig);

// Renderer
const canvas = document.querySelector('#app') as HTMLCanvasElement
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Orbit Controls (still controls the camera object)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional: Adds smoothing to the movement

// --- Mouse Position Tracking ---
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    // Normalize mouse position to -1 -> +1 range
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1; // Y is inverted
});

// Resize listener AFTER renderer initialization
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// --- Tweakpane Setup ---
const pane: any = new Pane();
pane.hidden = true; // Start hidden

const generalFolder = pane.addFolder({ title: 'General' });
generalFolder.addBinding(PARAMS, 'fontSize', { min: 0.01, max: 0.5 })
    .on('change', () => {
        secondTexts.forEach(text => text.fontSize = PARAMS.fontSize);
        minuteTexts.forEach(text => text.fontSize = PARAMS.fontSize);
        hourTexts.forEach(text => text.fontSize = PARAMS.fontSize);
    });


const radiiFolder = pane.addFolder({ title: 'Radii & Z' });
radiiFolder.addBinding(PARAMS, 'radiusSeconds', { min: 0.5, max: 3 });
radiiFolder.addBinding(PARAMS, 'radiusMinutes', { min: 0.5, max: 3 });
radiiFolder.addBinding(PARAMS, 'radiusHours', { min: 0.5, max: 3 });
radiiFolder.addBinding(PARAMS, 'splineRadiusFactor', { min: 0.5, max: 1, label: 'Spline Radius %' });
radiiFolder.addBinding(PARAMS, 'zCoordSeconds', { min: -10, max: 10 })
    .on('change', () => {
        secondsGroup.position.z = PARAMS.zCoordSeconds;
    });
radiiFolder.addBinding(PARAMS, 'zCoordMinutes', { min: -10, max: 10 })
    .on('change', () => {
        minutesGroup.position.z = PARAMS.zCoordMinutes;
    });
radiiFolder.addBinding(PARAMS, 'zCoordHours', { min: -10, max: 10 })
    .on('change', () => {
        hoursGroup.position.z = PARAMS.zCoordHours;
    });

const colorsFolder = pane.addFolder({ title: 'Colors' });
colorsFolder.addBinding(PARAMS, 'baseColorSeconds', { view: 'color' });
colorsFolder.addBinding(PARAMS, 'baseColorMinutes', { view: 'color' });
colorsFolder.addBinding(PARAMS, 'baseColorHours', { view: 'color' });
colorsFolder.addBinding(PARAMS, 'highlightColor', { view: 'color' });

const noiseFolder = pane.addFolder({ title: 'Noise' });
const noiseSecFolder = noiseFolder.addFolder({ title: 'Seconds Noise' });
noiseSecFolder.addBinding(PARAMS, 'noiseFreqSec', { min: 0, max: 1 });
noiseSecFolder.addBinding(PARAMS, 'noiseAmpSec', { min: 0, max: 0.5 });
const noiseMinFolder = noiseFolder.addFolder({ title: 'Minutes Noise' });
noiseMinFolder.addBinding(PARAMS, 'noiseFreqMin', { min: 0, max: 1 });
noiseMinFolder.addBinding(PARAMS, 'noiseAmpMin', { min: 0, max: 0.5 });
const noiseHrsFolder = noiseFolder.addFolder({ title: 'Hours Noise' });
noiseHrsFolder.addBinding(PARAMS, 'noiseFreqHrs', { min: 0, max: 1 });
noiseHrsFolder.addBinding(PARAMS, 'noiseAmpHrs', { min: 0, max: 0.5 });

const pushFolder = pane.addFolder({ title: 'Neighbor Push' });
pushFolder.addBinding(PARAMS, 'pushFactor', { min: 0, max: 0.2 });
pushFolder.addBinding(PARAMS, 'pushDecay', { min: 0, max: 1 });

const animFolder = pane.addFolder({ title: 'Animation' });
animFolder.addBinding(PARAMS, 'scaleStiffness', { min: 10, max: 500 });
animFolder.addBinding(PARAMS, 'scaleDamping', { min: 0, max: 1 });
animFolder.addBinding(PARAMS, 'offsetLerp', { min: 0.01, max: 0.5 });
animFolder.addBinding(PARAMS, 'angleLerp', { min: 0.01, max: 0.5 });

// Add keydown listener to toggle pane visibility
window.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
        pane.hidden = !pane.hidden;
    }
});

// Animation State for Lerping Minutes/Hours
let currentMinutesAngle = 0;
let currentHoursAngle = 0;
let targetMinutesAngle = 0;
let targetHoursAngle = 0;

// Clock for elapsed time
const clock = new THREE.Clock();

// Helper function for shortest angle lerp
function lerpAngle(current: number, target: number, factor: number): number {
    let delta = target - current;
    // Ensure shortest path around the circle
    if (delta > Math.PI) { delta -= Math.PI * 2; }
    if (delta < -Math.PI) { delta += Math.PI * 2; }
    current += delta * factor;
    // Keep angle within 0 to 2*PI range (optional, but good practice)
    // current = (current + Math.PI * 2) % (Math.PI * 2);
    return current;
}

// --- Parallax Configuration ---
const parallaxAmount = 0.3; // Max rotation in radians
const parallaxSpeed = 5.0;  // Speed for lerping camera rotation (higher = faster)

const tick = () => {
    const deltaTime = clock.getDelta(); // Time since last frame
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update(); // OrbitControls update first

    // --- Apply Mouse Parallax to Camera Rig (Frame-rate independent) ---
    // Calculate target rotation based on mouse position
    const targetRotationX = mouse.y * parallaxAmount;
    const targetRotationY = mouse.x * parallaxAmount;

    // Lerp camera rig rotation towards target using deltaTime
    const lerpFactor = 1 - Math.exp(-parallaxSpeed * deltaTime);
    cameraRig.rotation.x = THREE.MathUtils.lerp(cameraRig.rotation.x, targetRotationX, lerpFactor); // Apply to rig
    cameraRig.rotation.y = THREE.MathUtils.lerp(cameraRig.rotation.y, targetRotationY, lerpFactor); // Apply to rig

    const now = new Date();
    const currentMillisecond = now.getMilliseconds();
    const currentSecond = now.getSeconds();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours(); // 0-23

    // --- Update Target Scales ---
    secondTexts.forEach((text, index) => {
        text.userData.targetScale = (index === currentSecond) ? 3 : 1;
    });
    minuteTexts.forEach((text, index) => {
        text.userData.targetScale = (index === currentMinute) ? 3 : 1;
    });
    hourTexts.forEach((text, index) => {
        text.userData.targetScale = (index === currentHour) ? 3 : 1;
    });

    // --- Seconds (Smooth Rotation + Noise Radius + Spring Scale + Smooth Propagating Push Offset) ---
    const secondsFraction = currentSecond + currentMillisecond / 1000;
    const secondsAngle = (secondsFraction / 60) * Math.PI * 2;
    secondsGroup.rotation.z = secondsAngle;
    secondTexts.forEach((text, index) => {
        // Calculate the TARGET angle offset based on current highlight
        const highlightedIndex = currentSecond;
        const totalUnits = 60;
        let targetAngleOffset = 0;
        const highlightedScale = secondTexts[highlightedIndex].userData.currentScale as number;
        if (index !== highlightedIndex) {
            let diff = index - highlightedIndex;
            if (diff > totalUnits / 2) diff -= totalUnits;
            else if (diff < -totalUnits / 2) diff += totalUnits;
            const wrappedDistance = Math.abs(diff);
            const sign = Math.sign(diff);
            const basePushStrength = Math.max(0, highlightedScale - 1) * PARAMS.pushFactor;
            const decayedStrength = basePushStrength * Math.pow(PARAMS.pushDecay, Math.max(0, wrappedDistance - 1));
            targetAngleOffset = -sign * decayedStrength;
        }
        text.userData.targetAngleOffset = targetAngleOffset; // Store target

        // Lerp the CURRENT angle offset towards the target
        let currentAngleOffset = text.userData.currentAngleOffset as number;
        currentAngleOffset = lerpAngle(currentAngleOffset, targetAngleOffset, PARAMS.offsetLerp);
        text.userData.currentAngleOffset = currentAngleOffset;

        const initialAngle = text.userData.initialAngle as number;
        // Use the LERPED offset for positioning
        const finalAngle = initialAngle + currentAngleOffset;

        // Individual noise calculation for radius
        const noiseVal = noiseSeconds(Math.cos(initialAngle), Math.sin(initialAngle), elapsedTime * PARAMS.noiseFreqSec);
        const radiusScaleFactor = 1 + noiseVal * PARAMS.noiseAmpSec;
        const dynamicRadius = PARAMS.radiusSeconds * radiusScaleFactor;

        // Update position based on noise radius and SMOOTH push angle
        text.position.x = dynamicRadius * Math.cos(finalAngle);
        text.position.y = dynamicRadius * Math.sin(finalAngle);

        // Set color based on highlight
        text.color = (index === currentSecond) ? PARAMS.highlightColor : PARAMS.baseColorSeconds;

        // Spring scale calculation
        const targetScale = text.userData.targetScale as number;
        let currentScale = text.userData.currentScale as number;
        let scaleVelocity = text.userData.scaleVelocity as number;

        const force = (targetScale - currentScale) * PARAMS.scaleStiffness;
        scaleVelocity += force * deltaTime;      // Acceleration (mass = 1)
        scaleVelocity *= (1 - PARAMS.scaleDamping);           // Apply damping
        currentScale += scaleVelocity * deltaTime; // Update scale based on velocity

        text.userData.currentScale = currentScale;
        text.userData.scaleVelocity = scaleVelocity;
        text.scale.set(currentScale, currentScale, 1);

        // Remove Billboard effect
        // text.quaternion.copy(camera.quaternion);

        // Restore Counter-rotation
        text.rotation.z = -secondsAngle;
    });

    // --- Minutes & Hours (Lerped Rotation + Noise Radius + Spring Scale + Smooth Propagating Push Offset) ---

    // Calculate discrete target angles
    targetMinutesAngle = (currentMinute / 60) * Math.PI * 2;
    targetHoursAngle = (currentHour / 24) * Math.PI * 2; // Use 24 divisions

    // Lerp current angles towards target angles
    currentMinutesAngle = lerpAngle(currentMinutesAngle, targetMinutesAngle, PARAMS.angleLerp);
    currentHoursAngle = lerpAngle(currentHoursAngle, targetHoursAngle, PARAMS.angleLerp);

    // Apply interpolated angles
    minutesGroup.rotation.z = currentMinutesAngle;
    hoursGroup.rotation.z = currentHoursAngle;

    // Process Minutes
    minuteTexts.forEach((text, index) => {
        // Calculate TARGET offset
        const highlightedIndex = currentMinute;
        const totalUnits = 60;
        let targetAngleOffset = 0;
        const highlightedScale = minuteTexts[highlightedIndex].userData.currentScale as number;
        if (index !== highlightedIndex) {
            let diff = index - highlightedIndex;
            if (diff > totalUnits / 2) diff -= totalUnits;
            else if (diff < -totalUnits / 2) diff += totalUnits;
            const wrappedDistance = Math.abs(diff);
            const sign = Math.sign(diff);
            const basePushStrength = Math.max(0, highlightedScale - 1) * PARAMS.pushFactor;
            const decayedStrength = basePushStrength * Math.pow(PARAMS.pushDecay, Math.max(0, wrappedDistance - 1));
            targetAngleOffset = -sign * decayedStrength;
        }
        text.userData.targetAngleOffset = targetAngleOffset;

        // Lerp CURRENT offset
        let currentAngleOffset = text.userData.currentAngleOffset as number;
        currentAngleOffset = lerpAngle(currentAngleOffset, targetAngleOffset, PARAMS.offsetLerp);
        text.userData.currentAngleOffset = currentAngleOffset;

        const initialAngle = text.userData.initialAngle as number;
        // Use LERPED offset
        const finalAngle = initialAngle + currentAngleOffset;

        // Individual noise calculation for radius
        const noiseVal = noiseMinutes(Math.cos(initialAngle) + 10, Math.sin(initialAngle) + 10, elapsedTime * PARAMS.noiseFreqMin);
        const radiusScaleFactor = 1 + noiseVal * PARAMS.noiseAmpMin;
        const dynamicRadius = PARAMS.radiusMinutes * radiusScaleFactor;

        // Update position
        text.position.x = dynamicRadius * Math.cos(finalAngle);
        text.position.y = dynamicRadius * Math.sin(finalAngle);

        // Set color based on highlight
        text.color = (index === currentMinute) ? PARAMS.highlightColor : PARAMS.baseColorMinutes;

        // Spring scale calculation
        const targetScale = text.userData.targetScale as number;
        let currentScale = text.userData.currentScale as number;
        let scaleVelocity = text.userData.scaleVelocity as number;

        const force = (targetScale - currentScale) * PARAMS.scaleStiffness;
        scaleVelocity += force * deltaTime;
        scaleVelocity *= (1 - PARAMS.scaleDamping);
        currentScale += scaleVelocity * deltaTime;

        text.userData.currentScale = currentScale;
        text.userData.scaleVelocity = scaleVelocity;
        text.scale.set(currentScale, currentScale, 1);

        // Remove Billboard effect
        // text.quaternion.copy(camera.quaternion);

        // Restore Counter-rotation
        text.rotation.z = -currentMinutesAngle;
    });

    // Process Hours
    hourTexts.forEach((text, index) => {
        // Calculate TARGET offset
        const highlightedIndex = currentHour; // Use currentHour directly
        const totalUnits = 24; // Use 24 units
        let targetAngleOffset = 0;
        // Ensure highlightedScale lookup uses the correct index if hourTexts holds 0-23
        const highlightedScale = hourTexts[highlightedIndex].userData.currentScale as number;
        if (index !== highlightedIndex) {
            let diff = index - highlightedIndex;
            if (diff > totalUnits / 2) diff -= totalUnits;
            else if (diff < -totalUnits / 2) diff += totalUnits;
            const wrappedDistance = Math.abs(diff);
            const sign = Math.sign(diff);
            const basePushStrength = Math.max(0, highlightedScale - 1) * PARAMS.pushFactor;
            const decayedStrength = basePushStrength * Math.pow(PARAMS.pushDecay, Math.max(0, wrappedDistance - 1));
            targetAngleOffset = -sign * decayedStrength;
        }
        text.userData.targetAngleOffset = targetAngleOffset;

        // Lerp CURRENT offset
        let currentAngleOffset = text.userData.currentAngleOffset as number;
        currentAngleOffset = lerpAngle(currentAngleOffset, targetAngleOffset, PARAMS.offsetLerp);
        text.userData.currentAngleOffset = currentAngleOffset;

        const initialAngle = text.userData.initialAngle as number;
        // Use LERPED offset
        const finalAngle = initialAngle + currentAngleOffset;

        // Individual noise calculation for radius
        const noiseVal = noiseHours(Math.cos(initialAngle) + 20, Math.sin(initialAngle) + 20, elapsedTime * PARAMS.noiseFreqHrs);
        const radiusScaleFactor = 1 + noiseVal * PARAMS.noiseAmpHrs;
        const dynamicRadius = PARAMS.radiusHours * radiusScaleFactor;

        // Update position
        text.position.x = dynamicRadius * Math.cos(finalAngle);
        text.position.y = dynamicRadius * Math.sin(finalAngle);

        // Set color based on highlight
        text.color = (index === currentHour) ? PARAMS.highlightColor : PARAMS.baseColorHours; // Use currentHour

        // Spring scale calculation
        const targetScale = text.userData.targetScale as number;
        let currentScale = text.userData.currentScale as number;
        let scaleVelocity = text.userData.scaleVelocity as number;

        const force = (targetScale - currentScale) * PARAMS.scaleStiffness;
        scaleVelocity += force * deltaTime;
        scaleVelocity *= (1 - PARAMS.scaleDamping);
        currentScale += scaleVelocity * deltaTime;

        text.userData.currentScale = currentScale;
        text.userData.scaleVelocity = scaleVelocity;
        text.scale.set(currentScale, currentScale, 1);

        // Remove Billboard effect
        // text.quaternion.copy(camera.quaternion);

        // Restore Counter-rotation
        text.rotation.z = -currentHoursAngle;
    });

    // --- Update Spline Vertices ---
    const tempVector = new THREE.Vector3();
    const groupCenter = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const splinePoint = new THREE.Vector3();

    // Arrays to hold the calculated points for curve generation
    const secSplinePoints: THREE.Vector3[] = [];
    const minSplinePoints: THREE.Vector3[] = [];
    const hrsSplinePoints: THREE.Vector3[] = [];

    // Update Seconds - Collect Points
    secondsGroup.getWorldPosition(groupCenter);
    for (let i = 0; i < 60; i++) {
        secondTexts[i].getWorldPosition(tempVector);
        direction.subVectors(tempVector, groupCenter);
        splinePoint.copy(groupCenter).addScaledVector(direction, PARAMS.splineRadiusFactor);
        secSplinePoints.push(splinePoint.clone()); // Store a clone
    }
    // Generate Curve and Update Geometry
    if (secSplinePoints.length > 1) {
        const curve = new THREE.CatmullRomCurve3(secSplinePoints, true, 'catmullrom', 0.5);
        const points = curve.getPoints(curveSegments);
        const positions = splineGeomSeconds.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i <= curveSegments; i++) {
            positions.setXYZ(i, points[i].x, points[i].y, points[i].z);
        }
        positions.needsUpdate = true;
    }

    // Update Minutes - Collect Points
    minutesGroup.getWorldPosition(groupCenter);
    for (let i = 0; i < 60; i++) {
        minuteTexts[i].getWorldPosition(tempVector);
        direction.subVectors(tempVector, groupCenter);
        splinePoint.copy(groupCenter).addScaledVector(direction, PARAMS.splineRadiusFactor);
        minSplinePoints.push(splinePoint.clone());
    }
    // Generate Curve and Update Geometry
    if (minSplinePoints.length > 1) {
        const curve = new THREE.CatmullRomCurve3(minSplinePoints, true, 'catmullrom', 0.5);
        const points = curve.getPoints(curveSegments);
        const positions = splineGeomMinutes.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i <= curveSegments; i++) {
            positions.setXYZ(i, points[i].x, points[i].y, points[i].z);
        }
        positions.needsUpdate = true;
    }

    // Update Hours - Collect Points
    hoursGroup.getWorldPosition(groupCenter);
    for (let i = 0; i < 24; i++) {
        hourTexts[i].getWorldPosition(tempVector);
        direction.subVectors(tempVector, groupCenter);
        splinePoint.copy(groupCenter).addScaledVector(direction, PARAMS.splineRadiusFactor);
        hrsSplinePoints.push(splinePoint.clone());
    }
    // Generate Curve and Update Geometry
    if (hrsSplinePoints.length > 1) {
        const curve = new THREE.CatmullRomCurve3(hrsSplinePoints, true, 'catmullrom', 0.5);
        const points = curve.getPoints(curveSegments);
        const positions = splineGeomHours.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i <= curveSegments; i++) {
            positions.setXYZ(i, points[i].x, points[i].y, points[i].z);
        }
        positions.needsUpdate = true;
    }

    // Render
    renderer.render(scene, camera); // Still render using the camera

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

