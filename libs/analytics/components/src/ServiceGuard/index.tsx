import { createContext, useEffect, useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { Button }     from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'
import { WifiScopes } from '@acx-ui/types'
import {
  getUserProfile,
  hasAllowedOperations,
  aiOpsApis,
  hasCrossVenuesPermission,
  hasPermission
} from '@acx-ui/user'

import { ServiceGuardTable }            from './ServiceGuardTable'
import { useAllServiceGuardSpecsQuery } from './services'

interface CountContextType {
  count: number,
  setCount: (count: number) => void
}
export const CountContext = createContext({} as CountContextType)

export function useServiceGuard () {
  const { $t } = useIntl()
  const queryResults = useAllServiceGuardSpecsQuery()
  const [count, setCount] = useState(queryResults.data?.length || 0)
  useEffect(() => setCount(queryResults.data?.length || 0),[queryResults])

  const title = defineMessage({
    defaultMessage: 'Service Validation {count, select, null {} other {({count})}}',
    description: 'Translation string - Service Validation'
  })

  const { rbacOpsApiEnabled } = getUserProfile()
  const hasCreateServiceGuardPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([aiOpsApis.createServiceValidation])
    : hasCrossVenuesPermission() && hasPermission({
      permission: 'WRITE_SERVICE_VALIDATION',
      scopes: [WifiScopes.CREATE]
    })

  const headerExtra = [
    <TenantLink to='/analytics/serviceValidation/add' key='add'>
      <Button type='primary'
        children={$t({ defaultMessage: 'Create Test' })}
      />
    </TenantLink>
  ]

  const component = <CountContext.Provider value={{ count, setCount }}>
    <ServiceGuardTable />
  </CountContext.Provider>

  return {
    title: $t(title, { count }),
    headerExtra: hasCreateServiceGuardPermission ? headerExtra : [],
    component
  }
}
