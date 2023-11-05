import {describe, expect, it} from "@jest/globals";
import {
    clearPermissions,
    fullPermissions,
    noPermissions,
    PermissionAttribute,
    permissionFromNumber,
    permissionToNumber,
    setPermissions
} from "./RecipePermissions";

describe('when creating permissions', () => {
    it('should convert no permissions to crud=0000', () => {
        expect(noPermissions()).toEqual({create: false, read: false, update: false, delete: false})
    })
    it('should convert full permissions to crud=1111', () => {
        expect(fullPermissions()).toEqual({create: true, read: true, update: true, delete: true})
    })
})

describe('when creating permissions from attributes', () => {
    it('should be able to create a no-permission', () => {
        expect(setPermissions(noPermissions())).toEqual(noPermissions())
    })
    it('should be able to create a full-permission', () => {
        expect(
            setPermissions(
                noPermissions(),
                PermissionAttribute.DELETE,
                PermissionAttribute.UPDATE,
                PermissionAttribute.READ,
                PermissionAttribute.CREATE
            )
        ).toEqual(fullPermissions())
    })
    it('should be able to create read-only permission', () => {
        expect(setPermissions(noPermissions(), PermissionAttribute.READ))
            .toEqual({create: false, read: true, update: false, delete: false})
    })
    it('should be able to create a permission that cannot delete', () => {
        expect(clearPermissions(fullPermissions(), PermissionAttribute.DELETE))
            .toEqual({create: true, read: true, update: true, delete: false})
    })
    it('should be able to create a permission that cannot create or delete', () => {
        expect(clearPermissions(fullPermissions(), PermissionAttribute.CREATE, PermissionAttribute.DELETE))
            .toEqual({create: false, read: true, update: true, delete: false})
        expect(setPermissions(noPermissions(), PermissionAttribute.READ, PermissionAttribute.UPDATE))
            .toEqual({create: false, read: true, update: true, delete: false})
    })
})

describe('when converting permissions to and from numbers', () => {
    it('should convert crud=1111 to 15', () => {
        expect(permissionToNumber({create: true, read: true, update: true, delete: true})).toEqual(15)
    })
    it('should convert crud=1110 to 14', () => {
        expect(permissionToNumber({create: true, read: true, update: true, delete: false})).toEqual(14)
    })
    it('should convert crud=1101 to 13', () => {
        expect(permissionToNumber({create: true, read: true, update: false, delete: true})).toEqual(13)
    })
    it('should convert crud=1100 to 12', () => {
        expect(permissionToNumber({create: true, read: true, update: false, delete: false})).toEqual(12)
    })
    it('should convert crud=1011 to 11', () => {
        expect(permissionToNumber({create: true, read: false, update: true, delete: true})).toEqual(11)
    })
    it('should convert crud=1010 to 10', () => {
        expect(permissionToNumber({create: true, read: false, update: true, delete: false})).toEqual(10)
    })
    it('should convert crud=1001 to 9', () => {
        expect(permissionToNumber({create: true, read: false, update: false, delete: true})).toEqual(9)
    })
    it('should convert crud=1000 to 8', () => {
        expect(permissionToNumber({create: true, read: false, update: false, delete: false})).toEqual(8)
    })
    it('should convert crud=0111 to 7', () => {
        expect(permissionToNumber({create: false, read: true, update: true, delete: true})).toEqual(7)
    })
    it('should convert crud=0110 to 6', () => {
        expect(permissionToNumber({create: false, read: true, update: true, delete: false})).toEqual(6)
    })
    it('should convert crud=0101 to 5', () => {
        expect(permissionToNumber({create: false, read: true, update: false, delete: true})).toEqual(5)
    })
    it('should convert crud=0100 to 4', () => {
        expect(permissionToNumber({create: false, read: true, update: false, delete: false})).toEqual(4)
    })
    it('should convert crud=0011 to 3', () => {
        expect(permissionToNumber({create: false, read: false, update: true, delete: true})).toEqual(3)
    })
    it('should convert crud=0010 to 2', () => {
        expect(permissionToNumber({create: false, read: false, update: true, delete: false})).toEqual(2)
    })
    it('should convert crud=0001 to 1', () => {
        expect(permissionToNumber({create: false, read: false, update: false, delete: true})).toEqual(1)
    })
    it('should convert crud=0000 to 0', () => {
        expect(permissionToNumber({create: false, read: false, update: false, delete: false})).toEqual(0)
    })
})

describe('when converting numbers to permissions', () => {
    it('should convert 15 to crud=1111', () => {
        expect(permissionFromNumber(15).getOrDefault(noPermissions())).toEqual({create: true, read: true, update: true, delete: true})
    })
    it('should convert 14 to crud=1110', () => {
        expect(permissionFromNumber(14).getOrDefault(noPermissions())).toEqual({create: true, read: true, update: true, delete: false})
    })
    it('should convert 13 to crud=1101', () => {
        expect(permissionFromNumber(13).getOrDefault(noPermissions())).toEqual({create: true, read: true, update: false, delete: true})
    })
    it('should convert 12 to crud=1100', () => {
        expect(permissionFromNumber(12).getOrDefault(noPermissions())).toEqual({create: true, read: true, update: false, delete: false})
    })
    it('should convert 11 to crud=1011', () => {
        expect(permissionFromNumber(11).getOrDefault(noPermissions())).toEqual({create: true, read: false, update: true, delete: true})
    })
    it('should convert 10 to crud=1010', () => {
        expect(permissionFromNumber(10).getOrDefault(noPermissions())).toEqual({create: true, read: false, update: true, delete: false})
    })
    it('should convert 9 to crud=1001', () => {
        expect(permissionFromNumber(9).getOrDefault(noPermissions())).toEqual({create: true, read: false, update: false, delete: true})
    })
    it('should convert 8 to crud=1000', () => {
        expect(permissionFromNumber(8).getOrDefault(noPermissions())).toEqual({create: true, read: false, update: false, delete: false})
    })
    it('should convert 7 to crud=0111', () => {
        expect(permissionFromNumber(7).getOrDefault(noPermissions())).toEqual({create: false, read: true, update: true, delete: true})
    })
    it('should convert 6 to crud=0110', () => {
        expect(permissionFromNumber(6).getOrDefault(noPermissions())).toEqual({create: false, read: true, update: true, delete: false})
    })
    it('should convert 5 to crud=0101', () => {
        expect(permissionFromNumber(5).getOrDefault(noPermissions())).toEqual({create: false, read: true, update: false, delete: true})
    })
    it('should convert 4 to crud=0100', () => {
        expect(permissionFromNumber(4).getOrDefault(noPermissions())).toEqual({create: false, read: true, update: false, delete: false})
    })
    it('should convert 3 to crud=0011', () => {
        expect(permissionFromNumber(3).getOrDefault(noPermissions())).toEqual({create: false, read: false, update: true, delete: true})
    })
    it('should convert 2 to crud=0010', () => {
        expect(permissionFromNumber(2).getOrDefault(noPermissions())).toEqual({create: false, read: false, update: true, delete: false})
    })
    it('should convert 1 to crud=0001', () => {
        expect(permissionFromNumber(1).getOrDefault(noPermissions())).toEqual({create: false, read: false, update: false, delete: true})
    })
    it('should convert 0 to crud=0000', () => {
        expect(permissionFromNumber(0).getOrDefault(fullPermissions())).toEqual({create: false, read: false, update: false, delete: false})
    })
})