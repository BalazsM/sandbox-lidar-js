// TODO: átdolgozni, hogy a map világkoordinátát várjon, és abból számolja ki a pozíciót

class EntityMap {
	constructor (config) {
		this.config = config;

		this.chunkSize = 1000;
		this.chunk = new Float32Array(this.chunkSize * this.chunkSize);

		for (let x = 0; x < this.chunkSize; x++) {
			for (let y = 0; y < this.chunkSize; y++) {
				this.set(x, y, -1.0); // TODO: -1 -> const
			}
		}
	}

	set(x, y, value) {
		const mx = Math.floor(x);
		const my = Math.floor(y);

		// TODO: select chunk by coordinates
//		const chunk = this.chunk;

		this.chunk[mx + my * this.chunkSize] = value;
	}

	get(x, y) {
		const mx = Math.floor(x);
		const my = Math.floor(y);

		// TODO: select chunk by coordinates
//		const chunk = this.chunk;

		return this.chunk[mx + my * this.chunkSize];
	}

	update(deltaT) {
		for (let x = 0; x < this.chunkSize; x++) {
			for (let y = 0; y < this.chunkSize; y++) {
				const v = this.get(x, y);
				if (v != -1) { // TODO: -1 config or const
					this.set(x, 
						y, 
						Math.min(this.get(x, y) + deltaT * 100, 1000.0)); // TODO: 1000 -> config, 100 -> config
				}
			}
		}
	}
}