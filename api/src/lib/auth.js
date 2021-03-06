import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'
import { preference } from 'src/services/preferences/preferences'
import { db } from './db'

// The session object sent in as the first argument to getCurrentUser() will
// have a single key `id` containing the unique ID of the logged in user
// (whatever field you set as `authFields.id` in your auth function config).
// You'll need to update the call to `db` below if you use a different model
// name or unique field name:
//
//   return await db.profile.findUnique({ where: { email: session.id } })
//                   ───┬───                       ──┬──
//      model accessor ─┘      unique id field name ─┘

export const getCurrentUser = async (session) => {
  try {
    // look up the user by the session id
    let foundUser = await db.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true },
    })
    // look up the group memberships of the user
    let foundGroups = await db.groupMember.findMany({
      where: { userId: session.id },
    })
    // look up the roles of the groups the user is a member of
    let foundGroupRoles = await db.groupRole.findMany({
      where: {
        groupId: { in: foundGroups.map((group) => group.groupId) },
      },
    })
    // assign the roles to the user
    let roles = foundGroupRoles.map((groupRole) => groupRole.role)
    // get user's preferences and store them as part of the user
    let foundPreferences = await db.preference.findMany({
      where: { userId: session.id },
    })
    let preferences = {}
    foundPreferences.forEach((preference) => {
      preferences[preference.entity] = preference.value
    })
    if (!preferences.language) {
      preferences.language = 'en'
    }
    let foundMessages = await db.message.findMany({
      where: { language: preferences.language },
    })
    let messages = {}
    foundMessages.forEach((message) => {
      messages[message.entity] = message.value
    })
    let returnUser = {
      roles,
      ...foundUser,
      preferences,
      messages,
    }
    return returnUser
  } catch (error) {
    return error
  }
}
/**
 * The user is authenticated if there is a currentUser in the context
 *
 * @returns {boolean} - If the currentUser is authenticated
 */
export const isAuthenticated = () => {
  return !!context.currentUser
}

/**
 * When checking role membership, roles can be a single value, a list, or none.
 * You can use Prisma enums too (if you're using them for roles), just import your enum type from `@prisma/client`
 */

/**
 * Checks if the currentUser is authenticated (and assigned one of the given roles)
 *
 * @param roles: AllowedRoles - Checks if the currentUser is assigned one of these roles
 *
 * @returns {boolean} - Returns true if the currentUser is logged in and assigned one of the given roles,
 * or when no roles are provided to check against. Otherwise returns false.
 */
export const hasRole = ({ roles }) => {
  if (!isAuthenticated()) {
    return false
  }

  if (roles) {
    if (Array.isArray(roles)) {
      return context.currentUser.roles?.some((r) => roles.includes(r))
    }

    if (typeof roles === 'string') {
      return context.currentUser.roles?.includes(roles)
    }

    // roles not found
    return false
  }

  return true
}

/**
 * Use requireAuth in your services to check that a user is logged in,
 * whether or not they are assigned a role, and optionally raise an
 * error if they're not.
 *
 * @param roles: AllowedRoles - When checking role membership, these roles grant access.
 *
 * @returns - If the currentUser is authenticated (and assigned one of the given roles)
 *
 * @throws {AuthenticationError} - If the currentUser is not authenticated
 * @throws {ForbiddenError} If the currentUser is not allowed due to role permissions
 *
 * @see https://github.com/redwoodjs/redwood/tree/main/packages/auth for examples
 */
export const requireAuth = ({ roles }) => {
  if (!isAuthenticated()) {
    throw new AuthenticationError("You don't have permission to do that.")
  }

  if (!hasRole({ roles })) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}
