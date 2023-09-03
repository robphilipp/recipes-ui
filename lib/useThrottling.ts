import {useRef} from "react";

/**
 * Throttling hook that is NOT "thread" safe, unless you pass in a unique ID for each user of the
 * throttle function. Otherwise, assumes that the value passed to the last call to the returned
 * throttle function is to be used in the callback.
 *
 * WARNING: Interleaving calls will reek havoc UNLESS you pass in a unique ID for each invocation
 * of {@link useThrottling}.
 *
 * @example
// set up the throttler to allow one call every 100 ms, has an empty string
// as the initial/default value, and a "unique" ID
const throttle = useThrottling<string>(100, "", "my-unique-throttler-id")

// form update handler that checks the value using a throttled REST call
async function handleUpdate(value: string): Promise<void> {
    throttle(value, async name => {
        // make a REST call that needs to be throttled
        const response = await axios.get(`/api/users/${name}`)
        // do some stuff with the response (e.g. validation)
        // ...
    })
    // update the value outside the throttler so that the form doesn't stutter
    updateValue(value)
}

 *
 * @param throttlePeriodMs The minimum number of milliseconds between calls to the callback.
 * @param defaultValue The default value of what is handed to the callback
 * @param id A unique ID for the throttler
 * @return A throttle function that takes two arguments: a value and a callback function
 * that is handed the latest value after `throttlePeriodMs` milliseconds
 */
export default function useThrottling<P>(
    throttlePeriodMs: number,
    defaultValue: P,
    id: string
): (value: P, callback: (value: P) => void) => void {
    const isThrottling = useRef<Map<string, boolean>>(new Map<string, boolean>())
    // if this is the first invocation of the throttle function with the specified ID, then
    // initialize the throttling state for that ID
    if (!isThrottling.current.has(id)) {
        isThrottling.current.set(id, false)
    }
    // if this is the first invocation of the throttle function with the specified ID, then
    // initialize the current throttled value for that ID
    const valueRef = useRef<Map<string, P>>(new Map<string, P>())
    if (!valueRef.current.has(id)) {
        valueRef.current.set(id, defaultValue)
    }

    // returns a new function for each call. The returned function has
    // a closure on the specified (unique) ID, on the isThrottling reference,
    // and the valueRef reference.
    return (value: P, callback: (value: P) => void) => {
        // update the value reference for the ID, regardless of the throttle state
        valueRef.current.set(id, value)

        // we are still throttling for this ID, se don't call the callback,
        // rather, just return
        if (isThrottling.current.get(id)) {
            return
        }

        // timeout has passed, so start throttling again for this ID
        isThrottling.current.set(id, true)
        setTimeout(
            () => {
                isThrottling.current.set(id, false)
                const value = valueRef.current.get(id)
                if (value !== undefined) {
                    callback(value)
                }
            },
            throttlePeriodMs
        )
    }
}
