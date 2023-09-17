import { useEffect, useState } from 'react'

import {
  MFASetupModal
} from '@acx-ui/msp/components'
import { Outlet }                  from '@acx-ui/react-router-dom'
import {
  MfaDetailStatus,
  useLazyGetMfaTenantDetailsQuery,
  useLazyGetMfaAdminDetailsQuery
} from '@acx-ui/user'
import { getJwtTokenPayload, isDelegationMode } from '@acx-ui/utils'

export const MFACheck = () => {
  const { tenantId } = getJwtTokenPayload()
  const[mfaDetails, setMfaDetails] = useState({} as MfaDetailStatus)
  const[mfaSetupFinish, setMfaSetupFinish] = useState(false)
  const [getMfaTenantDetails] = useLazyGetMfaTenantDetailsQuery()
  const [getMfaAdminDetails] = useLazyGetMfaAdminDetailsQuery()

  const handleMFASetupFinish = () => {
    setMfaSetupFinish(true)
  }

  useEffect(() => {
    const fetchMfaData = async () => {
      const mfaTenantData = await getMfaTenantDetails({ params: { tenantId } }).unwrap()
      if (mfaTenantData.enabled) {
        const mfaDetailsData = await getMfaAdminDetails({
          params: {
            userId: mfaTenantData?.userId
          } }).unwrap()

        setMfaDetails(mfaDetailsData)
      }
    }

    fetchMfaData()
  }, [getMfaAdminDetails, getMfaTenantDetails, tenantId])

  // no need to check MFA first-time setup in delegation mode
  return !isDelegationMode()
  && (mfaDetails.enabled
    && mfaDetails.mfaMethods?.length === 0
    && mfaSetupFinish === false)
    ? <MFASetupModal onFinish={handleMFASetupFinish} />
    : <Outlet/>
}
