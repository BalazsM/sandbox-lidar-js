
const config_mapOverSampling = 16;

class Entity {
	constructor (config, position, direction) {
		this.config = config;
		this.position = position;
		this.direction = direction;
		this.velocity = new createVector(0, 0);
		this.acceleration = new createVector(0, 0);
		this.map = new EntityMap(config);
		this.sensors = new Array();
	}

	createSensors(count, angle, range) {
		this.sensors = new Array();

		const p1 = new createVector(0, 0);
		for (let i = 0; i < count; i++) {
			this.sensors.push(new Sensor(
				p1,
				p5.Vector.fromAngle(-angle / 2.0 + angle / count * i),
				range));
		}
	}

	process(deltaT) {
		this.map.update(deltaT);

		const hits = new Array();
		for (let sensor of this.sensors) {
			this.processSensor(sensor, hits);
		}
		for (let hit of hits) {
			this.map.set(
				hit.x, 
				hit.y, 
				0);
		}
	}

	processSensor(sensor, hits) {
		const sensorPosition = p5.Vector.add(this.position, sensor.position);
		const sensorDirection = p5.Vector.fromAngle(this.direction.heading() + sensor.direction.heading());
		const sensorValue = p5.Vector.add(sensorPosition, p5.Vector.mult(sensorDirection, sensor.value));

		const startX = (this.position.x + sensor.position.x) / this.config.simulationGridStep * config_mapOverSampling;
		const startY = (this.position.y + sensor.position.y) / this.config.simulationGridStep * config_mapOverSampling;
		const endX = sensorValue.x / this.config.simulationGridStep * config_mapOverSampling;
		const endY = sensorValue.y / this.config.simulationGridStep * config_mapOverSampling;
		const deltaX = endX - startX;
		const deltaY = endY - startY;

		if (deltaY == 0 && deltaX != 0) { // horizontal line
			const y = startY;
			if (startX < endX) {
				for (let x = startX; x < endX; x++) {
					this.map.set(
						x / config_mapOverSampling, 
						y / config_mapOverSampling, 
						-1);
				}
			} else {
				for (let x = startX; x > endX; x--) {
					this.map.set(
						x / config_mapOverSampling, 
						y / config_mapOverSampling, 
						-1);
				}
			}
		} else if (deltaX == 0 & deltaY != 0) { // vertical line
			const x = startX;
			if (startY < endY) {
				for (let y = startY; y < endY; y++) {
					this.map.set(
						x / config_mapOverSampling, 
						y / config_mapOverSampling, 
						-1);
				}
			} else {
				for (let y = startY; y > endY; y--) {
					this.map.set(
						x / config_mapOverSampling, 
						y / config_mapOverSampling, 
						-1);
				}
			}
		} else if (deltaX > deltaY) {
			let y = startY;
			const dy = deltaY / deltaX;
			if (startX < endX) {
				for (let x = startX; x < endX; x++) {
					this.map.set(
						x / config_mapOverSampling, 
						y / config_mapOverSampling, 
						-1);
					y += dy;
				}
			} else {
				for (let x = startX; x > endX; x--) {
					this.map.set(
						x / config_mapOverSampling, 
						y / config_mapOverSampling, 
						-1);
					y -= dy;
				}
			}
		} else {
			let x = startX;
			const dx = deltaX / deltaY;
			if (startY < endY) {
				for (let y = startY; y < endY; y++) {
					this.map.set(
						x / config_mapOverSampling, 
						y / config_mapOverSampling, 
						-1);
					x += dx;
				}
			} else {
				for (let y = startY; y > endY; y--) {
					this.map.set(
						x / config_mapOverSampling, 
						y / config_mapOverSampling, 
						-1);
					x -= dx;
				}
			}
		}

		if (sensor.value < sensor.range) {
			hits.push(createVector(endX / config_mapOverSampling, endY / config_mapOverSampling));
		}
	}
}