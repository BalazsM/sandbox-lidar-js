
const ViewModes = {
	DEFALUT: 0,

	OVERVIEW: 0,
	FOLLOW: 1,
	INSIDE: 2,
}

let viewColors = {
	background: null,
	grid: null,

	obstacle: null,
	entity: null,

	sensor: null,
	steering: null,

	mapFree: null,
	mapOccupied: null,
	mapOld: null,
}

class View {
	constructor (config, canvas, width, height, viewMode, simulation) {
		this.config = config;
		this.canvas = canvas;
		this.width = width;
		this.height = height;
		this.viewMode = viewMode;
		this.simulation = simulation;
		this.position = createVector(0, 0);
		this.direction = createVector(0, 1);
		this.zoom = 1.0;

		this.showGrid = true;
		this.showCompass = true;
		this.showObstacles = true;
		this.showMap = true;
		this.showSensors = true;

		this.setColorScheme();
	}

	setColorScheme() {
		viewColors.background = color(255);
		viewColors.grid = color(0, 0, 0, 50);
	
		// obstacle: color(0),
		// entity: color(0),
	
		viewColors.sensor = color(255, 0, 0, 255);
		viewColors.steering = color(0, 255, 0);

		viewColors.mapFree = color(255, 0, 0, 0);
		viewColors.mapOccupied = color(255, 0, 0, 100);
		viewColors.mapOld = color(128, 128, 128, 80);
	}

	resize(width, height) {
		this.width = width;
		this.height = height;
	}
	
	render() {
		clear();

		push();

		scale(this.zoom);

		switch (this.viewMode) {
			case ViewModes.OVERVIEW:
				break;

			case ViewModes.FOLLOW:
				this.position.x = selectedEntity.position.x;
				this.position.y = selectedEntity.position.y;

				this.direction.x = selectedEntity.direction.x;
				this.direction.y = selectedEntity.direction.y;

				translate(this.width / 2 / this.zoom, 
					this.height / 2 / this.zoom);
					
				rotate(-this.direction.heading() - HALF_PI);

				translate(-this.position.x, 
					-this.position.y);
				break;

			case ViewModes.INSIDE:
				break;
		}

		this.renderGrid();
		this.renderObstacles();

		for (let entity of this.simulation.entities) {
			this.renderEntity(entity);
		}

		pop();

		this.renderCompass();
	}

	renderArrow(startX, startY, endX, endY) {
//		const start = createVector(startX, startY);
		const end = createVector(endX, endY);
		push();
		translate(startX, startY);
		line(0, 0, endX, endY);
		rotate(end.heading());
		const arrowSize = 7;
		translate(end.mag() - arrowSize, 0);
		triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
		pop();
	}

	renderCompass() {
		if (!this.showCompass) {
			return;
		}

		push();

		const size = 50;
		const cx = size * 1.2;
		const cy = size * 1.2;

		translate(cx, cy);
		rotate(-this.direction.heading());

		stroke(255, 0, 0);
		fill(255, 0, 0);
		strokeWeight(1.5);
		this.renderArrow(0, 0, size, 0);
		stroke(255, 0, 0, 120);
		line(-size, 0, 0, 0);

		stroke(0, 255, 0);
		fill(0, 255, 0);
		strokeWeight(1.5);
		this.renderArrow(0, 0, 0, -size);
		stroke(0, 255, 0, 120);
		line(0, 0, 0, size);

		pop();
	}

