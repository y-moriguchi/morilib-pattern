# Morilib Pattern match

Morilib Pattern match is a library which can be Haskell-like pattern matching in JavaScript.  

## How to use

```html
<script src="pattern.js"></script>
```

## Example

```javascript
const P = Pattern();

// example: Maybe type
const Just = P.create();
const Nothing = P.create()();

const maybeBind = v => f => P.match([{
    p: [Just(P.v)],
    f: a => f(a.v)
},
{
    p: [Nothing],
    f: a => Nothing
}])(v);

console.log(maybeBind(Just(2))
    (v => maybeBind(Just(3))
    (w => Just(v + w))).at(0));       // output: 5
console.log(maybeBind(Just(2))
    (v => maybeBind(Nothing)
    (w => Just(v + w))) === Nothing); // output: true

// example: Binary search tree
const Tree = P.create();
const search = v => P.match([{
    p: [Tree(P.v, P.l, P.r)],
    f: a => v < a.v ? search(v)(a.l) : v > a.v ? search(v)(a.r) : v
},
{
    p: [P.v],
    f: a => v === a.v
}]);

const tree = Tree(5, Tree(3, 1, 4), Tree(7, 6, 8));
console.log(search(1)(tree));   // output: true
console.log(search(8)(tree));   // output: true
console.log(search(2)(tree));   // output: false

// example: Inseration of red-brack tree
const RBTree = P.create();
const Black = P.create()("black");
const Red = P.create()("red");
const Nil = P.create()("nil");
const balance = P.match([{
    p: P.Or(
        [RBTree(P.z, Black, RBTree(P.y, Red, RBTree(P.x, Red, P.a, P.b), P.c), P.d)],
        [RBTree(P.z, Black, RBTree(P.x, Red, P.a, RBTree(P.y, Red, P.b, P.c)), P.d)],
        [RBTree(P.x, Black, P.a, RBTree(P.z, Red, RBTree(P.y, Red, P.b, P.c), P.d))],
        [RBTree(P.x, Black, P.a, RBTree(P.y, Red, P.b, RBTree(P.z, Red, P.c, P.d)))]),
    f: a => RBTree(a.y, Red, RBTree(a.x, Black, a.a, a. b), RBTree(a.z, Black, a.c, a.d)),
},
{
    p: [P.v],
    f: a => a.v
}]);
const insertRBAux = (t, el) => P.match([{
    p: [Nil],
    f: a => RBTree(el, Red, Nil, Nil)
},
{
    p: [RBTree(P.v, P.c, P.l, P.r)],
    f: a => {
        if(a.v < el) {
            const nr = insertRBAux(a.r, el);
            const nv = RBTree(a.v, a.c, a.l, nr);

            return a.c === Red ? nv : balance(nv);
        } else if(a.v > el) {
            const nl = insertRBAux(a.l, el);
            const nv = RBTree(a.v, a.c, nl, a.r);

            return a.c === Red ? nv : balance(nv);
        } else {
            return RBTree(a.v, a.c, a.l, a.r);
        }
    }
}])(t);
const insertRB = (t, el) => t === Nil ? RBTree(el, Black, Nil, Nil) : P.match([{
    p: [RBTree(P.v, P._, P.l, P.r)],
    f: a => RBTree(a.v, Black, a.l, a.r)
}])(insertRBAux(t, el));

// insert values sequentially
const insertRBAll = (...args) => args.reduce((accum, v) => insertRB(accum, v), Nil);
const tree1 = insertRBAll(1, 2, 3, 4, 5, 6, 7, 8);
console.log(tree1);     // tree is balanced
```


