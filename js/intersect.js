
class Intersect {
	static segments(segment1p1, segment1p2, segment2p1, segment2p2) {
		const x12 = segment1p1.x - segment1p2.x;
		const y12 = segment1p1.y - segment1p2.y;
		const x13 = segment1p1.x - segment2p1.x;
		const y13 = segment1p1.y - segment2p1.y;
		const x34 = segment2p1.x - segment2p2.x;
		const y34 = segment2p1.y - segment2p2.y;

		const d = x12 * y34 - y12 * x34;
		if (d == 0) {
			return null;
		}

		const t = (x13 * y34 - y13 * x34) / d;
		const u = (x13 * y12 - y13 * x12) / d;
		if (t < 0 || t > 1 || u < 0 || u > 1) {
			return null;
		}

		return {
			t: t,
			u: u,
			x: segment1p1.x + t * (segment1p2.x - segment1p1.x),
			y: segment1p1.y + t * (segment1p2.y - segment1p1.y)
		}
	}

	static segmentWithCircle() {

	}
}