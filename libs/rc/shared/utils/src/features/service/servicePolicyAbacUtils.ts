import { RadioCardCategory }                               from '@acx-ui/components'
import { EdgeScopes, ScopeKeys, SwitchScopes, WifiScopes } from '@acx-ui/types'

export const radioCardCategoryScopeKeyMap: Record<RadioCardCategory, ScopeKeys[number]> = {
  [RadioCardCategory.EDGE]: EdgeScopes.CREATE,
  [RadioCardCategory.SWITCH]: SwitchScopes.CREATE,
  [RadioCardCategory.WIFI]: WifiScopes.CREATE
}

export function radioCategoryToScopeKey (categoriesSet: RadioCardCategory[]): ScopeKeys {
  return [...new Set(categoriesSet)].map(category => {
    return radioCardCategoryScopeKeyMap[category]
  })
}
