interface ToString {
    toString: () => string
}

/**
 * A basic result for use when an operation that returns a result can either succeed or fail.
 * Instead of throwing an exception or returning `undefined` when the operation fails, the {@link Result}
 * can be marked as a failure, and an error object can be returned describing the reason for the failure. When
 * the operation succeeds, the {@link Result} can be marked as a success, and it then holds the
 * result of the operation.
 *
 * Additionally, it provides the chaining of results through {@link Result.map} and {@link Result.andThen}.
 * The {@link reduceToResult} is a reducing function that combine a set of {@link Result}-producing
 * operations into one {@link Result} that is a success iff all the operations are a success. And the
 * {@link forEachResult} accepts a set of {@link Result}s and combines them into one result that is a
 * success iff all the {@link Result}s are a success.
 *
 * When writing functions that return a {@link Result}, use the {@link successResult} function to create
 * a success {@link Result}. And use the {@link failureResult} function to create a, you guessed it, ad
 * failure {@link Result}.
 *
 * The {@link Result.succeeded} and {@link Result.failed} properties of a result report whether the
 * is a success or failure.
 *
 * The {@link Result.getOrUndefined} method returns a value on a success, or `undefined` on a failure.
 * The {@link Result.getOrDefault} method returns the value on a success, or the specified value when
 * the {@link Result} is a failure. And the {@link Result.getOrThrow} returns the value on a success, and
 * throws an error, with the error value, on a failure. Although the {@link Result.value} is available,
 * I encourage you not to use it directly, but rather use the above-mentioned accessor methods.
 */
