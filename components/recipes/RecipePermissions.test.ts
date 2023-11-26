import {describe, expect, it} from "@jest/globals";
import {
    AccessRight, accessRightArrayFrom,
    AccessRights, accessRightsWith,
    addAccessRightsTo,
    clearAccessRights,
    clearAccessRightsFor,
    fullAccessRights,
    groupPermissionFor,
    noAccessRights,
    PrincipalType, removeAccessRightsFrom,
    setAccessRights,
    setAccessRightsFor,
    userPermissionFor
} from "./RecipePermissions";

function expectNoPermissions(permissions: AccessRights) {
    expect(permissions.value).toBe(0)
    expect(permissions.create).toBeFalsy()
    expect(permissions.read).toBeFalsy()
    expect(permissions.update).toBeFalsy()
    expect(permissions.delete).toBeFalsy()
}

function expectFullPermissions(permissions: AccessRights) {
    expect(permissions.value).toBe(15)
    expect(permissions.create).toBeTruthy()
    expect(permissions.read).toBeTruthy()
    expect(permissions.update).toBeTruthy()
    expect(permissions.delete).toBeTruthy()
}


describe('when creating permissions', () => {
    it('should convert no permissions to crud=0000', () => {
        expectNoPermissions(noAccessRights())
    })
    it('should convert full permissions to crud=1111', () => {
        expectFullPermissions(fullAccessRights())
    })
})

describe('when creating permissions from attributes', () => {
    it('should be able to create a no-permission', () => {
        expectNoPermissions(setAccessRights(noAccessRights()))
    })
    it('should be able to create a full-permission from no permissions', () => {
        const permissions = setAccessRights(
            noAccessRights(),
            AccessRight.DELETE,
            AccessRight.UPDATE,
            AccessRight.READ,
            AccessRight.CREATE
        )
        expectFullPermissions(permissions)
    })
    it('should be able to create read-only permission', () => {
        const permissions = setAccessRights(noAccessRights(), AccessRight.READ)
        expect(permissions.value).toBe(4)
        expect(permissions.create).toBeFalsy()
        expect(permissions.read).toBeTruthy()
        expect(permissions.update).toBeFalsy()
        expect(permissions.delete).toBeFalsy()
    })
    it('should be able to create a permission that cannot delete', () => {
        const permissions = clearAccessRights(fullAccessRights(), AccessRight.DELETE)
        expect(permissions.value).toBe(14)
        expect(permissions.create).toBeTruthy()
        expect(permissions.read).toBeTruthy()
        expect(permissions.update).toBeTruthy()
        expect(permissions.delete).toBeFalsy()
    })
    it('should be able to create a permission that cannot create or delete', () => {
        const permissionRm = clearAccessRights(fullAccessRights(), AccessRight.CREATE, AccessRight.DELETE)
        const permissionAdd = setAccessRights(noAccessRights(), AccessRight.READ, AccessRight.UPDATE)
        expect(permissionRm.value).toEqual(permissionAdd.value)
        expect(permissionRm.value).toBe(6)
        expect(permissionRm.create).toBeFalsy()
        expect(permissionRm.read).toBeTruthy()
        expect(permissionRm.update).toBeTruthy()
        expect(permissionRm.delete).toBeFalsy()
    })
    it('should not remove a permission that is not set', () => {
        const permissions = setAccessRights(noAccessRights(), AccessRight.READ, AccessRight.UPDATE)
        const updated = clearAccessRights(permissions, AccessRight.CREATE)
        expect(updated.value).toBe(6)
        expect(updated.create).toBeFalsy()
        expect(updated.read).toBeTruthy()
        expect(updated.update).toBeTruthy()
        expect(updated.delete).toBeFalsy()
    })
    it('should not add a permission that is already set', () => {
        const permissions = setAccessRights(noAccessRights(), AccessRight.READ, AccessRight.UPDATE)
        const updated = setAccessRights(permissions, AccessRight.READ)
        expect(updated.value).toBe(6)
        expect(updated.create).toBeFalsy()
        expect(updated.read).toBeTruthy()
        expect(updated.update).toBeTruthy()
        expect(updated.delete).toBeFalsy()
    })
})

