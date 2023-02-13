import { createContext, useContext } from 'react'

import {
  useGuestAllowedOperationsQuery,
  useSwitchAllowedOperationsQuery,
  useTenantAllowedOperationsQuery, useUpgradeAllowedOperationsQuery, useVenueAllowedOperationsQuery,
  useWifiAllowedOperationsQuery
} from '@acx-ui/rc/services'
import { getJwtTokenPayload } from '@acx-ui/utils'

export const RbacAuthContext = createContext<Array<string>>([])

export function useRbacAuthContext () {
  return useContext(RbacAuthContext)
}

export function RbacAuthProvider (props: React.PropsWithChildren) {
  const { tenantId } = getJwtTokenPayload()
  let data = useGetTenantAllowedOperations( tenantId )
  return <RbacAuthContext.Provider value={data}>
    {props.children}
  </RbacAuthContext.Provider>
}

export function useGetTenantAllowedOperations ( tenantId: string): string[] {
  const data1 = useWifiAllowedOperationsQuery({ params: { tenantId } })
  const data2 = useSwitchAllowedOperationsQuery({ params: { tenantId } })
  const data3 = useTenantAllowedOperationsQuery({ params: { tenantId } })
  const data4 = useVenueAllowedOperationsQuery({ params: { tenantId } })
  const data5 = useGuestAllowedOperationsQuery({ params: { tenantId } })
  const data6 = useUpgradeAllowedOperationsQuery({ params: { tenantId } })
  let all = []
  all.push(data1?.data, data2?.data, data3?.data, data4?.data, data5?.data, data6?.data)
  // @ts-ignore
  return all.flat()
}
