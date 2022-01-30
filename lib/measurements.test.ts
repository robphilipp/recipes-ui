import {convertTo} from './measurements'
import {amountFor, Units} from "../components/Recipe";

describe('when converting like units', () => {
    it('should be able to convert to teaspoons', () => {
        const tspFrom = convertTo(Units.TEASPOON)
        expect(tspFrom(amountFor(1, Units.TABLESPOON)).getOrThrow().unit).toEqual(Units.TEASPOON)
        
        expect(tspFrom(amountFor(1, Units.TEASPOON)).getOrThrow().value).toBeCloseTo(1)
        expect(tspFrom(amountFor(1, Units.TABLESPOON)).getOrThrow().value).toBeCloseTo(3)
        expect(tspFrom(amountFor(1, Units.CUP)).getOrThrow().value).toBeCloseTo(48)
        expect(tspFrom(amountFor(1, Units.LITER)).getOrThrow().value).toBeCloseTo(3 * 67.62804540368599)
        expect(tspFrom(amountFor(1, Units.FLUID_OUNCE)).getOrThrow().value).toBeCloseTo(6)
        expect(tspFrom(amountFor(1, Units.PINT)).getOrThrow().value).toBeCloseTo(96)
        expect(tspFrom(amountFor(1, Units.QUART)).getOrThrow().value).toBeCloseTo(192)
        expect(tspFrom(amountFor(1, Units.GALLON)).getOrThrow().value).toBeCloseTo(768)
    })

    it('should be able to convert to tablespoons', () => {
        const tbspFrom = convertTo(Units.TABLESPOON)
        expect(tbspFrom(amountFor(1, Units.CUP)).getOrThrow().unit).toEqual(Units.TABLESPOON)
        
        expect(tbspFrom(amountFor(1, Units.TEASPOON)).getOrThrow().value).toBeCloseTo(1/3)
        expect(tbspFrom(amountFor(1, Units.TABLESPOON)).getOrThrow().value).toBeCloseTo(1)
        expect(tbspFrom(amountFor(1, Units.CUP)).getOrThrow().value).toBeCloseTo(16)
        expect(tbspFrom(amountFor(1, Units.LITER)).getOrThrow().value).toBeCloseTo(67.62804540368599)
        expect(tbspFrom(amountFor(1, Units.FLUID_OUNCE)).getOrThrow().value).toBeCloseTo(2)
        expect(tbspFrom(amountFor(1, Units.PINT)).getOrThrow().value).toBeCloseTo(32)
        expect(tbspFrom(amountFor(1, Units.QUART)).getOrThrow().value).toBeCloseTo(64)
        expect(tbspFrom(amountFor(1, Units.GALLON)).getOrThrow().value).toBeCloseTo(256)
    })

    it('should be able to convert weights and masses to grams (ugh, mixed concepts)', () => {
        const gramFrom = convertTo(Units.GRAM)
        expect(gramFrom(amountFor(1, Units.MILLIGRAM)).getOrThrow().unit).toEqual(Units.GRAM)

        expect(gramFrom(amountFor(1, Units.MILLIGRAM)).getOrThrow().value).toBeCloseTo(0.001)
        expect(gramFrom(amountFor(1, Units.GRAM)).getOrThrow().value).toBeCloseTo(1)
        expect(gramFrom(amountFor(1, Units.KILOGRAM)).getOrThrow().value).toBeCloseTo(1000)
        expect(gramFrom(amountFor(1, Units.OUNCE)).getOrThrow().value).toBeCloseTo(28.349523125)
        expect(gramFrom(amountFor(1, Units.POUND)).getOrThrow().value).toBeCloseTo(453.59237)
    })

    it('should be able to convert weights and masses to ounces (ugh, mixed concepts)', () => {
        const ounceFrom = convertTo(Units.OUNCE)
        expect(ounceFrom(amountFor(1, Units.MILLIGRAM)).getOrThrow().unit).toEqual(Units.OUNCE)

        expect(ounceFrom(amountFor(1, Units.MILLIGRAM)).getOrThrow().value).toBeCloseTo(0.000035273961949580415, 10)
        expect(ounceFrom(amountFor(1, Units.GRAM)).getOrThrow().value).toBeCloseTo(0.035273961949580414)
        expect(ounceFrom(amountFor(1, Units.KILOGRAM)).getOrThrow().value).toBeCloseTo(35.273961949580414)
        expect(ounceFrom(amountFor(1, Units.OUNCE)).getOrThrow().value).toBeCloseTo(1)
        expect(ounceFrom(amountFor(1, Units.POUND)).getOrThrow().value).toBeCloseTo(16)
    })

    it('should be able to convert volumes to liters', () => {
        const mlFrom = convertTo(Units.MILLILITER)
        expect(mlFrom(amountFor(1, Units.TABLESPOON)).getOrThrow().unit).toEqual(Units.MILLILITER)

        expect(mlFrom(amountFor(1, Units.MILLILITER)).getOrThrow().value).toBeCloseTo(1)
        expect(mlFrom(amountFor(1, Units.LITER)).getOrThrow().value).toBeCloseTo(1000)
        expect(mlFrom(amountFor(1, Units.TEASPOON)).getOrThrow().value).toBeCloseTo(4.92892159375)
        expect(mlFrom(amountFor(1, Units.TABLESPOON)).getOrThrow().value).toBeCloseTo(3 * 4.92892159375)
        expect(mlFrom(amountFor(1, Units.CUP)).getOrThrow().value).toBeCloseTo(16 * 3 * 4.92892159375)
        expect(mlFrom(amountFor(1, Units.PINT)).getOrThrow().value).toBeCloseTo(2 * 48 * 4.92892159375)
        expect(mlFrom(amountFor(1, Units.QUART)).getOrThrow().value).toBeCloseTo(2 * 96 * 4.92892159375)
        expect(mlFrom(amountFor(1, Units.GALLON)).getOrThrow().value).toBeCloseTo(4 * 192 * 4.92892159375)
    })
})

describe('when convert unlike units', () => {
    it('should return the initial amount', () => {
        const mlFrom = convertTo(Units.MILLILITER)

        expect(mlFrom(amountFor(1, Units.OUNCE)).failed).toBeTruthy()
    })
})