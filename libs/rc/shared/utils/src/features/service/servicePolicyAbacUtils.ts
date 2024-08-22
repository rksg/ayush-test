// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
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

export type ServicePolicyScopeKeyOper = 'create' | 'read'

// eslint-disable-next-line max-len
function radioCategoryToScopeKey (categoriesSet: RadioCardCategory[], oper: ServicePolicyScopeKeyOper): ScopeKeys {
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
  scopeKeysMap?: Record<ServicePolicyScopeKeyOper, ScopeKeys>
  helpIcon?: React.ReactNode
}
// eslint-disable-next-line max-len
export function isServicePolicyCardEnabled<T> (cardItem: ServicePolicyCardData<T>, oper: ServicePolicyScopeKeyOper): boolean {
  // eslint-disable-next-line max-len
  return !cardItem.disabled && (hasScope(cardItem.scopeKeysMap?.[oper] || radioCategoryToScopeKey(cardItem.categories, oper)))
}

export type ServicePolicyCardSet<T> = { title: string, items: ServicePolicyCardData<T>[] }
// eslint-disable-next-line max-len
export function isServicePolicyCardSetEnabled<T> (set: ServicePolicyCardSet<T>, oper: ServicePolicyScopeKeyOper): boolean {
  return set.items.some(item => isServicePolicyCardEnabled<T>(item, oper))
}

export function servicePolicyCardDataToScopeKeys (
  // eslint-disable-next-line max-len
  cardData: { scopeKeysMap?: Record<ServicePolicyScopeKeyOper, ScopeKeys>, categories: RadioCardCategory[] }[],
  oper: ServicePolicyScopeKeyOper
): ScopeKeys {
  return [...new Set(cardData.map(item => {
    return item.scopeKeysMap?.[oper] || radioCategoryToScopeKey(item.categories, oper)
  }).flat())]
}
