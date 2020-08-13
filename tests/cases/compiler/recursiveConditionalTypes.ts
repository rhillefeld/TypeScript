// @strict: true
// @declaration: true

// Awaiting promises

type Awaited<T> =
    T extends null | undefined ? T :
    T extends PromiseLike<infer U> ? Awaited<U> :
    T;

type MyPromise<T> = {
    then<U>(f: ((value: T) => U | PromiseLike<U>) | null | undefined): MyPromise<U>;
}

type InfinitePromise<T> = Promise<InfinitePromise<T>>;

type P0 = Awaited<Promise<string | Promise<MyPromise<number> | null> | undefined>>;
type P1 = Awaited<any>;
type P2 = Awaited<InfinitePromise<number>>;  // Error

function f11<T, U extends T>(tx: T, ta: Awaited<T>, ux: U, ua: Awaited<U>) {
    ta = ua;
    ua = ta;  // Error
    ta = tx;  // Error
    tx = ta;  // Error
}

// Flattening arrays

type Flatten<T extends readonly unknown[]> = T extends unknown[] ? _Flatten<T>[] : readonly _Flatten<T>[];
type _Flatten<T> = T extends readonly (infer U)[] ? _Flatten<U> : T;

type InfiniteArray<T> = InfiniteArray<T>[];

type B0 = Flatten<string[][][]>;
type B1 = Flatten<string[][] | readonly (number[] | boolean[][])[]>;
type B2 = Flatten<InfiniteArray<string>>;
type B3 = B2[0];  // Error

// Repeating tuples

type TupleOf<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

type TT0 = TupleOf<string, 4>;
type TT1 = TupleOf<number, 0 | 2 | 4>;
type TT2 = TupleOf<number, number>;
type TT3 = TupleOf<number, any>;
type TT4 = TupleOf<number, 100>;  // Depth error

function f22<N extends number, M extends N>(tn: TupleOf<number, N>, tm: TupleOf<number, M>) {
    tn = tm;
    tm = tn;
}

declare function f23<T>(t: TupleOf<T, 3>): T;

f23(['a', 'b', 'c']);  // string

// Inference from nested instantiations of same generic types

type Box1<T> = { value: T };
type Box2<T> = { value: T };

declare function foo<T>(x: Box1<Box1<T>>): T;

declare let z: Box2<Box2<string>>;

foo(z);  // unknown, but ideally would be string (requires unique recursion ID for each type reference)

// Intersect tuple element types

type Intersect<U extends any[], R = unknown> = U extends [infer H, ...infer T] ? Intersect<T, R & H> : R;

type QQ = Intersect<[string[], number[], 7]>;

// Infer between structurally identical recursive conditional types

type Unpack1<T> = T extends (infer U)[] ? Unpack1<U> : T;
type Unpack2<T> = T extends (infer U)[] ? Unpack2<U> : T;

function f20<T, U extends T>(x: Unpack1<T>, y: Unpack2<T>) {
    x = y;
    y = x;
    f20(y, x);
}

type Grow1<T extends unknown[], N extends number> = T['length'] extends N ? T : Grow1<[number, ...T], N>;
type Grow2<T extends unknown[], N extends number> = T['length'] extends N ? T : Grow2<[string, ...T], N>;

function f21<T extends number>(x: Grow1<[], T>, y: Grow2<[], T>) {
    f21(y, x);  // Error
}