	renderGrid() {
		if (!this.showGrid) {
			return;
		}

		const displayDiagonal = Math.sqrt(this.width * this.width + this.height * this.height);
		const gridStep = this.config.simulationGridStep;
		const gridSize = Math.round(displayDiagonal / gridStep / 2 / this.zoom + 0.5);
		const s = gridSize * gridStep;
		const ox = this.position.x - this.position.x % gridStep;
		const oy = this.position.y - this.position.y % gridStep;

		strokeWeight(0.5);
		stroke(viewColors.grid);
		for (let i = -gridSize; i <= gridSize; i++) {
			line(ox - s, 
				oy + i * gridStep,
				ox + s, 
				oy + i * gridStep);
			line(ox + i * gridStep, 
				oy - s, 
				ox + i * gridStep,
				oy + s);
		}

		const gridStep2 = gridStep * 10;
		const gridSize2 = Math.round(gridSize / 10 + 1.5);
		const s2 = gridSize2 * gridStep2;
		const ox2 = this.position.x - this.position.x % gridStep2;
		const oy2 = this.position.y - this.position.y % gridStep2;

		strokeWeight(1);
		stroke(viewColors.grid);
		for (let i = -gridSize2; i <= gridSize2; i++) {
			line(ox2 - s2, 
				oy2 + i * gridStep2,
				ox2 + s2, 
				oy2 + i * gridStep2);
			line(ox2 + i * gridStep2, 
				oy2 - s2, 
				ox2 + i * gridStep2,
				oy2 + s2);
		}

		const axeLength = displayDiagonal / 2 / this.zoom;
		strokeWeight(0.5);
		stroke(0);
		line(this.position.x - axeLength, 
			0,
			this.position.x + axeLength, 
			0);
		line(0, 
			this.position.y - axeLength, 
			0,
			this.position.y + axeLength);
	}

	renderObstacles() {
		if (!this.showObstacles) {
			return;
		}

		for (let obstacle of this.simulation.obstacles) {
			this.renderObstacle(obstacle);
		}
	}

	renderObstacle(obstacle) {
		stroke(0);
		strokeWeight(0.5);

		line(obstacle.p1.x, obstacle.p1.y, obstacle.p2.x, obstacle.p2.y);
	}

	renderEntity(entity) {
		push();
		translate(entity.position.x, entity.position.y);
		rotate(entity.direction.heading());
		this.renderEntityShape(entity);
		this.renderEntitySensors(entity);
		pop();

		this.renderEntityMap(entity);
	}

	renderEntitySensors(entity) {
		if (!this.showSensors) {
			return;
		}

		stroke(viewColors.sensor);
		strokeWeight(0.5);
		for (let sensor of entity.sensors) {
			let v1 = createVector(sensor.direction.x, sensor.direction.y);
			v1.setMag(25);
			let v2 = createVector(sensor.direction.x, sensor.direction.y);
			v2.setMag(sensor.value);
			line(v1.x, v1.y, v2.x, v2.y);
		}
	}

	renderEntityShape(entity) {
		stroke(0);
		strokeWeight(0.5);
		line(-20, -10, 20, 0);
		line(-20, 10, 20, 0);
		line(-20, -10, -20, 10);
	}

	renderEntityMap(entity) {
		if (!this.showMap) {
			return;
		}

		const mapGridStep = this.config.simulationGridStep;
		const mapShowSize = 100;

		const x1 = Math.max(0, Math.floor(entity.position.x / mapGridStep - mapShowSize / 2));
		const x2 = Math.min(entity.map.chunkSize, Math.ceil(entity.position.x / mapGridStep + mapShowSize / 2));

		const y1 = Math.max(0, Math.floor(entity.position.y / mapGridStep - mapShowSize / 2));
		const y2 = Math.min(entity.map.chunkSize, Math.ceil(entity.position.y / mapGridStep + mapShowSize / 2));

		for (let x = x1; x < x2; x++) {
			for (let y = y1; y < y2; y++) {
				const v = entity.map.get(x, y);

				if (v == -1.0) { // TODO: -1.0 config or const
					continue;
				}

				// TODO: 1000.0 -> config or const
				const c = v >= 1000.0 
					? viewColors.mapOld 
					: lerpColor(viewColors.mapOld, viewColors.mapOccupied, (1000.0 - v) / 1000.0);

				fill(c);
				noStroke();
				strokeWeight(0.5);
				rect(x * mapGridStep + 2, 
					y * mapGridStep + 2, 
					mapGridStep - 4, 
					mapGridStep - 4);
			}
		}
	}
}