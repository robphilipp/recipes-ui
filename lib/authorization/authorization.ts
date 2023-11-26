import {Session} from "next-auth";
import {AccessRights} from "../../components/recipes/RecipePermissions";

export type AuthorizationRule<R> = (session: Session, resource: R, accessRights?: AccessRights) => boolean

export enum Conjunction {AND, OR}

export function hasAccessTo<R>(session: Session, rules: Array<AuthorizationRule<R>>): (resource: R, accessRights?: AccessRights) => boolean {
    return (resource: R, accessRights: AccessRights) => rules.reduce(
        (result, rule) => result && rule(session, resource, accessRights),
        true
    )
}
