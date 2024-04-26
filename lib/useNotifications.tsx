/*
    react hook that holds global application error messages and functions for manipulating
 */

import {createContext, JSX, useContext, useState} from "react";
import { v4 as uuidv4 } from 'uuid'

export enum NotificationType {INFO, WARN, ERROR}

export type Notification = {
    readonly id: string
    readonly type: NotificationType
    readonly message: string
    readonly link?: string
}

export const newInfoNotification = (message: string): Notification => ({id: uuidv4(), type: NotificationType.INFO, message})
export const newWarnNotification = (message: string): Notification => ({id: uuidv4(), type: NotificationType.WARN, message})
export const newErrorNotification = (message: string): Notification => ({id: uuidv4(), type: NotificationType.ERROR, message})

/**
 * Holds and manages the error messages
 */
type UseNotificationsValues = {
    readonly notifications: Array<Notification>

    /**
     * Adds an error message to the list of errors
     * @param message The new error messages
     */
    push: (notification: Notification) => void

    // pushInfo: (message: string) => void

    /**
     * Removes and returns the most recent error message and returns it
     * @return the most recent error message
     */
    pop: () => Notification | undefined

    /**
     * Replaces all the error messages with the specified ones
     * @param messages The new error messages
     */
    set: (messages: Array<Notification>) => void

    /**
     * Removes the error message at the specified index
     * @param index The index of the error message to remove
     */
    remove: (index: number) => void

    /**
     * Clears all the error messages
     */
    clear: () => void

    numNotificationsOf: (notificationType: NotificationType) => number
    numErrors: () => number
    numWarnings: () => number
    numInfo: () => number
}

const initialNotifications: UseNotificationsValues = {
    notifications: [],
    push: _ => {},
    pop: () => undefined,
    set: _ => {},
    remove: _ => "",
    clear: () => {},
    numNotificationsOf: () => -1,
    numErrors: () => 0,
    numWarnings: () => 0,
    numInfo: () => 0,
}

type Props = {
    children: JSX.Element | Array<JSX.Element>
}

const ErrorMessagingContext = createContext<UseNotificationsValues>(initialNotifications)

export default function ErrorMessagingProvider(props: Props): JSX.Element {
    const [notifications, setNotifications] = useState<Array<Notification>>([])

    /**
     * **Updates State**<br>
     * Adds an error message to the list of errors
     * @param notification The new error messages
     */
    function push(notification: Notification): void {
        setNotifications(prev => [...prev, notification])
    }

    /**
     * **Updates State**<br>
     * Removes and returns the most recent error message and returns it
     * @return the most recent error message
     */
    function pop(): Notification | undefined {
        const message = notifications.pop()
        setNotifications(notifications.slice())
        return message
    }

    /**
     * **Updates State**<br>
     * Replaces all the error messages with the specified ones
     * @param notifications The new error messages
     */
    function set(notifications: Array<Notification>): void {
        setNotifications(notifications)
    }

    /**
     * **Updates State**<br>
     * Removes the notification at the specified index
     * @param index The index of the notification to remove
     */
    function remove(index: number): void {
        if (index < notifications.length) {
            notifications.splice(index, 1)
            setNotifications(notifications.slice())
        }
    }

    /**
     * **Updates State**<br>
     * Removes all the error messages
     */
    function clear(): void {
        setNotifications([])
    }

    function numNotificationsOf(notificationType: NotificationType): number {
        return notifications.filter(notification => notification.type == notificationType).length
    }

    const numErrors = () => numNotificationsOf(NotificationType.ERROR)
    const numWarnings = () => numNotificationsOf(NotificationType.WARN)
    const numInfo = () => numNotificationsOf(NotificationType.INFO)

    return <ErrorMessagingContext.Provider value={{
        push, pop, set, remove, clear,
        numNotificationsOf, numErrors, numWarnings, numInfo,
        notifications
    }}>
        {props.children}
    </ErrorMessagingContext.Provider>
}

/**
 * The hook that also ensures that it is only used within the error messaging provider
 */
export function useNotifications(): UseNotificationsValues {
    const context = useContext<UseNotificationsValues>(ErrorMessagingContext)
    if (context.notifications === undefined) {
        throw new Error("useErrorMessaging hook can only be used when the component is a child <ErrorMessagingProvider>")
    }
    return context
}