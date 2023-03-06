import { UserProfile } from './types'

export function rolesOk (
  profile: UserProfile,
  roles: string | string[]
) {
  if (!profile) return false

  if (!Array.isArray(roles)) roles = [roles]

  return profile.roles.some(role => roles.includes(role))
}

// TODO:
// To expand the map when we start define IDs for operations
let operationMap: Record<string, string> = {}

export function accessOk (
  alloweOperations: string[],
  operation: string
) {
  const action = operationMap[operation]

  // allowed undefined operation
  // this is so helpers could skip `key` used in places like PageHeader’s extra prop
  if (!action) return true

  return alloweOperations.includes(action)
}
