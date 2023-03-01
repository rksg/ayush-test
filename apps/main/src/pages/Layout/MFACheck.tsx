import { useEffect, useState } from 'react'

import {
  MFASetupModal
} from '@acx-ui/msp/components'
import { useLazyGetUserProfileQuery, useLazyGetMfaTenantDetailsQuery, useLazyGetMfaAdminDetailsQuery } from '@acx-ui/rc/services'
import { isDelegationMode, MfaDetailStatus }                                                           from '@acx-ui/rc/utils'
import {  Outlet, useParams }                                                                          from '@acx-ui/react-router-dom'
import { getJwtTokenPayload }                                                                          from '@acx-ui/utils'


export const MFACheck = () => {
  const params = useParams()
  const { tenantId } = getJwtTokenPayload()
  const[mfaDetails, setMfaDetails] = useState({} as MfaDetailStatus)
  const[mfaSetupFinish, setMfaSetupFinish] = useState(false)
  const [refetch] = useLazyGetUserProfileQuery()
  const [getMfaTenantDetails] = useLazyGetMfaTenantDetailsQuery()
  const [getMfaAdminDetails] = useLazyGetMfaAdminDetailsQuery()

  const handleMFASetupFinish = () => {
    setMfaSetupFinish(true)
  }

  useEffect(() => {
    refetch({ params: { tenantId } })
  }, [refetch, tenantId])

  useEffect(() => {
    const fetchMfaData = async () => {
      const mfaTenantData = await getMfaTenantDetails({ params }).unwrap()
      if (mfaTenantData.enabled) {
        const mfaDetailsData = await getMfaAdminDetails({
          params: {
            userId: mfaTenantData?.userId
          } }).unwrap()

        setMfaDetails(mfaDetailsData)
      }
    }

    fetchMfaData()
  }, [getMfaAdminDetails, getMfaTenantDetails, params])

  // no need to check MFA first-time setup in delegation mode
  return !isDelegationMode()
  && (mfaDetails.enabled
    && mfaDetails.mfaMethods.length === 0
    && mfaSetupFinish === false)
    ? <MFASetupModal onFinish={handleMFASetupFinish} />
    : <Outlet/>
}