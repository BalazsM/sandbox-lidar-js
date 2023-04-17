// TODO: copy into lidar simulation
// TODO. fix sensor map clear glitch
// TODO: rename simulation to world
// TODO: property class (id, group, readonly, type[number, vector, boolean])
// TODO: fix resize
// TODO: display selected entity's velocity 
// TODO: simulation speed slider
// TODO: compass : https://codesandbox.io/s/idzgd

let config = null;
let controllerPool = null;
let simulation = null;
let view = null;
let selectedEntity = null;

// ---------------------------------------------------------------------------

function readInputs() {
	config.entitySensorsCount = entitySensorsCountInput.value * 1.0;
	config.entitySensorsCoverage = entitySensorsCoverageInput.value * 1.0;
	config.entitySensorsRange = entitySensorsRangeInput.value * 1.0;
	if (selectedEntity !== null) {
		selectedEntity.createSensors(
			config.entitySensorsCount, 
			config.entitySensorsCoverage / 180.0 * PI,
			config.entitySensorsRange);
	}

	config.simulationGridStep = simulationGridStepInput.value * 1.0;
	simulation.movingObstacles = simulationMovingObstaclesInput.checked;
	
	view.zoom = zoomInput.value * 1.0;
	view.showGrid = showGridInput.checked;
	view.showCompass = showCompassInput.checked;
	view.showObstacles = showObstaclesInput.checked;
	view.showMap = showMapInput.checked;
	view.showSensors = showSensorsInput.checked;
}

function writeOutputs() {
	for (let i = 0; i < controllerPool.controllers.length; i++) {
		var controllerCheck = document.getElementById('activeController' + i);
		controllerCheck.checked = (controllerPool.activeController === controllerPool.controllers[i]);
	}

	simulationFPSOutput.innerHTML = frameRate().toFixed(2);

	entityPositionOutput.innerHTML = simulation.entities[0].position.x.toFixed(2) + ', ' + simulation.entities[0].position.y.toFixed(2);
	entitySensorsCountOutput.innerHTML = config.entitySensorsCount.toFixed(2);
	entitySensorsCoverageOutput.innerHTML = config.entitySensorsCoverage.toFixed(2);
	entitySensorsRangeOutput.innerHTML = config.entitySensorsRange.toFixed(2);

	simulationGridStepOutput.innerHTML = config.simulationGridStep.toFixed(2);
	simulationMovingObstaclesInput.checked = simulation.movingObstacles;

	zoomOutput.innerHTML = view.zoom.toFixed(2);
	showGridInput.checked = view.showGrid;
	showCompassInput.checked = view.showCompass;
	showObstaclesInput.checked = view.showObstacles;
	showMapInput.checked = view.showMap;
	showSensorsInput.checked = view.showSensors;
}

// --  p5js event handlers  --------------------------------------------------

function preload() {
}

function setup() {
	let canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('workspace');

	smooth();

	config = new Config();
	controllerPool = new ControllerPool(config);
	simulation = new Simulation(config);
	view = new View(config, canvas, width, height, ViewModes.FOLLOW, simulation);

	// TODO: implement selection
	selectedEntity = simulation.entities[0];
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	view.resize();
}

function keyPressed() {
	switch (key) {
		case ' ':
			simulation.toglePause();
			break;
	}
}

function mousePressed() {
	if (mouseButton === LEFT) {
	}
}

function mouseDragged() {
}

function mouseReleased() {
}

function mouseWheel(event) {
}

function draw() {
	controllerPool.process();

	readInputs();

	selectedEntity.direction.rotate(controllerPool.activeController.steering * (PI / 180.0 * config.steeringSensitivity));
	selectedEntity.velocity = p5.Vector.fromAngle(selectedEntity.direction.heading(), controllerPool.activeController.acceleration * config.accelerationSensitivity);

	simulation.update();

	view.render();

	writeOutputs();
}
