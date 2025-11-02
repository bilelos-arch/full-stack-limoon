// Polyfill complet pour DOMMatrix (requis pour PDF.js)
if (typeof window !== 'undefined' && !window.DOMMatrix) {
  // @ts-ignore
  window.DOMMatrix = class DOMMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    m11: number;
    m12: number;
    m13: number;
    m14: number;
    m21: number;
    m22: number;
    m23: number;
    m24: number;
    m31: number;
    m32: number;
    m33: number;
    m34: number;
    m41: number;
    m42: number;
    m43: number;
    m44: number;
    is2D: boolean;
    isIdentity: boolean;

    constructor(init?: any) {
      if (typeof init === 'string') {
        // Parse transform string (simplified - basic implementation)
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
        this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
        this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
        this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
      } else if (Array.isArray(init)) {
        // Array initialization
        this.m11 = init[0] ?? 1; this.m12 = init[1] ?? 0; this.m13 = init[2] ?? 0; this.m14 = init[3] ?? 0;
        this.m21 = init[4] ?? 0; this.m22 = init[5] ?? 1; this.m23 = init[6] ?? 0; this.m24 = init[7] ?? 0;
        this.m31 = init[8] ?? 0; this.m32 = init[9] ?? 0; this.m33 = init[10] ?? 1; this.m34 = init[11] ?? 0;
        this.m41 = init[12] ?? 0; this.m42 = init[13] ?? 0; this.m43 = init[14] ?? 0; this.m44 = init[15] ?? 1;
        this.a = this.m11; this.b = this.m12; this.c = this.m21; this.d = this.m22; this.e = this.m41; this.f = this.m42;
      } else {
        // Object initialization
        this.a = init?.a ?? 1; this.b = init?.b ?? 0; this.c = init?.c ?? 0; this.d = init?.d ?? 1;
        this.e = init?.e ?? 0; this.f = init?.f ?? 0;
        this.m11 = init?.m11 ?? this.a; this.m12 = init?.m12 ?? this.b; this.m13 = init?.m13 ?? 0; this.m14 = init?.m14 ?? 0;
        this.m21 = init?.m21 ?? this.c; this.m22 = init?.m22 ?? this.d; this.m23 = init?.m23 ?? 0; this.m24 = init?.m24 ?? 0;
        this.m31 = init?.m31 ?? 0; this.m32 = init?.m32 ?? 0; this.m33 = init?.m33 ?? 1; this.m34 = init?.m34 ?? 0;
        this.m41 = init?.m41 ?? this.e; this.m42 = init?.m42 ?? this.f; this.m43 = init?.m43 ?? 0; this.m44 = init?.m44 ?? 1;
      }
      this.is2D = this.m13 === 0 && this.m14 === 0 && this.m23 === 0 && this.m24 === 0 &&
                  this.m31 === 0 && this.m32 === 0 && this.m33 === 1 && this.m34 === 0 &&
                  this.m43 === 0 && this.m44 === 1;
      this.isIdentity = this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 &&
                       this.e === 0 && this.f === 0 && this.is2D;
    }

    multiply(other: DOMMatrix): DOMMatrix {
      const a = this.a * other.a + this.c * other.b;
      const b = this.b * other.a + this.d * other.b;
      const c = this.a * other.c + this.c * other.d;
      const d = this.b * other.c + this.d * other.d;
      const e = this.a * other.e + this.c * other.f + this.e;
      const f = this.b * other.e + this.d * other.f + this.f;
      return new DOMMatrix({ a: a, b: b, c: c, d: d, e: e, f: f });
    }

    translate(tx: number, ty: number): DOMMatrix {
      return new DOMMatrix({
        a: this.a, b: this.b, c: this.c, d: this.d,
        e: this.e + tx, f: this.f + ty
      });
    }

    scale(sx: number, sy: number = sx): DOMMatrix {
      return new DOMMatrix({
        a: this.a * sx, b: this.b * sx, c: this.c * sy, d: this.d * sy,
        e: this.e, f: this.f
      });
    }

    rotate(angle: number): DOMMatrix {
      const cos = Math.cos(angle * Math.PI / 180);
      const sin = Math.sin(angle * Math.PI / 180);
      return this.multiply(new DOMMatrix({ a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 }));
    }

    inverse(): DOMMatrix {
      const det = this.a * this.d - this.b * this.c;
      if (det === 0) throw new Error('Matrix is not invertible');
      const invDet = 1 / det;
      return new DOMMatrix({
        a: this.d * invDet,
        b: -this.b * invDet,
        c: -this.c * invDet,
        d: this.a * invDet,
        e: (-this.d * this.e + this.c * this.f) * invDet,
        f: (this.b * this.e - this.a * this.f) * invDet
      });
    }

    transformPoint(point: { x: number; y: number }): { x: number; y: number } {
      return {
        x: this.a * point.x + this.c * point.y + this.e,
        y: this.b * point.x + this.d * point.y + this.f
      };
    }

    toString(): string {
      return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
    }

    static fromMatrix(other: DOMMatrix): DOMMatrix {
      return new DOMMatrix(other);
    }

    static fromFloat32Array(arr: Float32Array): DOMMatrix {
      return new DOMMatrix(Array.from(arr));
    }

    static fromFloat64Array(arr: Float64Array): DOMMatrix {
      return new DOMMatrix(Array.from(arr));
    }
  };
}

// Polyfill pour DOMMatrixReadOnly si nécessaire
if (typeof window !== 'undefined' && !window.DOMMatrixReadOnly) {
  // @ts-ignore
  window.DOMMatrixReadOnly = window.DOMMatrix;
}