describe('when creating user and group permissions', () => {
    it('should be able to create permissions for a user', () => {
        const permissions = userPermissionFor("user1", "recipe1", fullAccessRights())
        expect(permissions.principalId).toBe("user1")
        expect(permissions.principal).toBe(PrincipalType.USER)
        expect(permissions.accessRights.value).toEqual(fullAccessRights().value)
    })
    it('should be able to create permissions for a group', () => {
        const permissions = groupPermissionFor("group1", "recipe1", fullAccessRights())
        expect(permissions.principalId).toBe("group1")
        expect(permissions.principal).toBe(PrincipalType.GROUP)
        expect(permissions.accessRights.value).toEqual(fullAccessRights().value)
    })
})

describe('when working with access rights', () => {
    describe('when modifying access rights on permissions', () => {
        it('should be able to set access rights', () => {
            const origPerms = userPermissionFor("user1", "recipe1", fullAccessRights())
            expect(origPerms.accessRights.value).toBe(15)
            const updatedPerms = setAccessRightsFor(origPerms, AccessRight.READ)
            expect(updatedPerms.accessRights.value).toBe(4)
            expect(updatedPerms.principal).toEqual(PrincipalType.USER)
            expect(updatedPerms.principalId).toEqual("user1")
        })
        it('should be able to clear access rights', () => {
            const origPerms = userPermissionFor("user1", "recipe1", fullAccessRights())
            expect(origPerms.accessRights.value).toBe(15)
            const updatedPerms = clearAccessRightsFor(origPerms)
            expect(updatedPerms.accessRights.value).toBe(0)
            expect(updatedPerms.principal).toEqual(PrincipalType.USER)
            expect(updatedPerms.principalId).toEqual("user1")
        })
        it('should be able to add access rights', () => {
            const origPerms = userPermissionFor("user1", "recipe1", noAccessRights())
            expect(origPerms.accessRights.value).toBe(0)
            const updatedPerms = addAccessRightsTo(origPerms, AccessRight.READ, AccessRight.UPDATE)
            expect(updatedPerms.accessRights.value).toBe(6)
            expect(updatedPerms.principal).toEqual(PrincipalType.USER)
            expect(updatedPerms.principalId).toEqual("user1")
        })
        it('should be able to remove access rights', () => {
            const origPerms = userPermissionFor("user1", "recipe1", fullAccessRights())
            expect(origPerms.accessRights.value).toBe(15)
            const updatedPerms = removeAccessRightsFrom(origPerms, AccessRight.READ, AccessRight.UPDATE)
            expect(updatedPerms.accessRights.value).toBe(9)
            expect(updatedPerms.principal).toEqual(PrincipalType.USER)
            expect(updatedPerms.principalId).toEqual("user1")
        })
    })

    describe('when converting between access right values, booleans, and AccessRight array', () => {
        it('should be able to create an AccessRight array from booleans', () => {
            expect(accessRightArrayFrom(true, true, true, true))
                .toEqual([AccessRight.CREATE, AccessRight.READ, AccessRight.UPDATE, AccessRight.DELETE])
            expect(accessRightArrayFrom(true, true, true, false))
                .toEqual([AccessRight.CREATE, AccessRight.READ, AccessRight.UPDATE])
            expect(accessRightArrayFrom(true, true, false, true))
                .toEqual([AccessRight.CREATE, AccessRight.READ, AccessRight.DELETE])
            expect(accessRightArrayFrom(true, false, true, true))
                .toEqual([AccessRight.CREATE, AccessRight.UPDATE, AccessRight.DELETE])
            expect(accessRightArrayFrom(false, true, true, true))
                .toEqual([AccessRight.READ, AccessRight.UPDATE, AccessRight.DELETE])
            expect(accessRightArrayFrom(true, true, false, false))
                .toEqual([AccessRight.CREATE, AccessRight.READ])
            expect(accessRightArrayFrom(true, false, false, true))
                .toEqual([AccessRight.CREATE, AccessRight.DELETE])
            expect(accessRightArrayFrom(false, false, true, true))
                .toEqual([AccessRight.UPDATE, AccessRight.DELETE])
            expect(accessRightArrayFrom(true, false, true, false))
                .toEqual([AccessRight.CREATE, AccessRight.UPDATE])
            expect(accessRightArrayFrom(false, true, true, false))
                .toEqual([AccessRight.READ, AccessRight.UPDATE])
            expect(accessRightArrayFrom(false, true, false, true))
                .toEqual([AccessRight.READ, AccessRight.DELETE])
            expect(accessRightArrayFrom(true, false, false, false))
                .toEqual([AccessRight.CREATE])
            expect(accessRightArrayFrom(false, true, false, false))
                .toEqual([AccessRight.READ])
            expect(accessRightArrayFrom(false, false, true, false))
                .toEqual([AccessRight.UPDATE])
            expect(accessRightArrayFrom(false, false, false, true))
                .toEqual([AccessRight.DELETE])
            expect(accessRightArrayFrom(false, false, false, false))
                .toEqual([])
        })

        it('should be able to create an AccessRights from booleans', () => {
            expect(accessRightsWith(true, true, true, true))
                .toEqual({
                    value: 15,
                    create: true,
                    read: true,
                    update: true,
                    delete: true
                })
            expect(accessRightsWith(true, true, true, false))
                .toEqual({
                    value: 14,
                    create: true,
                    read: true,
                    update: true,
                    delete: false
                })
            expect(accessRightsWith(true, true, false, true))
                .toEqual({
                    value: 13,
                    create: true,
                    read: true,
                    update: false,
                    delete: true
                })
            expect(accessRightsWith(true, false, true, true))
                .toEqual({
                    value: 11,
                    create: true,
                    read: false,
                    update: true,
                    delete: true
                })
            expect(accessRightsWith(false, true, true, true))
                .toEqual({
                    value: 7,
                    create: false,
                    read: true,
                    update: true,
                    delete: true
                })
            expect(accessRightsWith(true, true, false, false))
                .toEqual({
                    value: 12,
                    create: true,
                    read: true,
                    update: false,
                    delete: false
                })
            expect(accessRightsWith(true, false, false, true))
                .toEqual({
                    value: 9,
                    create: true,
                    read: false,
                    update: false,
                    delete: true
                })
            expect(accessRightsWith(false, false, true, true))
                .toEqual({
                    value: 3,
                    create: false,
                    read: false,
                    update: true,
                    delete: true
                })
            expect(accessRightsWith(true, false, true, false))
                .toEqual({
                    value: 10,
                    create: true,
                    read: false,
                    update: true,
                    delete: false
                })
            expect(accessRightsWith(false, true, true, false))
                .toEqual({
                    value: 6,
                    create: false,
                    read: true,
                    update: true,
                    delete: false
                })
            expect(accessRightsWith(false, true, false, true))
                .toEqual({
                    value: 5,
                    create: false,
                    read: true,
                    update: false,
                    delete: true
                })
            expect(accessRightsWith(true, false, false, false))
                .toEqual({
                    value: 8,
                    create: true,
                    read: false,
                    update: false,
                    delete: false
                })
            expect(accessRightsWith(false, true, false, false))
                .toEqual({
                    value: 4,
                    create: false,
                    read: true,
                    update: false,
                    delete: false
                })
            expect(accessRightsWith(false, false, true, false))
                .toEqual({
                    value: 2,
                    create: false,
                    read: false,
                    update: true,
                    delete: false
                })
            expect(accessRightsWith(false, false, false, true))
                .toEqual({
                    value: 1,
                    create: false,
                    read: false,
                    update: false,
                    delete: true
                })
            expect(accessRightsWith(false, false, false, false))
                .toEqual({
                    value: 0,
                    create: false,
                    read: false,
                    update: false,
                    delete: false
                })
        })
    })
})
