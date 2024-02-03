/*
 * This source code is under the Unlicense
 */
/*
 * This test case is described for Jasmine.
 */
describe("Pattern", function() {
    const P = Pattern();
    const ok = (expected, actual) => expect(actual).toEqual(expected);
    const undef = void 0;
    const $ = v => (console.log(v), v);

    beforeEach(function() {
    });

    describe("testing Pattern", function() {
        it("match1", () => {
            const Nest = P.create();
            const flat = P.match([{
                p: [Nest(P.v)],
                f: a => flat(a.v)
            },
            {
                p: [P.v],
                f: a => a.v
            }], [P.TOr(Nest(P._), P.Num)]);

            ok(flat(Nest(Nest(9))), 9);
            ok(flat(Nest(Nest(Nest(Nest(9))))), 9);
            expect(() => flat(Nest("0"))).toThrow();
        });

        it("match2", () => {
            const Nest = P.create();
            const flat = P.match([{
                p: [Nest(P.v)],
                f: a => flat(a.v)
            },
            {
                p: [P.v],
                f: a => a.v
            }]);

            ok(flat(Nest(Nest(9))), 9);
            ok(flat(Nest(Nest(Nest(Nest(9))))), 9);
            ok(flat(Nest("0")), "0");
        });

        it("name", () => {
            const Person = P.create(["name", "num", "birthday", "birthplace"]);
            const getName = P.match([{
                p: [{ birthplace: P.v, num: P._ }],
                f: a => a.v
            }], [Person(P.__)]);
            const p1 = Person({ name: "Name1", num: 9, birthday: "2/8", birthplace: "Osaka" });
            const p2 = Person({ name: "Name2", num: 19 });

            ok(getName(p1), "Osaka");
            ok(getName(p2), undef);
            expect(() => getName(2)).toThrow();
        });

        it("inherit", () => {
            const Nest1 = P.create();
            const Nest2 = P.create();
            const base = P.match([{
                p: [Nest1(P.v)],
                f: a => a.v
            }]);
            const inherit = P.match([{
                p: [Nest2(P.v)],
                f: a => a.v
            }], null, base);

            ok(inherit(Nest2(2)), 2);
            ok(inherit(Nest1(2)), 2);
            expect(() => inherit(9)).toThrow();
        });

        it("or", () => {
            const Nest1 = P.create();
            const match = P.match([{
                p: P.Or([Nest1(P.v, 1)], [Nest1(P.w, 2)]),
                f: a => a
            }]);
            const p1 = match(Nest1(1, 1));
            const p2 = match(Nest1(3, 2));

            ok(p1.v, 1);
            ok(p1.w, undef);
            ok(p2.v, undef);
            ok(p2.w, 3);
        });

        it("equals", () => {
            const T1 = P.create();
            const T2 = P.create();
            const t1 = T1(1, 2, T2(3, 4));
            const t2 = T1(1, 2, T2(3, 4));
            const t3 = T1(1, 2, 3);
            const t4 = T2(1, 2, T1(3, 4));
            const t5 = T1(1, 2, T1(3, 4));
            const t6 = 1;

            ok(P.equals(t1, t2), true);
            ok(P.equals(t1, t3), false);
            ok(P.equals(t1, t4), false);
            ok(P.equals(t1, t5), false);
            ok(P.equals(t1, t1), true);
            ok(P.equals(t1, null), false);
            ok(P.equals(null, t1), false);
            ok(P.equals(t1, undef), false);
            ok(P.equals(undef, t1), false);
            ok(P.equals(null, null), true);
            ok(P.equals(undef, undef), true);
            ok(P.equals([1, 2, t1], [1, 2, t2]), true);
            ok(P.equals([1, 2, t1], [1, t2]), false);
            ok(P.equals([1, 2, t1], [1, 2, t3]), false);
            ok(P.equals([1, 1, t1], [1, 2, t3]), false);
            ok(P.equals([1, 1, t1], null), false);
            ok(P.equals(null, [1, 2, t3]), false);
            ok(P.equals([1, 1, t1], undef), false);
            ok(P.equals(undef, [1, 2, t3]), false);
            ok(P.equals({}, [1, 2]), false);
            ok(P.equals({}, {}), false);
        });

        it("binary search tree", () => {
            const Tree = P.create();
            const tree = Tree(5, Tree(3, 1, 4), Tree(7, 6, 8));
            const search = v => P.match([{
                p: [Tree(P.v, P.l, P.r)],
                f: a => v < a.v ? search(v)(a.l) : v > a.v ? search(v)(a.r) : v
            },
            {
                p: [P.v],
                f: a => v === a.v ? v : null
            }]);

            ok(search(1)(tree), 1);
            ok(search(8)(tree), 8);
            ok(search(3)(tree), 3);
            ok(search(2)(tree), null);
        });
    });
});

