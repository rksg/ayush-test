/* eslint-disable max-len */
import { RadioCardCategory }                               from '@acx-ui/components'
import { Path }                                            from '@acx-ui/react-router-dom'
import { EdgeScopes, ScopeKeys, SwitchScopes, WifiScopes } from '@acx-ui/types'
import { hasScope }                                        from '@acx-ui/user'

const radioCardCategoryToCreateScopeKeyMap: Record<RadioCardCategory, ScopeKeys[number]> = {
  [RadioCardCategory.EDGE]: EdgeScopes.CREATE,
  [RadioCardCategory.SWITCH]: SwitchScopes.CREATE,
  [RadioCardCategory.WIFI]: WifiScopes.CREATE
}

const radioCardCategoryToReadScopeKeyMap: Record<RadioCardCategory, ScopeKeys[number]> = {
  [RadioCardCategory.EDGE]: EdgeScopes.READ,
  [RadioCardCategory.SWITCH]: SwitchScopes.READ,
  [RadioCardCategory.WIFI]: WifiScopes.READ
}

// eslint-disable-next-line max-len
export function radioCategoryToScopeKey (categoriesSet: RadioCardCategory[], oper: 'create' | 'read' = 'read'): ScopeKeys {
  // eslint-disable-next-line max-len
  const scopeKeyMap = oper === 'create' ? radioCardCategoryToCreateScopeKeyMap : radioCardCategoryToReadScopeKeyMap
  return [...new Set(categoriesSet)].map(category => {
    return scopeKeyMap[category]
  })
}

export interface ServicePolicyCardData<T> {
  type: T
  categories: RadioCardCategory[]
  totalCount?: number
  listViewPath?: Path
  disabled?: boolean
}
// eslint-disable-next-line max-len
export function isServicePolicyCardVisible<T> (cardItem: ServicePolicyCardData<T>, oper: 'create' | 'read' = 'read'): boolean {
  return !cardItem.disabled && hasScope(radioCategoryToScopeKey(cardItem.categories, oper))
}


export type ServicePolicyCardSet<T> = { title: string, items: ServicePolicyCardData<T>[] }
export function isServicePolicyCardSetVisible<T> (set: ServicePolicyCardSet<T>, oper: 'create' | 'read' = 'read'): boolean {
  return set.items.some(item => isServicePolicyCardVisible(item, oper))
}