export type Result<S, F extends ToString> = {
    /**
     * The success value of the result. This property is meant for internal use only.
     * @see getOrUndefined
     * @see getOrDefault
     * @see getOrThrow
     */
    readonly value?: S
    /**
     * The failure value of the result. This property is meant for internal use only.
     * @see failureOrUndefined
     */
    readonly error?: F

    /**
     * Property that is `true` when the result is a success and `false` when the result is a failure
     * @see failed
     */
    readonly succeeded: boolean
    /**
     * Property that is `true` when the result is a failure and `false` when the result is a success
     * @see succeeded
     */
    readonly failed: boolean

    /**
     * Determines the equality of this result and the specified one. The results are considered equal if:
     * 1. They are both a success and their values are equal
     * 2. They are both a failure and their errors are equal
     * @param result The result
     * @return `true` if the results are equal; `false` otherwise
     */
    equals: (result: Result<S, F>) => boolean
    /**
     * Determines the equality of this result and the specified one. The results are considered equal if:
     * 1. They are both a success and their values are equal
     * 2. They are both a failure and their errors are equal
     * @param result The result
     * @return `false` if the results are equal; `true` otherwise
     */
    nonEqual: (result: Result<S, F>) => boolean

    /**
     * Applies the specified `mapper` function to the success value of this result, and returns a new
     * {@link Result} that wraps the result of the `mapper`. When this result is a failure,
     * then it does **not** apply the `mapper`, but rather merely returns this result.
     * @param mapper The mapper function that accepts the success value and returns a new value.
     * @return When this result is a success, then returns a {@link Result} that wraps the result
     * of the `mapper` function. When this result is a failure, the returns this result.
     */
    map: <SP>(mapper: (value: S) => SP) => Result<SP, F>
    /**
     * Applies the specified `next` function to the success value of this result, and returns the
     * result of the `next` function. When this result is a failure, then it does **not** apply the
     * `next` function, but rather merely returns the failure result.
     * @param next The function to apply to this result's success value
     * @return When this result is a success, then returns the result of the `next` function. When
     * this result is a failure, then returns this result.
     */
    andThen: <SP>(next: (value: S) => Result<SP, F>) => Result<SP, F>
    /**
     * When this result is a failure, then applies the specified `mapper` function to the failure.
     * When the result is a success, then simply returns a copy of this result. This function is
     * useful when you want to update the failure information at the end of a result chain.
     * @param mapper A mapper that accepts the failure and returns a new failure
     * @return When the result is a failure, maps the failure to a new failure and returns it
     */
    mapFailure: <FP>(mapper: (failure: F) => FP) => Result<S, FP>
    /**
     * Changes the type of the result when the result is a failure. This is helpful when checking a
     * result for failure, and then need to return a result whose success type is different.
     * @param A fallback failure in case the failure in the result is undefined
     * @return A new failure result with the new success type
     */
    asFailureOf: <SP>(fallback: F) => Result<SP, F>

    /**
     * Convenience method to make it a bit easier to work with chained promises and results.
     *
     *
     * Attempts to lift the Promise out of the result and re-wrap the result as a promise. In other words,
     * attempts to convert a `Result<Promise<S>, F>` into a `Promise<Result<SP>, F` where the type `SP`
     * equals to the type `S` of the resolved promise.
     *
     *
     * Additionally, when lifting a {@link Promise} for a {@link Result} out of a {@link Result}, this function
     * we also flatten the resulting {@link Result} of a {@link Result}. In other words, it will convert
     * `Result<Promise<Result<S, F>, F>` into a `Promise<Result<SP, F>>`.
     *
     * @param success The success, which must be a `Promise<S>`. When the this parameter is not a `Promise<S>`,
     * then wraps the result in a Promise.
     * @param failure The failure
     * @return a promise to a result whose success type is that same as the type of the promise's resolved value
     */
    liftPromise: <SP>() => Promise<Result<SP, F>>

    /**
     * When this result is a success, calls the `handler` function on this result's value, and
     * returns this result. When this result is a failure, then does **not** call the `handler`, but
     * rather just returns this result. Note that this method does not modify this result.
     * @param handler The callback that accepts the success value, but doesn't return anything.
     * @return This result.
     * @see onFailure
     */
    onSuccess: (handler: (value: S) => void) => Result<S, F>
    /**
     * When this result is a failure, calls the `handler` function on this result's error, and
     * returns this result. When this result is a success, then does **not** call the `handler`, but
     * rather just returns this result. Note that this method does not modify this result.
     * @param handler The callback that accepts the error, but doesn't return anything.
     * @return This result.
     * @see onSuccess
     */
    onFailure: (handler: (error: F) => void) => Result<S, F>

    /**
     * @return When this result is a success, then returns the value. Otherwise returns `undefined`.
     * @see getOrDefault
     * @see getOrThrow
     * @see failureOrUndefined
     */
    getOrUndefined: () => S | undefined
    /**
     * @return When this result is a success, then returns the value. Otherwise returns the specified
     * default value.
     * @see getOrUndefined
     * @see getOrThrow
     * @see failureOrUndefined
     */
    getOrDefault: (value: S) => S
    /**
     * @return When this result is a success, then returns the value. Otherwise throws an error that
     * contains the error in this result.
     * @see getOrUndefined
     * @see getOrDefault
     * @see failureOrUndefined
     */
    getOrThrow: () => S

    /**
     * @return When this result is a failure, then returns the error. Otherwise returns `undefined`.
     * @see getOrUndefined
     * @see getOrDefault
     * @see getOrThrow
     */
    failureOrUndefined: () => F | undefined
}

/**
 * Factory function for a successful {@link Result}.
 * @param success The value of the successful operation.
 * @return A {@link Result} that holds the value of the successful operation and an undefined error.
 */
export const successResult = <S, F extends ToString>(success: S): Result<S, F> => resultFrom({success} as ResultType<S, F>)
/**
 * Factory function for a failure {@link Result}.
 * @param failure The error reported from the operation.
 * @return A {@link Result} that holds the failure and an undefined success
 */
export const failureResult = <S, F extends ToString>(failure: F): Result<S, F> => resultFrom({failure} as ResultType<S, F>)

/**
 * Type definition for the optional success and failure
 */
type ResultType<S, F extends ToString> = { success?: S, failure?: F }

/**
 * Convenience function for collapsing (flatMap) an array of {@link Result}s into a single {@link Result}
 * that holds an array of values. All results in the specified array of results must be successful in order
 * for the returned result to be a success.
 * @param results An array of results
 * @return A {@link Result} holding an array of successful values, or a failure if any of the results in
 * the array are failures.
 */
