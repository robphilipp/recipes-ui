import {amountFor, convertTo, UnitType} from './Measurements'
import {describe, it, expect} from "@jest/globals";

describe('when converting like units', () => {
    it('should be able to convert to teaspoons', () => {
        const tspFrom = convertTo(UnitType.TEASPOON)
        expect(tspFrom(amountFor(1, UnitType.TABLESPOON)).getOrThrow().unit).toEqual(UnitType.TEASPOON)
        
        expect(tspFrom(amountFor(1, UnitType.TEASPOON)).getOrThrow().value).toBeCloseTo(1)
        expect(tspFrom(amountFor(1, UnitType.TABLESPOON)).getOrThrow().value).toBeCloseTo(3)
        expect(tspFrom(amountFor(1, UnitType.CUP)).getOrThrow().value).toBeCloseTo(48)
        expect(tspFrom(amountFor(1, UnitType.LITER)).getOrThrow().value).toBeCloseTo(3 * 67.62804540368599)
        expect(tspFrom(amountFor(1, UnitType.FLUID_OUNCE)).getOrThrow().value).toBeCloseTo(6)
        expect(tspFrom(amountFor(1, UnitType.PINT)).getOrThrow().value).toBeCloseTo(96)
        expect(tspFrom(amountFor(1, UnitType.QUART)).getOrThrow().value).toBeCloseTo(192)
        expect(tspFrom(amountFor(1, UnitType.GALLON)).getOrThrow().value).toBeCloseTo(768)
    })

    it('should be able to convert to tablespoons', () => {
        const tbspFrom = convertTo(UnitType.TABLESPOON)
        expect(tbspFrom(amountFor(1, UnitType.CUP)).getOrThrow().unit).toEqual(UnitType.TABLESPOON)
        
        expect(tbspFrom(amountFor(1, UnitType.TEASPOON)).getOrThrow().value).toBeCloseTo(1/3)
        expect(tbspFrom(amountFor(1, UnitType.TABLESPOON)).getOrThrow().value).toBeCloseTo(1)
        expect(tbspFrom(amountFor(1, UnitType.CUP)).getOrThrow().value).toBeCloseTo(16)
        expect(tbspFrom(amountFor(1, UnitType.LITER)).getOrThrow().value).toBeCloseTo(67.62804540368599)
        expect(tbspFrom(amountFor(1, UnitType.FLUID_OUNCE)).getOrThrow().value).toBeCloseTo(2)
        expect(tbspFrom(amountFor(1, UnitType.PINT)).getOrThrow().value).toBeCloseTo(32)
        expect(tbspFrom(amountFor(1, UnitType.QUART)).getOrThrow().value).toBeCloseTo(64)
        expect(tbspFrom(amountFor(1, UnitType.GALLON)).getOrThrow().value).toBeCloseTo(256)
    })

    it('should be able to convert weights and masses to grams (ugh, mixed concepts)', () => {
        const gramFrom = convertTo(UnitType.GRAM)
        expect(gramFrom(amountFor(1, UnitType.MILLIGRAM)).getOrThrow().unit).toEqual(UnitType.GRAM)

        expect(gramFrom(amountFor(1, UnitType.MILLIGRAM)).getOrThrow().value).toBeCloseTo(0.001)
        expect(gramFrom(amountFor(1, UnitType.GRAM)).getOrThrow().value).toBeCloseTo(1)
        expect(gramFrom(amountFor(1, UnitType.KILOGRAM)).getOrThrow().value).toBeCloseTo(1000)
        expect(gramFrom(amountFor(1, UnitType.OUNCE)).getOrThrow().value).toBeCloseTo(28.349523125)
        expect(gramFrom(amountFor(1, UnitType.POUND)).getOrThrow().value).toBeCloseTo(453.59237)
    })

    it('should be able to convert weights and masses to ounces (ugh, mixed concepts)', () => {
        const ounceFrom = convertTo(UnitType.OUNCE)
        expect(ounceFrom(amountFor(1, UnitType.MILLIGRAM)).getOrThrow().unit).toEqual(UnitType.OUNCE)

        expect(ounceFrom(amountFor(1, UnitType.MILLIGRAM)).getOrThrow().value).toBeCloseTo(0.000035273961949580415, 10)
        expect(ounceFrom(amountFor(1, UnitType.GRAM)).getOrThrow().value).toBeCloseTo(0.035273961949580414)
        expect(ounceFrom(amountFor(1, UnitType.KILOGRAM)).getOrThrow().value).toBeCloseTo(35.273961949580414)
        expect(ounceFrom(amountFor(1, UnitType.OUNCE)).getOrThrow().value).toBeCloseTo(1)
        expect(ounceFrom(amountFor(1, UnitType.POUND)).getOrThrow().value).toBeCloseTo(16)
    })

    it('should be able to convert volumes to liters', () => {
        const mlFrom = convertTo(UnitType.MILLILITER)
        expect(mlFrom(amountFor(1, UnitType.TABLESPOON)).getOrThrow().unit).toEqual(UnitType.MILLILITER)

        expect(mlFrom(amountFor(1, UnitType.MILLILITER)).getOrThrow().value).toBeCloseTo(1)
        expect(mlFrom(amountFor(1, UnitType.LITER)).getOrThrow().value).toBeCloseTo(1000)
        expect(mlFrom(amountFor(1, UnitType.TEASPOON)).getOrThrow().value).toBeCloseTo(4.92892159375)
        expect(mlFrom(amountFor(1, UnitType.TABLESPOON)).getOrThrow().value).toBeCloseTo(3 * 4.92892159375)
        expect(mlFrom(amountFor(1, UnitType.CUP)).getOrThrow().value).toBeCloseTo(16 * 3 * 4.92892159375)
        expect(mlFrom(amountFor(1, UnitType.PINT)).getOrThrow().value).toBeCloseTo(2 * 48 * 4.92892159375)
        expect(mlFrom(amountFor(1, UnitType.QUART)).getOrThrow().value).toBeCloseTo(2 * 96 * 4.92892159375)
        expect(mlFrom(amountFor(1, UnitType.GALLON)).getOrThrow().value).toBeCloseTo(4 * 192 * 4.92892159375)
    })
})

describe('when convert unlike units', () => {
    it('should return the initial amount', () => {
        const mlFrom = convertTo(UnitType.MILLILITER)

        expect(mlFrom(amountFor(1, UnitType.OUNCE)).failed).toBeTruthy()
    })
})