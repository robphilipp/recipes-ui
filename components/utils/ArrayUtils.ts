export function groupByKey<T, K>(items: Array<T>, keyFn: (t1: T) => K): Map<K, Array<T>> {
    return items
        .map(item => [keyFn(item), item])
        .reduce<Map<K, Array<T>>>(
            (counts: Map<K, Array<T>>, [key, elem]: [K, T]) => {
                const elems = counts.get(key) || []
                return counts.set(key, [...elems, elem])
            },
            new Map<K, Array<T>>()
        )
}

export function countByKey<T, K>(items: Array<T>, keyFn: (t1: T) => K): Map<K, number> {
    return new Map(Array
        .from(groupByKey(items, keyFn))
        .map(([key, elems]): [K, number] => [key, elems.length])
    )
}

export function duplicateCountsByKey<T, K>(items: Array<T>, keyFn: (t1: T) => K): Map<K, number> {
    return new Map<K, number>(
        Array.from(countByKey(items, keyFn)).filter(([_, count]) => count > 1)
    )
}

export function duplicatesByKey<T, K>(items: Array<T>, keyFn: (t1: T) => K): Map<K, Array<T>> {
    return new Map<K, Array<T>>(
        Array.from(groupByKey(items, keyFn).entries()).filter(([_, elems]) => elems.length > 1)
    )
}
