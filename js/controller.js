
class Controller {
	constructor () {
		this.name = '';
		this.steering = 0.0;
		this.acceleration = 0.0;
	}
}

// --------------------------------------------------  keyboard controller  --

class KeyboardController extends Controller {
	constructor () {
		super();
		this.name = 'Keyboard';
	}

	process() {
		this.steering = 
			keyIsDown(LEFT_ARROW) ? -1.0 : 0.0 + 
			keyIsDown(RIGHT_ARROW) ? 1.0 : 0.0;
		this.acceleration = 
			keyIsDown(UP_ARROW) ? 1.0 : 0.0 + 
			keyIsDown(DOWN_ARROW) ? -1.0 : 0.0;
	}
}	

// -----------------------------------------------------  mouse controller  --

class MouseController extends Controller {
	constructor () {
		super();
		this.name = 'Mouse';
	}

	process() {
		this.steering = map(mouseX, 0, width, 0, TWO_PI) - PI;
		if (mouseIsPressed) {
			this.acceleration = 
				mouseButton === LEFT ? 1.0 : 0.0 + 
				mouseButton === RIGHT ? -1.0 : 0.0;
		} else {
			this.acceleration = 0.0;
		}
	}
}

// ---------------------------------------------------  gamepad controller  --

class GamepadController extends Controller {
	constructor (index) {
		super();
		this.index = index;
		const gamepad = navigator.getGamepads()[this.index];
		this.name = 'Gamepad - ' + gamepad.id;
	}

	process() {
		const gamepad = navigator.getGamepads()[this.index];

		// gamepad.buttons[0].value // A
		// gamepad.buttons[1].value // B
		// gamepad.buttons[2].value // X
		// gamepad.buttons[3].value // Y
		// gamepad.buttons[4].value // LB
		// gamepad.buttons[5].value // RB
		// gamepad.buttons[6].value // LT
		// gamepad.buttons[7].value // RT
		// gamepad.buttons[8].value // back
		// gamepad.buttons[9].value // start
		// gamepad.buttons[10].value // LS
		// gamepad.buttons[11].value // RS
		// gamepad.buttons[12].value // up
		// gamepad.buttons[13].value // down
		// gamepad.buttons[14].value // left
		// gamepad.buttons[15].value // right

		// gamepad.axes[0] // left joy horizontal axe
		// gamepad.axes[1] // left joy hertical axe
		// gamepad.axes[2] // right joy horizontal axe
		// gamepad.axes[3] // right joy hertical axe
		
		this.steering = gamepad.axes[2];
		//this.acceleration = gamepad.axes[3];
		this.acceleration = gamepad.buttons[7].value;
	}
}

// ------------------------------------------------------  controller pool  --

class ControllerPool {
	constructor () {
		this.controllers = new Array();
		this.controllers.push(new KeyboardController());
		this.controllers.push(new MouseController());
		this.activeController = this.controllers[0];

		window.addEventListener(
			'gamepadconnected',
			(e) => { this.onGamepadConnected(e); },
			false
		);
		
		window.addEventListener(
			'gamepaddisconnected',
			(e) => { this.onGamepadDisconnected(e); },
			false
		);
	}

	process() {
		for (let controller of this.controllers) {
			controller.process();
		}
	}

	setActiveController(index) {
		if (index < 0 || index >= this.controllers.length) {
			return;
		}

		this.activeController = this.controllers[index];
	}

	onGamepadConnected(event) {
		console.log('gamepadconnected', event.gamepad.index, event.gamepad.id);
		this.controllers.push(new GamepadController(event.gamepad.index));
	}

	onGamepadDisconnected(event) {
		console.log('gamepaddisconnected', event.gamepad.index, event.gamepad.id);

		// TODO: remove gamepad from pool
//		const i = this.items.indexOf(event.gamepad);
//		this.controllers.splice(i, 1);
	}
}

