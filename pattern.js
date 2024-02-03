/*
 * This source code is under the Unlicense
 */
const Pattern = () => {
    const undef = void 0;
    const $ = v => (console.log(v), v);
    const error = msg => { throw new Error(msg); };
    const elements = Symbol("elements");
    const referName = Symbol("referName");
    const classObject = Symbol("classObject");
    const classID = Symbol("classID");
    const bindName = Symbol("bindName");
    const any = Symbol("any");
    const dontCare = Symbol("dontCare");
    const primitive = Symbol("primitive");

    const zipArray = (v, w) => {
        const len = Math.min(v.length, w.length);
        let result = [];

        for(let i = 0; i < len; i++) {
            result.push([v[i], w[i]]);
        }
        return result;
    };
    const isPlainObject = a => a && a.constructor === Object;

    class Bind {
        constructor(name) {
            this[bindName] = name;
        }
    }
    const bind = name => new Bind(name);

    class TypeBase {}
    const create = name => {
        const uniqueID = Symbol("unique ID");

        if(name !== undef && (!Array.isArray(name) || name.some(s => typeof s !== "string"))) {
            error("Name must be array of string");
        }

        class A extends TypeBase {
            constructor(args) {
                super();
                this[elements] = args.slice();
            }

            get [referName]() {
                return name;
            }

            get [classID]() {
                return uniqueID;
            }

            at(index) {
                if(typeof index === "string") {
                    const i = name.indexOf(index);

                    if(i < 0) {
                        error("invalid name");
                    }
                    return this[elements][i];
                } else {
                    return this[elements][index];
                }
            }
        }
        const f = (...args) => args.length === 1 && isPlainObject(args[0]) ? f(...name.map(n => args[0][n])) : new A(args);

        f[classObject] = A;
        return f;
    };

    class OrClass {
        constructor(args) {
            this[elements] = args.slice();
        }
    }
    const Or = (...args) => new OrClass(args);

    const matchAndBind = bind => p => a => {
        if(p === any) {
            return bind;
        } else if(p[bindName]) {
            bind[p[bindName]] = a;
            return bind;
        } else if(p === a) {
            return bind;
        } else if(p instanceof OrClass) {
            const entries = Object.entries(bind);

            for(const p0 of p[elements]) {
                const result = matchAndBind(Object.fromEntries(entries))(p0)(a);

                if(result) {
                    return result;
                }
            }
            return false;
        } else if(Array.isArray(a) && Array.isArray(p)) {
            if(p.length !== a.length) {
                return false;
            } else {
                for(const [p0, a0] of zipArray(p, a)) {
                    if(!matchAndBind(bind)(p0)(a0)) {
                        return false;
                    }
                }
                return bind;
            }
        } else if(isPlainObject(p) && a[referName]) {
            return matchAndBind(bind)(a[referName].map(k => p[k] ?? any))(a[elements]);
        } else if(a instanceof p.constructor) {
            for(const [p0, a0] of zipArray(p[elements], a[elements])) {
                if(!matchAndBind(bind)(p0)(a0)) {
                    return false;
                }
            }
            return bind;
        } else {
            return false;
        }
    };
    const checkTypeMatch = (t, a) => { if(t && !typeMatchObject(t, a)) { error("type mismatch"); } };
    const match = (p, t, inherit) => (...a) => {
        const inh = inherit ?? (() => error("pattern not found"));

        checkTypeMatch(t, a);
        for(const p0 of p) {
            const bound = matchAndBind(Object.create(null))(p0.p)(a);

            if(bound) {
                return p0.f(bound);
            }
        }
        return inh(...a);
    };

    class TypeOr {
        constructor(p) {
            this.types = p;
        }

        compare(a) {
            return this.types.some(p => typeMatch1(p, a));
        }
    }
    const typeMatchObject = (t, a) =>
        Array.isArray(t) && Array.isArray(a)
        ? t.length === a.length && zipArray(t, a).every(([t0, a0]) => typeMatchObject(t0, a0))
        : isPlainObject(t) && a[referName]
        ? typeMatchObject(a[referName].map(k => t[k] ?? any), a[elements])
        : typeMatch(t, a);
    const typeMatch = (t, a) => t instanceof TypeOr ? t.compare(a) : typeMatch1(t, a);
    const typeMatch1 = (t, a) =>
        t[classObject]
        ? a instanceof t[classObject]
        : t instanceof TypeBase
        ? a instanceof t.constructor && (t[elements][0] === dontCare || typeMatchObject(t[elements], a[elements]))
        : t[primitive]
        ? t[primitive](a)
        : t === any || t === a || error("invalid type");
    const TOr = (...types) => new TypeOr(types);
    const makePrimitive = f => {
        class P {
            constructor(fs) {
                this[primitive] = fs;
            }
        }

        return new P(f);
    };
    const Num = makePrimitive(a => typeof a === "number");
    const Str = makePrimitive(a => typeof a === "string");
    const Bool = makePrimitive(a => typeof a === "boolean");
    const BigInt = makePrimitive(a => typeof a === "bigint");
    const Func = makePrimitive(a => typeof a === "function");
    const Arr = makePrimitive(a => Array.isArray(a));

    const equals = (v, w) => v === w ||
        (Array.isArray(v) && Array.isArray(w) && v.length === w.length && zipArray(v, w).every(([v0, w0]) => equals(v0, w0))) ||
        (v instanceof TypeBase && w instanceof TypeBase && v[classID] === w[classID] &&
         v[elements].length === w[elements].length &&
         zipArray(v[elements], w[elements]).every(([v0, w0]) => equals(v0, w0)));

    const me = {
        _: any,
        __: dontCare,
        bind: bind,
        create: create,
        match: match,
        TOr: TOr,
        Or: Or,
        Num: Num,
        Str: Str,
        Bool: Bool,
        BigInt: BigInt,
        Func: Func,
        Arr: Arr,
        equals: equals
    };

    for(let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); i++) {
        const code = String.fromCharCode(i);

        me[code] = bind(code);
        me[code + "s"] = bind(code + "s");
    }

    return me;
};

