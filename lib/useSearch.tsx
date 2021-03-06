import * as React from 'react';
import {createContext, useContext, useState} from 'react';

interface UseSearchValues {
    readonly current?: string
    readonly accumulated: Array<string>
    updateCurrent: (value: string) => void
    appendCurrent: (value: string) => void
    clearCurrent: () => void
    addAccumulated: (value: string) => void
    deleteAccumulated: (value: string) => void
    clearAccumulated: () => void
}

const initialSearchValues: UseSearchValues = {
    accumulated: [],
    updateCurrent: noop,
    appendCurrent: noop,
    clearCurrent: noop,
    addAccumulated: noop,
    deleteAccumulated: noop,
    clearAccumulated: noop
}

function noop() {
    /* empty */
}
const SearchContext = createContext<UseSearchValues>(initialSearchValues);

interface Props {
    children: JSX.Element | Array<JSX.Element>;
}

/**
 * Manages the search state for the children
 * @param props The properties holding the children
 * @constructor
 */
export default function SearchProvider(props: Props): JSX.Element {
    const [current, setCurrent] = useState<string | undefined>()
    const [accumulated, setAccumulated] = useState<Array<string>>(() => [])

    function updateCurrent(value: string): void {
        setCurrent(value)
    }

    function appendCurrent(value: string): void {
        setCurrent(cur => cur !== undefined ? cur.concat(value) : value)
    }

    function clearCurrent(): void {
        setCurrent(undefined)
    }

    function addAccumulated(value: string): void {
        if (value !== undefined && value !== '') {
            setAccumulated(acc => [...acc, value])
        }
    }

    function deleteAccumulated(value: string): void {
        setAccumulated(acc => acc.filter(search => search !== value))
    }

    function clearAccumulated(): void {
        setAccumulated([])
    }

    const {children} = props;
    return <SearchContext.Provider value={{
        current, updateCurrent, appendCurrent, clearCurrent,
        accumulated, addAccumulated, deleteAccumulated, clearAccumulated
    }}>
        {children}
    </SearchContext.Provider>
}

/**
 * React hook for managing the search state
 * @return An object that specifies the search state
 */
export function useSearch(): UseSearchValues {
    const context = useContext<UseSearchValues>(SearchContext)
    const {
        updateCurrent, appendCurrent, clearCurrent,
        accumulated, addAccumulated, deleteAccumulated, clearAccumulated
    } = context
    if (
        updateCurrent === undefined || appendCurrent === undefined || clearCurrent === undefined ||
        accumulated === undefined || addAccumulated === undefined || deleteAccumulated === undefined ||
        clearAccumulated === undefined
    ) {
        throw new Error("useSearch hook can only be used when the component is a child of <SearchProvider/>")
    }
    return context
}
