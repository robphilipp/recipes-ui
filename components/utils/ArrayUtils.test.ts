import {describe, expect, it} from "@jest/globals";
import {duplicateCountsByKey, duplicatesByKey} from "./ArrayUtils";

describe('when determining duplicate elements in an array', () => {
    const items = [
        {key: 'a', value: 'A'},
        {key: 'b', value: 'B'},
        {key: 'c', value: 'C'},
        {key: 'd', value: 'D'},
        {key: 'a', value: 'A'},
        {key: 'b', value: 'Aa'},
        {key: 'b', value: 'Ab'},
        {key: 'b', value: 'Ac'},
        {key: 'b', value: 'Ad'},
        {key: 'c', value: 'A'},
        {key: 'c', value: 'Af'},
        {key: 'e', value: 'E'},
    ]

    it('should be able to calculate duplicate counts by key', () => {
        const expected = new Map([
            ['a', 2],
            ['b', 5],
            ['c', 3],
        ])
        expect(duplicateCountsByKey(items, item => item.key)).toEqual(expected)
    })

    it('should be able to calculate duplicates by key', () => {
        const expected = new Map([
            ['a', [{key: 'a', value: 'A'}, {key: 'a', value: 'A'}]],
            ['b', [{key: 'b', value: 'B'}, {key: 'b', value: 'Aa'}, {key: 'b', value: 'Ab'}, {key: 'b', value: 'Ac'}, {key: 'b', value: 'Ad'}]],
            ['c', [{key: 'c', value: 'C'}, {key: 'c', value: 'A'}, {key: 'c', value: 'Af'}]]
        ])
        expect(duplicatesByKey(items, item => item.key)).toEqual(expected)
    })
})