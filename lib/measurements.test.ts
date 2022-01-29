import {convertFrom} from './measurements'
import {Units} from "../components/Recipe";

describe('test', () => {
    it('should work', () => {
        const converted = convertFrom({value: 1, unit: Units.CUP})(Units.TABLESPOON)
        expect(converted).toEqual({value: 16, unit: Units.TABLESPOON})
    })
})