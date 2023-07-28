import { createContext, useEffect, useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { Button }     from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import { ServiceGuardTable }            from './ServiceGuardTable'
import { useAllServiceGuardSpecsQuery } from './services'

interface CountContextType {
  count: number,
  setCount: (count: number) => void
}
export const CountContext = createContext({} as CountContextType)

export const ServiceGuard = () => {
  const { component } = useServiceGuard()
  return component
}

export function useServiceGuard () {
  const { $t } = useIntl()
  const queryResults = useAllServiceGuardSpecsQuery()
  const [count, setCount] = useState(queryResults.data?.length || 0)
  useEffect(()=> setCount(queryResults.data?.length || 0),[queryResults])

  const title = defineMessage({
    defaultMessage: 'Service Validation {count, select, null {} other {({count})}}',
    description: 'Translation string - Service Validation'
  })

  const extra = [
    <TenantLink to='/analytics/serviceValidation/add' key='add'>
      <Button type='primary'>{ $t({ defaultMessage: 'Create Test' }) }</Button>
    </TenantLink>
  ]

  const component = <CountContext.Provider value={{ count, setCount }}>
    <ServiceGuardTable />
  </CountContext.Provider>

  return {
    title: $t(title, { count }),
    headerExtra: extra,
    component
  }
}
