import {Session} from "next-auth";
import {RecipeSummary} from "../../components/recipes/Recipe";
import {RoleType} from "../../components/users/Role";

export const isRecipeOwner = (session: Session, summary: RecipeSummary): boolean => summary.ownerId === session.user.id
export const isRecipeBookAdmin = (session: Session): boolean => session.user.role.name === RoleType.ADMIN
export const hasAccess = (session: Session, summary: RecipeSummary): boolean => isRecipeOwner(session, summary) || isRecipeBookAdmin(session)