export function resultFromAll<T, F extends ToString>(results: Array<Result<T, F>>): Result<Array<T>, string> {
    const successes = results.filter(result => result.succeeded).map(result => result.getOrThrow())
    if (successes.length !== results.length) {
        return failureResult(`All results were not successful; number_failed: ${results.length - successes.length}`)
    }
    return successResult(successes)
}

/**
 * Convenience function for collapsing (flatMap) an array of {@link Result}s into a single {@link Result}
 * that holds an array of successful values. Any failure results will be discarded. If all the results
 * are failures, then returns a successful result holding an empty array.
 * @param results An array of results
 * @return A {@link Result} holding an array of successful values. Any failures will be discarded.
 */
export function resultFromAny<T, F extends ToString>(results: Array<Result<T, F>>): Result<Array<T>, string> {
    return successResult(results.filter(result => result.succeeded).map(result => result.getOrThrow()))
}

/**
 * A factory method for creating results.
 * @param result The result of an operation
 * @return The {@link Result} of an operation.
 * @see successResult
 * @see failureResult
 */
function resultFrom<S, F extends ToString>(result: ResultType<S, F>): Result<S, F> {
    const {success, failure} = result
    return {
        value: success,
        error: failure,

        succeeded: success !== undefined && failure === undefined,
        failed: failure !== undefined,

        equals: (result: Result<S, F>) => equalsResult(result, success, failure),
        nonEqual: (result: Result<S, F>) => !equalsResult(result, success, failure),

        map: <SP>(mapper: (value: S) => SP) => mapValue(mapper, success, failure),
        andThen: <SP>(next: (value: S) => Result<SP, F>) => thenValue(next, success, failure),
        mapFailure: <FP>(mapper: (failure: F) => FP) => mapFailure(mapper, success, failure),
        asFailureOf: <SP>(fallback: F) => asFailure<SP, F>(failure || fallback),

        liftPromise: () => liftPromiseFromOrCreate(success, failure),

        onSuccess: (handler: (value: S) => void) => onSuccess(handler, success, failure),
        onFailure: (handler: (error: F) => void) => onFailure(handler, success, failure),

        getOrUndefined: () => success,
        getOrDefault: (value: S) => (success !== undefined && failure === undefined) ? success : value,
        getOrThrow: () => getOrThrow(success, failure),

        failureOrUndefined: () => failure
    }
}

/**
 * Determines the equality of two results. Two results are considered equal if:
 * 1. They are both a success and their values are equal
 * 2. They are both a failure and their errors are equal
 * @param result The result
 * @param [success=undefined] The success of the second result
 * @param [failure=undefined] The failure of the second result
 * @return `true` if the results are equal; `false` otherwise
 */
function equalsResult<S, F extends ToString>(result: Result<S, F>, success?: S, failure?: F): boolean {
    if (result.succeeded !== (success !== undefined && failure === undefined)) return false
    if (result.succeeded) return result.value === success
    return result.error === failure
}

/**
 * When the specified `success` is defined, applies the specified `mapper` function to the success
 * value and wraps the value of the function call in a {@link Result}. When the specified `success`
 * is not defined, then wraps the failure in a {@link Result} and returns it.
 * @param mapper The mapper function that accepts the success value and returns a new value.
 * @param [success=undefined] The success value (which may be undefined)
 * @param [failure=undefined] The failure (which may be undefined)
 * @return A {@link Result} that holds the mapped success value (when `success` is defined) or the failure
 * when `success` is not defined).
 * @see thenValue
 */
function mapValue<S, SP, F extends ToString>(mapper: (value: S) => SP, success?: S, failure?: F): Result<SP, F> {
    return (success !== undefined ?
            resultFrom({success: mapper(success)}) :
            resultFrom({failure})
    ) as Result<SP, F>
}

