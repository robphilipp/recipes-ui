/*
    react hook that holds global application error messages and functions for manipulating
 */

import {createContext, JSX, useContext, useState} from "react";

interface UseErrorMessageValues {
    readonly messages: Array<string>

    push(message: string): UseErrorMessageValues

    pop(): UseErrorMessageValues

    set(messages: Array<string>): UseErrorMessageValues

    remove(index: number): UseErrorMessageValues

    clear(): UseErrorMessageValues
}

const initialErrorMessages: UseErrorMessageValues = {
    messages: [],
    push: function (message: string): UseErrorMessageValues {
        this.messages.push(message)
        return this
    },
    pop: function (): UseErrorMessageValues {
        this.messages.pop()
        return this
    },
    set: function (messages: Array<string>): UseErrorMessageValues {
        this.messages = messages
        return this
    },
    remove: function (index: number): UseErrorMessageValues {
        if (index < this.messages.length) {
            this.messages.splice(index, 1)
        }
        return this
    },
    clear: function (): UseErrorMessageValues {
        this.messages = []
        return this
    }
}

type Props = {
    children: JSX.Element | Array<JSX.Element>
}

const ErrorMessagingContext = createContext<UseErrorMessageValues>(initialErrorMessages)

export default function ErrorMessagingProvider(props: Props): JSX.Element {
    const [messages, setMessages] = useState<Array<string>>([])
    return <ErrorMessagingContext.Provider value={{...initialErrorMessages, messages: messages}}>
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