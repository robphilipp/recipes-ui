/*
    react hook that holds global application error messages and functions for manipulating
 */

import {createContext, JSX, useContext, useState} from "react";

interface UseErrorMessageValues {
    readonly messages: Array<string>

    push: (message: string) => void

    pop: () => string | undefined

    set: (messages: Array<string>) => void

    remove: (index: number) => void

    clear: () => void
}

const initialErrorMessages: UseErrorMessageValues = {
    messages: [],
    push: message => {},
    pop: () => undefined,
    set: messages => {},
    remove: _ => "",
    clear: () => {}
}

type Props = {
    children: JSX.Element | Array<JSX.Element>
}

const ErrorMessagingContext = createContext<UseErrorMessageValues>(initialErrorMessages)

export default function ErrorMessagingProvider(props: Props): JSX.Element {
    const [messages, setMessages] = useState<Array<string>>([])

    function push(message: string): void {
        setMessages(prev => [...prev, message])
    }

    function pop(): string | undefined {
        const message = messages.pop()
        setMessages(messages.slice())
        return message
    }

    function set(messages: Array<string>): void {
        setMessages(messages)
    }

    function remove(index: number): void {
        if (index < messages.length) {
            messages.splice(index, 1)
            setMessages(messages.slice())
        }
    }

    function clear(): void {
        setMessages([])
    }
    return <ErrorMessagingContext.Provider value={{push, pop, set, remove, clear, messages}}>
        {props.children}
    </ErrorMessagingContext.Provider>
}

export function useErrorMessaging(): UseErrorMessageValues {
    const context = useContext<UseErrorMessageValues>(ErrorMessagingContext)
    if (context.messages === undefined) {
        throw new Error("useErrorMessaging hook can only be used when the component is a child <ErrorMessagingProvider>")
    }
    return context
}