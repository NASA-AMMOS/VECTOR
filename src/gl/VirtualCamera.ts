import { PerspectiveCamera, Quaternion, Vector3 } from 'three';

// Based on three.js FlyControls with modifications to event
// handling and attaching our preferred camera system.
// https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/FlyControls.js
export default class VirtualCamera extends PerspectiveCamera {
    private element: HTMLElement | null = null;

    // Parameters
    private movementSpeed = 40.0;
    private rollSpeed = 0.5;

    // Utilities
    private EPS = 0.000001;
    private pastQuat = new Quaternion();
    private pastPos = new Vector3();

    private tempQuat = new Quaternion();

    private moveVec = new Vector3(0, 0, 0);
    private rotVec = new Vector3(0, 0, 0);

    // Event Handlers
    private boundContextMenu: ((event: Event) => void) | null = null;
    private boundKeyDown: ((event: KeyboardEvent) => void) | null = null;
    private boundKeyUp: ((event: KeyboardEvent) => void) | null = null;

    // State
    private moveState = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        forward: 0,
        back: 0,
        pitchUp: 0,
        pitchDown: 0,
        yawLeft: 0,
        yawRight: 0,
        rollLeft: 0,
        rollRight: 0,
    };

    constructor(aspectRatio: number, element: HTMLElement) {
        super(45.0, aspectRatio, 0.1, 1000.0);

        this.element = element;

        this.boundContextMenu = this.disableEvent.bind(this);
        this.element.addEventListener('contextmenu', this.boundContextMenu);

        this.boundKeyDown = this.keydown.bind(this);
        this.element.addEventListener('keydown', this.boundKeyDown);

        this.boundKeyUp = this.keyup.bind(this);
        this.element.addEventListener('keyup', this.boundKeyUp);

        this.updateMovementVector();
        this.updateRotationVector();
    }

    update(delta: number) {
        const moveMult = delta * this.movementSpeed;
        const rotMult = delta * this.rollSpeed;

        this.translateX(this.moveVec.x * moveMult);
        this.translateY(this.moveVec.y * moveMult);
        this.translateZ(this.moveVec.z * moveMult);

        this.tempQuat.set(this.rotVec.x * rotMult, this.rotVec.y * rotMult, this.rotVec.z * rotMult, 1).normalize();
        this.quaternion.multiply(this.tempQuat);

        if (
            this.pastPos.distanceToSquared(this.position) > this.EPS ||
            8 * (1 - this.pastQuat.dot(this.quaternion)) > this.EPS
        ) {
            this.dispatchEvent({ type: 'change' });
            this.pastQuat.copy(this.quaternion);
            this.pastPos.copy(this.position);
        }
    }

    dispose() {
        if (this.element && this.boundContextMenu) {
            this.element.removeEventListener('contextmenu', this.boundContextMenu);
        }

        if (this.element && this.boundKeyDown) this.element.removeEventListener('keydown', this.boundKeyDown);
        if (this.element && this.boundKeyUp) this.element.removeEventListener('keyup', this.boundKeyUp);
    }

    private keydown(event: KeyboardEvent) {
        if (event.altKey) return;

        switch (event.code) {
            case 'KeyW':
                this.moveState.forward = 1;
                break;
            case 'KeyS':
                this.moveState.back = 1;
                break;

            case 'KeyA':
                this.moveState.left = 1;
                break;
            case 'KeyD':
                this.moveState.right = 1;
                break;

            case 'KeyR':
            case 'Space':
                this.moveState.up = 1;
                break;
            case 'KeyF':
            case 'ShiftLeft':
            case 'ShiftRight':
                this.moveState.down = 1;
                break;

            case 'ArrowUp':
                this.moveState.pitchUp = 1;
                break;
            case 'ArrowDown':
                this.moveState.pitchDown = 1;
                break;

            case 'ArrowLeft':
                this.moveState.yawLeft = 1;
                break;
            case 'ArrowRight':
                this.moveState.yawRight = 1;
                break;

            case 'KeyQ':
                this.moveState.rollLeft = 1;
                break;
            case 'KeyE':
                this.moveState.rollRight = 1;
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();
    }

    private keyup(event: KeyboardEvent) {
        switch (event.code) {
            case 'KeyW':
                this.moveState.forward = 0;
                break;
            case 'KeyS':
                this.moveState.back = 0;
                break;

            case 'KeyA':
                this.moveState.left = 0;
                break;
            case 'KeyD':
                this.moveState.right = 0;
                break;

            case 'KeyR':
            case 'Space':
                this.moveState.up = 0;
                break;
            case 'KeyF':
            case 'ShiftLeft':
            case 'ShiftRight':
                this.moveState.down = 0;
                break;

            case 'ArrowUp':
                this.moveState.pitchUp = 0;
                break;
            case 'ArrowDown':
                this.moveState.pitchDown = 0;
                break;

            case 'ArrowLeft':
                this.moveState.yawLeft = 0;
                break;
            case 'ArrowRight':
                this.moveState.yawRight = 0;
                break;

            case 'KeyQ':
                this.moveState.rollLeft = 0;
                break;
            case 'KeyE':
                this.moveState.rollRight = 0;
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();
    }

    private updateMovementVector() {
        const forward = this.moveState.forward || 0;
        this.moveVec.x = -this.moveState.left + this.moveState.right;
        this.moveVec.y = -this.moveState.down + this.moveState.up;
        this.moveVec.z = -forward + this.moveState.back;
    }

    private updateRotationVector() {
        this.rotVec.x = -this.moveState.pitchDown + this.moveState.pitchUp;
        this.rotVec.y = -this.moveState.yawRight + this.moveState.yawLeft;
        this.rotVec.z = -this.moveState.rollRight + this.moveState.rollLeft;
    }

    private disableEvent(event: Event) {
        event.preventDefault();
    }
}
