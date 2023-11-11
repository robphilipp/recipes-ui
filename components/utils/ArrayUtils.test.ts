import {describe, expect, it} from "@jest/globals";
import {countByKey, duplicateCountsByKey, duplicatesByKey, zip} from "./ArrayUtils";

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

describe('when grouping elements be a key using a key function', () => {
    it('should be able to create the group-counts for each key', () => {
        const expected = new Map([
            ['a', 2],
            ['b', 5],
            ['c', 3],
            ['d', 1],
            ['e', 1]
        ])
        expect(countByKey(items, item => item.key)).toEqual(expected)
    })
    it('should be able to create groups for each key', () => {
        const expected = new Map([
            ['a', [{key: 'a', value: 'A'}, {key: 'a', value: 'A'}]],
            ['b', [{key: 'b', value: 'B'}, {key: 'b', value: 'Aa'}, {key: 'b', value: 'Ab'}, {key: 'b', value: 'Ac'}, {key: 'b', value: 'Ad'}]],
            ['c', [{key: 'c', value: 'C'}, {key: 'c', value: 'A'}, {key: 'c', value: 'Af'}]],
            ['d', [{key: 'd', value: 'D'}]],
            ['e', [{key: 'e', value: 'E'}]],
        ])
    })
})

describe('when determining duplicate elements in an array', () => {

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

describe('when zipping together arrays', () => {
    it('should return a zipped array with a length equal to the smallest size', () => {
        const one = ['1', '2', '3', '4', '5']
        const two = ['a', 'b', 'c', 'd']
        const three = ['ay', 'bee', 'sea', 'dee', 'eeee']
        const expected = [
            ['1', 'a', 'ay'],
            ['2', 'b', 'bee'],
            ['3', 'c', 'sea'],
            ['4', 'd', 'dee'],
        ]
        expect(zip(one, two, three)).toEqual(expected)
    })
})