/**
 * When the specified `success` is defined, then applies the specified `next` function to the success
 * value and returns the result from the `next` function. When the specified `success` is not defined,
 * the wraps the failure into a result and returns it
 * @param next A function that accepts a next value and returns a {@link Result}
 * @param [success=undefined] The success value (which may be undefined)
 * @param [failure=undefined] The failure (which may be undefined)
 * @return When the specified `success` is defined, then returns the {@link Result} generated from the
 * specified `next` function. Otherwise returns the failure wrapped in a {@link Result}.
 * @see mapValue
 */
function thenValue<S, SP, F extends ToString>(next: (value: S) => Result<SP, F>, success?: S, failure?: F): Result<SP, F> {
    return (success !== undefined ?
            next(success) :
            resultFrom({failure})
    ) as Result<SP, F>
}

/**
 * When the specified `failure` is defined, then applies the specified `mapper` function to the failure
 * value and wraps the failure in a failure {@link Result}. When the specified `failure` is not defined
 * then wraps the `success` in a success {@link Result} and returns it.
 * @param mapper The mapper function that accepts the failure value and returns a new failure
 * @param [success=undefined] The success value (which may be undefined)
 * @param [failure=undefined] The failure (which may be undefined)
 * @return A {@link Result} that holds the mapped failure value (which `failure` is defined) or the
 * success when `failure` is not defined
 */
function mapFailure<S, F extends ToString, FP extends ToString>(mapper: (failure: F) => FP, success?: S, failure?: F): Result<S, FP> {
    return (failure !== undefined ?
            failureResult(mapper(failure)) :
            resultFrom({success})
    ) as Result<S, FP>
}

function asFailure<SP, F extends ToString>(failure: F): Result<SP, F> {
    return failureResult<SP, F>(failure)
}

/**
 * Attempts to lift the Promise out of the result and re-wraps the result as a promise. In other words,
 * attempts to convert a `Result<Promise<S>, F>` into a `Promise<Result<SP, F>>` where the type `SP`
 * equals to the type `S` of the resolved promise.
 *
 * And, as an extra bonus, but only if you order in the next 10 minutes, it'll also convert
 * `Result<Promise<Result<S, F>, F>` into a `Promise<Result<SP, F>>`.
 *
 * @param success The success, which must be a `Promise<S>`. When the this parameter is not a `Promise<S>`,
 * then wraps the result in a Promise.
 * @param failure The failure
 * @return a promise to a result whose success type is that same as the type of the promise's resolved value
 */
async function liftPromiseFromOrCreate<S, SP, F extends ToString>(success?: S, failure?: F): Promise<Result<SP, F>> {
    // create a guard to test if the promised value is a result (specifically has an andThen function
    // (this is a type-predicate signature that returns true when value has an `andThen` function, and once
    // asserted, then the value takes on that type)
    const hasAndThen = <S, F extends ToString>(value: any): value is Result<S, F> => 'andThen' in value

    if (success !== undefined) {
        if (success instanceof Promise) {
            const promisedValue = await (success as Promise<SP>)
            // when the promised value is already a result, then just return it
            if (hasAndThen<SP, F>(promisedValue)) {
                return promisedValue
            }
            // otherwise wrap it in a result
            return successResult<SP, F>(promisedValue)
        }
        return successResult<SP, F>(success as unknown as SP)
    }
    return resultFrom({failure})
}

/**
 * When the specified `success` is defined, then calls the specified `handler` function, passing it
 * the success value. In all cases, returns a new {@link Result} that wraps the specified `success`
 * and `failure`.
 * @param handler The handler that gets called when the specified `success` is defined. The function
 * must access the `success`.
 * @param [success=undefined] The success value (which may be undefined)
 * @param [failure=undefined] The failure (which may be undefined)
 * @return A new {@link Result} that wraps the specified `success` and `failure` values.
 * @see onFailure
 */
function onSuccess<S, F extends ToString>(handler: (value: S) => void, success?: S, failure?: F): Result<S, F> {
    if (success !== undefined) {
        handler(success)
    }
    return resultFrom({success, failure})
}

