
class Simulation {
	constructor (config) {
		this.config = config;
//		this.configVersion = 0;
		this.time = 0;
		this.deltaT = 1; // TODO: rename to deltaTime
		this.movingObstacles = true;
		this.obstacles = new Array();
		this.entities = new Array();

		this.entities.push(new Entity(config, 
			createVector(config.simulationSize / 2, config.simulationSize / 2),
			createVector(0, 1)));
	}

	createObstacle(x, y, radius, segments, angle) {
		if (angle === undefined) {
			angle = 0.0;
		}

		for (let i = 0; i < segments; i++) {
			const a = TWO_PI / segments;
			const b1 = i * a + angle;
			const b2 = (i + 1) * a + angle;
			const p1x = x + Math.cos(b1) * radius;
			const p1y = y + Math.sin(b1) * radius;
			const p2x = x + Math.cos(b2) * radius;
			const p2y = y + Math.sin(b2) * radius;
			
			this.obstacles.push(new Obstacle(createVector(p1x, p1y), createVector(p2x, p2y)));
		}
	}

	toglePause() {
		if (this.deltaT == 0)
			this.deltaT = 1;
		else
			this.deltaT = 0;
	}

	update() {
		this.time += this.deltaT;

		this.updateObstacles();

		for (let entity of this.entities) {
			this.updateEntityPhysics(entity);
		}

		for (let entity of this.entities) {
			this.updateEntitySensors(entity);
		}

		for (let entity of this.entities) {
			entity.process(this.deltaT);
		}
	}

	updateObstacles() {
		this.obstacles = new Array();

		this.obstacles.push(new Obstacle(
			createVector(0, 0), 
			createVector(this.config.simulationSize, 0)));
		this.obstacles.push(new Obstacle(
			createVector(this.config.simulationSize, 0), 
			createVector(this.config.simulationSize, this.config.simulationSize)));
		this.obstacles.push(new Obstacle(
			createVector(this.config.simulationSize, this.config.simulationSize), 
			createVector(0, this.config.simulationSize)));
		this.obstacles.push(new Obstacle(
			createVector(0, this.config.simulationSize), 
			createVector(0, 0)));

		const t = this.movingObstacles ? this.time : 0;

		const obstacleCount = 5; // TODO: move into config
		randomSeed(1); // TODO: 1 -> move into config
		for (let x = 0; x < obstacleCount; x++) {
			for (let y = 0; y < obstacleCount; y++) {
				const moving = random(1) > 0.5 ? true : false;
				const angle = moving ? t / 20 * random(1) : 0.0;

				this.createObstacle(
					this.config.simulationSize / obstacleCount / 2 + x * this.config.simulationSize / (obstacleCount + 1),
					this.config.simulationSize / obstacleCount / 2 + y * this.config.simulationSize / (obstacleCount + 1),
					this.config.simulationSize / obstacleCount / 3,
					Math.round(3 + random(6)),
					angle);
			}
		}
	}

	updateEntityPhysics(entity) {
//		entity.velocity = p5.Vector.fromAngle(entity.direction.heading(), entity.velocity.mag() + entity.acceleration.mag());
		entity.velocity.add(entity.acceleration);
		entity.velocity.limit(10); // TODO: max speed settings

		const velocity = p5.Vector.mult(entity.velocity, this.deltaT);
		entity.position.add(velocity);

		entity.acceleration.mult(0);
//		entity.steering.mult(0);
	}

	updateEntitySensors(entity) {
		for (let sensor of entity.sensors) {
			const sensorPosition = p5.Vector.add(entity.position, sensor.position);
			const sensorDirection = p5.Vector.fromAngle(entity.direction.heading() + sensor.direction.heading());

			const sensorLineP1 = sensorPosition;
			const sensorLineP2 = p5.Vector.add(sensorPosition, p5.Vector.mult(sensorDirection, sensor.range));

			sensor.value = sensor.range;

			for (let obstacle of this.obstacles) {
				const intersection = Intersect.segments(
					sensorLineP1,
					sensorLineP2,
					obstacle.p1, 
					obstacle.p2); 

				if (intersection == null) {
					continue;
				}

				const v = intersection.t * sensor.range;
				if (sensor.value > v) {
					sensor.value = v;
				}
			}
		}
	}
}