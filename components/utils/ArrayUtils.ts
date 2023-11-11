/**
 * Creates a {@link Map} where the keys are the results of the specified {@link keyFn}, and
 * the values are arrays holding the {@link items} that map to the specified {@link keyFn}
 * @param items The items to group
 * @param keyFn The function that calculates to the key on which to group
 * @return A {@link Map} holding the keys and their associated groups
 */
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

/**
 * Creates a {@link Map} the holds the number of times an item mapped to the same key
 * (by the {@link keyFn}) occurs in the {@link items}.
 * @param items The items to group
 * @param keyFn The function that calculates to the key on which to group
 * @return A {@link Map} holding the keys and their associated item count
 */
export function countByKey<T, K>(items: Array<T>, keyFn: (t1: T) => K): Map<K, number> {
    return new Map(Array
        .from(groupByKey(items, keyFn))
        .map(([key, elems]): [K, number] => [key, elems.length])
    )
}

/**
 * Creates a {@link Map} that holds the count for items that map to key. The {@link Map} holds
 * the key (result of applying the {@link keyFn} to an item in the {@link items} list), to the
 * number of times an item is mapped to that same key.
 * @param items The items in which to look for duplicate mappings
 * @param keyFn The function that maps an item to a key
 * @return A {@link Map} holding the key (result of applying the {@link keyFn} to an item in
 * the {@link items} list), to the number of times an item is mapped to that same key.
 */
export function duplicateCountsByKey<T, K>(items: Array<T>, keyFn: (t1: T) => K): Map<K, number> {
    return new Map<K, number>(
        Array.from(countByKey(items, keyFn)).filter(([_, count]) => count > 1)
    )
}

/**
 * Creates a {@link Map} that holds keys onto which more than one item, in the {@link items} array
 * get mapped by the {@link keyFn}. Each key is associated with an array of the items that are
 * mapped to it, when at least 2 items are mapped to the key.
 * @param items The items in which to look for duplicate mappings
 * @param keyFn The function that maps an item to a key
 * @return A {@link Map} holding the key (result of applying the {@link keyFn} to an item in
 * the {@link items} list), to an array holding items that are to that same key, when at least
 * 2 items are mapped to that key.
 */
export function duplicatesByKey<T, K>(items: Array<T>, keyFn: (t1: T) => K): Map<K, Array<T>> {
    return new Map<K, Array<T>>(
        Array.from(groupByKey(items, keyFn).entries()).filter(([_, elems]) => elems.length > 1)
    )
}

/**
 * Zips together arrays with the resultant size being the size of the smallest array.
 * Taken from [dominikandreas](https://gist.github.com/dominikandreas)' solution, from these
 * [gists](https://gist.github.com/renaudtertrais/25fc5a2e64fe5d0e86894094c6989e10).
 * @param arrays The arrays to zip together
 * @return An array that has zipped together the arrays. The length of the array is the length
 * of the smallest array in {@link arrays}
 */
export function zip<T>(...arrays: Array<Array<T>>): Array<Array<T>> {
    // calculate the size of the smallest array
    const minSize = Math.min(...arrays.map(array => array.length))

    // grab the first array and then all the rest
    const [head, ...tail] = arrays

    return head
        // limit the size of the head array to the smallest array
        .slice(0, minSize)
        // append each element of the tail to the corresponding element in the head
        .map((elem, i) => [elem, ...tail.map(array => array[i])])
}