/**
 * When the specified `success` is **not** defined, then calls the specified `handler` function, passing
 * it the `failure`. In all cases, returns a new {@link Result} that wraps the specified `success`
 * and `failure`.
 * @param handler The handler that gets called when the specified `success` is **not** defined. The
 * function must accept the `failure`.
 * @param success The success value (which may be undefined)
 * @param failure The failure (which may be undefined)
 * @return A new {@link Result} that wraps the specified `success` and `failure` values.
 * @see onSuccess
 */
function onFailure<S, F extends ToString>(handler: (error: F) => void, success?: S, failure?: F): Result<S, F> {
    if (failure !== undefined) {
        handler(failure)
    }
    return resultFrom({success, failure})
}

/**
 * @param [success=undefined] The success value (which may be undefined)
 * @param [failure=undefined] The failure (which may be undefined)
 * @return When the specified `success` is defined and the specified `failure` is **not** defined, then returns
 * the `success` value. Otherwise throws an error with the specified `failure`.
 */
function getOrThrow<S, F extends ToString>(success?: S, failure?: F): S {
    if (success !== undefined && failure === undefined) {
        return success
    }
    throw Error(failure?.toString())
}

/**
 * For each result in the `resultList` applies the `handler` function, and then reduces each of those
 * results into a single result. The single result is a "success" iff all the results spewed from the
 * `handler` is a "success". Conversely, if an of those results is a "failure", the single result is
 * also a failure.
 *
 * The single result holds an array of all the success values when it is a success. When it is a failure,
 * then holds a list of all the failures.
 *
 * @template SI The type of the success elements in the input array
 * @template FI The type of the failure elements in the input array
 * @template SO The success type for the operation in the handler that leads to a successful result
 * @template FO The failure type for the operation in the handler that leads to a failed result
 * @param resultList The list of the {@link Result}s
 * @param handler The handler that accepts a {@link Result} and returns a new {@link Result}
 * @return A single {@link Result} which is either a success or failure. When the result is a success,
 * then the {@link Result} holds an array of success values. When the result is a failure, then the
 * {@link Result} holds an array of the failures.
 */
export function forEachResult<SI, FI extends ToString, SO, FO extends ToString>(
    resultList: Array<Result<SI, FI>>,
    handler: (result: Result<SI, FI>) => Result<SO, FO>
): Result<Array<SO>, Array<FO>> {
    const results = resultList.map(value => handler(value));
    const successes = results.filter(result => result.succeeded).length;
    if (successes !== results.length) {
        const failed: Array<FO> = []
        for (let i = 0; i < results.length; ++i) {
            const result = results[i]
            if (result.failed && result.error !== undefined) {
                failed.push(result.error)
            }
        }
        return failureResult<Array<SO>, Array<FO>>(failed)
    }
    const succeeded: Array<SO> = []
    for (let i = 0; i < results.length; ++i) {
        const result = results[i]
        if (result.succeeded && result.value !== undefined) {
            succeeded.push(result.value)
        }
    }
    return successResult<Array<SO>, Array<FO>>(succeeded)
}
/**
 * Applies the handler to the specified set of elements, lifting the result outside of the array.
 * Given an array of numbers to which we apply a {@link Result} returning operation, the overall result is a
 * success of all the operations are successes. When any of the operations returns a failure, then
 * the failures are collected, and the overall result is a failure.
 *
 * @example
 * const results = await forEachPromise([1,2,3,4,5], elem => new Promise<Result<number, string>>((resolve, reject) => {
 *     setTimeout(() => {
 *         resolve(successResult(elem * 2))
 *     }, 300)
 * }))
 *
 * expect(results.getOrThrow()).toEqual([2,4,6,8,10])
 *
 * @example
 * const results = await forEachPromise([1,2,3,4,5], elem => new Promise<Result<number, string>>((resolve, reject) => {
 *     setTimeout(() => {
 *         if (elem % 2 === 0) {
 *             resolve(successResult(elem / 2))
 *         } else {
 *             reject("number must be even")
 *         }
 *     }, 300)
 * }))
 *
 * expect(results.failed).toBeTruthy()
 * expect(results.error).toEqual(["number must be even", "number must be even", "number must be even"])
 *
 * @param elems The elements on which to perform a {@link Result} returning operation
 * @param handler The operation that accepts an element and returns a {@link Result}
 * @return A {@link Result} wrapping the array of success values, or failure values.
 */
