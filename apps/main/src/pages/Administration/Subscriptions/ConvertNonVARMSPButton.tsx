import { useCallback, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useGetMspEcProfileQuery } from '@acx-ui/msp/services'
import {
  MspUserSettingType,
  MSP_USER_SETTING,
  MSPUtils
} from '@acx-ui/msp/utils'
import {
  useConvertNonVARToMSPMutation,
  useLazyGetTenantDetailsQuery,
  useLazyGetDelegationsQuery
} from '@acx-ui/rc/services'
import {
  CatchErrorDetails,
  CommonErrorsResult,
  TenantType,
  TenantDetails,
  Delegation
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'
import {
  getProductKey,
  getUserSettingsByPath,
  setDeepUserSettings,
  useLazyGetAllUserSettingsQuery,
  useSaveUserSettingsMutation,
  useUserProfileContext
} from '@acx-ui/user'



export const ConvertNonVARMSPButton = () => {
  const { $t } = useIntl()

  const params = useParams()
  const navigate = useNavigate()
  const userProfileCtx = useUserProfileContext()
  const [tenantInfo, setTenantInfo] = useState<TenantDetails>({} as TenantDetails)
  const [delegationInfo, setDelegationInfo] = useState<Delegation[]>([] as Delegation[])

  const { data: mspEcProfileData, isLoading: isLoadingMSPEC } = useGetMspEcProfileQuery({ params })
  const [getTenantInfo] = useLazyGetTenantDetailsQuery()
  const [getDelegationInfo]= useLazyGetDelegationsQuery()
  const [getUserSettings] = useLazyGetAllUserSettingsQuery()
  const [convertNonVarToMsp] = useConvertNonVARToMSPMutation()
  const [saveUserSettings] = useSaveUserSettingsMutation()

  const checkMspLicenses = async () => {
    const { destroy } = showActionModal({
      type: 'info',
      title: $t({ defaultMessage: 'Checking MSP Licenses' }),
      content: <Loader
        states={[{ isLoading: true }]}
        style={{ backgroundColor: 'transparent' }}
      />,
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: []
      }
    })

    let title, msg
    try {
      await convertNonVarToMsp({ params }).unwrap()
      title = $t({ defaultMessage: 'MSP Licenses Detected' })
      // eslint-disable-next-line max-len
      msg = $t({ defaultMessage: 'Since you have purchased MSP licenses, we will now refresh the system and take you to the special MSP dashboard. ' +
                  // eslint-disable-next-line max-len
                  'This dashboard will serve as an entry point to Ruckus Cloud from now on, for all users of this account. ' +
                  'Purchase MSP licenses to enable adding customers.' })

      showActionModal({
        type: 'info',
        title,
        content: msg,
        okText: $t({ defaultMessage: 'Take me to the MSP dashboard' }),
        onOk: async () => {
          try {
            const userSettings = await getUserSettings({ params }).unwrap()
            let mspSetting
            // eslint-disable-next-line max-len
            = getUserSettingsByPath(userSettings, MSP_USER_SETTING) as (MspUserSettingType | undefined)

            if (!mspSetting) {
              mspSetting = {} as MspUserSettingType
            }

            mspSetting.nonVarMspOnboard = true
            const productKey = getProductKey(MSP_USER_SETTING)
            if (productKey) {
              const newSettings = setDeepUserSettings(userSettings, MSP_USER_SETTING, mspSetting)
              saveUserSettings({
                params: {
                  tenantId: params.tenantId,
                  productKey
                },
                payload: newSettings[productKey]
              })
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error)
          }

          navigate(`/${params.tenantId}/v/dashboard/mspCustomers`,
            { replace: true })
        }
      })
    } catch (error) {
      const respData = error as CommonErrorsResult<CatchErrorDetails>
      if (respData.status === 404) {
        title = $t({ defaultMessage: 'No MSP Licenses Detected' })
        // eslint-disable-next-line max-len
        msg = $t({ defaultMessage: 'We did not find any MSP licenses bound to this account. If you think this is a mistake, ' +
                    'please try again or contact Ruckus Support or your VAR.' })
        showActionModal({
          type: 'info',
          title,
          content: msg
        })
      } else {
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Server Error' }),
          content: $t({ defaultMessage: 'An internal error has occurred. Please contact support.' })
        })
      }
    } finally {
      destroy()
    }
  }

  const handleCheckMspLicensesClick = () => {
    // when REC has VAR delegations, shouldn't allow it to be converted into nonVARMsp
    const hasDelegations = (delegationInfo && delegationInfo.length) ? true : false
    if (hasDelegations) {
      const title = $t({ defaultMessage: 'Operation not allowed' })
      // eslint-disable-next-line max-len
      const msg = $t({ defaultMessage: 'You are currently delegated to a 3rd party administrator. ' +
                    // eslint-disable-next-line max-len
                    'please remove the delegation and try again or contact Ruckus Support or your VAR.' })

      showActionModal({
        type: 'info',
        title,
        content: msg,
        okText: $t({ defaultMessage: 'OK' })
      })
    } else {
      checkMspLicenses()
    }
  }

  const canInitCheck = useCallback(() => {
    const user = userProfileCtx.data
    if (!user) return false

    const mspUtils = MSPUtils()
    const isPrimeAdminUser = userProfileCtx.isPrimeAdmin()
    const isMspEc = mspUtils.isMspEc(mspEcProfileData)
    const isVAR = user.var
    const isDogfood = user.dogfood
    const isSupport = user.support

    return isPrimeAdminUser
              && !isVAR
              && !isMspEc
              && !isDogfood
              && !isSupport
  }, [mspEcProfileData, userProfileCtx])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tenantData = await getTenantInfo({ params }).unwrap()
        const delegations = await getDelegationInfo({ params }).unwrap()
        setTenantInfo(tenantData)
        setDelegationInfo(delegations)
      } catch(err) {
        // eslint-disable-next-line no-console
        console.log(err)
      }
    }

    const canInit = canInitCheck()
    if (canInit)
      fetchData()
  }, [params, getTenantInfo, getDelegationInfo, canInitCheck])

  const canInit = canInitCheck()
  const displayConvertBtn = canInit && tenantInfo.tenantType !== TenantType.MSP_NON_VAR
                              && !isLoadingMSPEC

  return displayConvertBtn
    ? <Button size='middle' onClick={handleCheckMspLicensesClick}>
      {$t({ defaultMessage: 'Go to MSP Subscriptions' })}
    </Button>
    : null
}