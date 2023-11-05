import {describe, expect, it} from "@jest/globals";
import {
    AccessRight,
    AccessRights,
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
    expect(permissions.hasCreate()).toBeFalsy()
    expect(permissions.hasRead()).toBeFalsy()
    expect(permissions.hasUpdate()).toBeFalsy()
    expect(permissions.hasDelete()).toBeFalsy()
}

function expectFullPermissions(permissions: AccessRights) {
    expect(permissions.value).toBe(15)
    expect(permissions.hasCreate()).toBeTruthy()
    expect(permissions.hasRead()).toBeTruthy()
    expect(permissions.hasUpdate()).toBeTruthy()
    expect(permissions.hasDelete()).toBeTruthy()
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
        expect(permissions.hasCreate()).toBeFalsy()
        expect(permissions.hasRead()).toBeTruthy()
        expect(permissions.hasUpdate()).toBeFalsy()
        expect(permissions.hasDelete()).toBeFalsy()
    })
    it('should be able to create a permission that cannot delete', () => {
        const permissions = clearAccessRights(fullAccessRights(), AccessRight.DELETE)
        expect(permissions.value).toBe(14)
        expect(permissions.hasCreate()).toBeTruthy()
        expect(permissions.hasRead()).toBeTruthy()
        expect(permissions.hasUpdate()).toBeTruthy()
        expect(permissions.hasDelete()).toBeFalsy()
    })
    it('should be able to create a permission that cannot create or delete', () => {
        const permissionRm = clearAccessRights(fullAccessRights(), AccessRight.CREATE, AccessRight.DELETE)
        const permissionAdd = setAccessRights(noAccessRights(), AccessRight.READ, AccessRight.UPDATE)
        expect(permissionRm.value).toEqual(permissionAdd.value)
        expect(permissionRm.value).toBe(6)
        expect(permissionRm.hasCreate()).toBeFalsy()
        expect(permissionRm.hasRead()).toBeTruthy()
        expect(permissionRm.hasUpdate()).toBeTruthy()
        expect(permissionRm.hasDelete()).toBeFalsy()
    })
    it('should not remove a permission that is not set', () => {
        const permissions = setAccessRights(noAccessRights(), AccessRight.READ, AccessRight.UPDATE)
        const updated = clearAccessRights(permissions, AccessRight.CREATE)
        expect(permissions.value).toBe(6)
        expect(permissions.hasCreate()).toBeFalsy()
        expect(permissions.hasRead()).toBeTruthy()
        expect(permissions.hasUpdate()).toBeTruthy()
        expect(permissions.hasDelete()).toBeFalsy()
    })
    it('should not add a permission that is already set', () => {
        const permissions = setAccessRights(noAccessRights(), AccessRight.READ, AccessRight.UPDATE)
        const updated = clearAccessRights(permissions, AccessRight.READ)
        expect(permissions.value).toBe(6)
        expect(permissions.hasCreate()).toBeFalsy()
        expect(permissions.hasRead()).toBeTruthy()
        expect(permissions.hasUpdate()).toBeTruthy()
        expect(permissions.hasDelete()).toBeFalsy()
    })
})

describe('when creating user and group permissions', () => {
    it('should be able to create permissions for a user', () => {
        const permissions = userPermissionFor("user1", fullAccessRights())
        expect(permissions.principalId).toBe("user1")
        expect(permissions.principal).toBe(PrincipalType.USER)
        expect(permissions.accessRights.value).toEqual(fullAccessRights().value)
    })
    it('should be able to create permissions for a group', () => {
        const permissions = groupPermissionFor("group1", fullAccessRights())
        expect(permissions.principalId).toBe("group1")
        expect(permissions.principal).toBe(PrincipalType.GROUP)
        expect(permissions.accessRights.value).toEqual(fullAccessRights().value)
    })
})

describe('when modifying access rights on permissions', () => {
    it('should be able to set access rights', () => {
        const origPerms = userPermissionFor("user1", fullAccessRights())
        expect(origPerms.accessRights.value).toBe(15)
        const updatedPerms = setAccessRightsFor(origPerms, AccessRight.READ)
        expect(updatedPerms.accessRights.value).toBe(4)
        expect(updatedPerms.principal).toEqual(PrincipalType.USER)
        expect(updatedPerms.principalId).toEqual("user1")
    })
    it('should be able to clear access rights', () => {
        const origPerms = userPermissionFor("user1", fullAccessRights())
        expect(origPerms.accessRights.value).toBe(15)
        const updatedPerms = clearAccessRightsFor(origPerms)
        expect(updatedPerms.accessRights.value).toBe(0)
        expect(updatedPerms.principal).toEqual(PrincipalType.USER)
        expect(updatedPerms.principalId).toEqual("user1")
    })
    it('should be able to add access rights', () => {
        const origPerms = userPermissionFor("user1", noAccessRights())
        expect(origPerms.accessRights.value).toBe(0)
        const updatedPerms = addAccessRightsTo(origPerms, AccessRight.READ, AccessRight.UPDATE)
        expect(updatedPerms.accessRights.value).toBe(6)
        expect(updatedPerms.principal).toEqual(PrincipalType.USER)
        expect(updatedPerms.principalId).toEqual("user1")
    })
    it('should be able to remove access rights', () => {
        const origPerms = userPermissionFor("user1", fullAccessRights())
        expect(origPerms.accessRights.value).toBe(15)
        const updatedPerms = removeAccessRightsFrom(origPerms, AccessRight.READ, AccessRight.UPDATE)
        expect(updatedPerms.accessRights.value).toBe(9)
        expect(updatedPerms.principal).toEqual(PrincipalType.USER)
        expect(updatedPerms.principalId).toEqual("user1")
    })
})
