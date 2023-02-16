import { Form, Divider } from 'antd'
import { useParams }     from 'react-router-dom'
import styled            from 'styled-components/macro'

import { Loader }                from '@acx-ui/components'
import { useUserProfileContext } from '@acx-ui/rc/components'
import {
  useGetRecoveryPassphraseQuery,
  useGetMfaTenantDetailsQuery,
  useGetMspEcProfileQuery
} from '@acx-ui/rc/services'

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
  const params = useParams()
  const {
    data: userProfileData,
    isPrimeAdmin
  } = useUserProfileContext()

  const recoveryPassphraseData = useGetRecoveryPassphraseQuery({ params })
  const mfaTenantDetailsData = useGetMfaTenantDetailsQuery({ params })
  const mspEcProfileData = useGetMspEcProfileQuery({ params })

  const canMSPDelegation = userProfileData?.tenantId === userProfileData?.varTenantId
  let isMspEc = Boolean(mspEcProfileData.data?.msp_label)
  if (userProfileData?.varTenantId && canMSPDelegation === false) {
    isMspEc = false
  }

  const isPrimeAdminUser = isPrimeAdmin()
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

        <Divider />

        <DefaultSystemLanguageFormItem />

        { isPrimeAdminUser && (
          <>
            <Divider />
            <MapRegionFormItem />
          </>)}

        { showRksSupport && (
          <>
            <Divider />
            <AccessSupportFormItem
              isMspEc={isMspEc}
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