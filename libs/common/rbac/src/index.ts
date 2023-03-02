// export * from './role-mapping'
// export * from './rbac-services'
// export * from './useHasPermissions'
// export * from './useHasRoles'
// export * from './rbac'
// export * from './RbacAuthContext'
// export * from './UserProfileContext'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hasAccess (id?: string) { return true }

export function hasAccesses <Item> (items?: Item[]) {
  return items?.filter(item => hasAccess((item as { key?: string }).key))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hasRoles (roles?: string | string[]) { return true }