export function forEachElement<V, S, F extends ToString>(elems: Array<V>, handler: (elem: V) => Result<S, F>): Result<Array<S>, Array<F>> {
    const results = elems.map(elem => handler(elem))
    const successes = results.filter(result => result.succeeded).length
    if (successes !== results.length) {
        const failed: Array<F> = []
        for (let i = 0; i < results.length; ++i) {
            const result = results[i]
            if (result.failed && result.error !== undefined) {
                failed.push(result.error)
            }
        }
        return failureResult<Array<S>, Array<F>>(failed)
    }
    const succeeded: Array<S> = []
    for (let i = 0; i < results.length; ++i) {
        const result = results[i]
        if (result.succeeded && result.value !== undefined) {
            succeeded.push(result.value)
        }
    }
    return successResult(succeeded)
}

/**
 * Accepts an array of values, and for each value calls a handler function that returns a {@link Promise} to
 * a {@link Result} from operating on that value. Then returns a {@link Promise} to a {@link Result} holding
 * an array of successes, or an array of failures.
 * @param elems The elements to which to apply the specified handler function
 * @param handler The function that returns a {@link Result} for a specified value
 * @return a {@link Promise} to a {@link Result} holding an array of successes, or an array of failures.
 */
export async function forEachPromise<V, S, F>(elems: Array<V>, handler: (elem: V) => Promise<Result<S, F>>): Promise<Result<Array<S>, Array<F>>> {
    const results = elems.map(elem => handler(elem))
    try {
        // wait until all the promises have settled as resolved or rejected
        const promisedResults = await Promise.allSettled(results)
        // when there are failures, then the overall result is a failure, and report it
        const rejected = promisedResults
            .filter(settled => settled.status === 'rejected')
            // @ts-ignore
            .map(settled => settled.reason)
        if (rejected.length > 0) {
            return failureResult(rejected.map(reject => reject))
        }

        // no failures so report the success results
        const succeeded: Array<Result<S, F>> = promisedResults
            .filter(settled => settled.status === 'fulfilled')
            // @ts-ignore
            .map(settled => settled.value)
        return forEachResult(succeeded, result => result)
    } catch (reason) {
        // something went terribly wrong
        console.error("Result::forEachPromise failed to settle all results", reason)
        return failureResult([reason])
    }
}

/**
 * Accepts an array of values of type `V` and applies the specified `reducer` function to each
 * value. The `reducer` function accepts a value and a reduced-value and returns a {@link Result}.
 * When all the {@link Result}s are `success`, returns the reduced-value wrapped in a new {@link Result}.
 * When any of the {@link Result} are a failure, returns a failure that is an array of all the
 * failures.
 * @template V The type of the elements in the input array
 * @template S The success type for the operation in the handler that leads to a successful result
 * @template F The failure type for the operation in the handler that leads to a failed result
 * @param values The values to reduce
 * @param reducer The reducer function
 * @param initialValue The initial value of the reduced value
 * @return A {@link Result} that holds the reduced value. Or in the event of one or more failures,
 * returns a {@link Result} that holds a list of failures.
 */
export function reduceToResult<V, S, F extends ToString>(
    values: Array<V>,
    reducer: (reducedValue: S, value: V) => Result<S, F>,
    initialValue: S
): Result<S, Array<F>> {
    const failures: Array<F> = [];
    const reduced: S | undefined = values.reduce(
        (reducedValue: S, value: V) => {
            const result = reducer(reducedValue, value);
            if (result.error !== undefined) {
                failures.push(result.error);
                return reducedValue;
            }
            return result.value || reducedValue;
        },
        initialValue
    );

    if (reduced === undefined || failures.length > 0) {
        return failureResult<S, Array<F>>(failures)
    }
    return successResult(reduced);
}
