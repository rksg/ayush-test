import { Form, Divider } from 'antd'
import styled            from 'styled-components/macro'

import { Loader }                        from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { useGetMspEcProfileQuery }       from '@acx-ui/msp/services'
import { MSPUtils }                      from '@acx-ui/msp/utils'
import { useGetRecoveryPassphraseQuery } from '@acx-ui/rc/services'
import { isDelegationMode }              from '@acx-ui/rc/utils'
import {
  useUserProfileContext,
  useGetMfaTenantDetailsQuery
} from '@acx-ui/user'
import { useTenantId } from '@acx-ui/utils'

import { AccessSupportFormItem }         from './AccessSupportFormItem'
import { DefaultSystemLanguageFormItem } from './DefaultSystemLanguageFormItem'
import { MapRegionFormItem }             from './MapRegionFormItem'
import { MFAFormItem }                   from './MFAFormItem'
import { RecoveryPassphraseFormItem }    from './RecoveryPassphraseFormItem'
import * as UI                           from './styledComponents'

interface AccountSettingsProps {
  className?: string,
}
const AccountSettings = (props : AccountSettingsProps) => {
  const { className } = props
  const params = { tenantId: useTenantId() }
  const {
    data: userProfileData,
    isPrimeAdmin
  } = useUserProfileContext()
  const mspUtils = MSPUtils()

  const recoveryPassphraseData = useGetRecoveryPassphraseQuery({ params })
  const mfaTenantDetailsData = useGetMfaTenantDetailsQuery({ params })
  const mspEcProfileData = useGetMspEcProfileQuery({ params })

  const canMSPDelegation = isDelegationMode() === false
  const hasMSPEcLabel = mspUtils.isMspEc(mspEcProfileData.data)
  // has msp-ec label AND non-delegationMode
  const isMspEc = hasMSPEcLabel && userProfileData?.varTenantId && canMSPDelegation === true

  const isPrimeAdminUser = isPrimeAdmin()
  const isI18n = useIsSplitOn(Features.I18N_TOGGLE)
  const showRksSupport = isMspEc === false
  const isFirstLoading = recoveryPassphraseData.isLoading
    || mfaTenantDetailsData.isLoading || mspEcProfileData.isLoading

  const isFetching = recoveryPassphraseData.isFetching

  return (
    <Loader states={[{ isLoading: isFirstLoading, isFetching }]}>
      <Form
        className={className}
        layout='horizontal'
        labelAlign='left'
      >
        <RecoveryPassphraseFormItem recoveryPassphraseData={recoveryPassphraseData?.data} />

        { (isPrimeAdminUser && isI18n) && (
          <>
            <Divider />
            <DefaultSystemLanguageFormItem />
          </>
        )}

        { isPrimeAdminUser && (
          <>
            <Divider />
            <MapRegionFormItem />
          </>
        )}

        { showRksSupport && (
          <>
            <Divider />
            <AccessSupportFormItem
              hasMSPEcLabel={hasMSPEcLabel}
              canMSPDelegation={canMSPDelegation}
            />
          </>
        )}

        {canMSPDelegation && (
          <>
            <Divider />
            <MFAFormItem
              mfaTenantDetailsData={mfaTenantDetailsData.data}
              isPrimeAdminUser={isPrimeAdminUser}
            />
          </>
        )}
      </Form>
    </Loader>
  )
}

export default styled(AccountSettings)`${UI.styles}`
