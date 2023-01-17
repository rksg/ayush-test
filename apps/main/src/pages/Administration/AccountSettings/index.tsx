import { Form, Divider } from 'antd'
import { useParams }     from 'react-router-dom'
import styled            from 'styled-components/macro'

import { Loader }                from '@acx-ui/components'
import { useUserProfileActions } from '@acx-ui/rc/components'
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


const AccountSettings = (props: { className?: string }) => {
  const { className } = props
  const params = useParams()

  const recoveryPassphraseData = useGetRecoveryPassphraseQuery({ params })
  const mfaTenantDetailsData = useGetMfaTenantDetailsQuery({ params })
  const mspEcProfileData = useGetMspEcProfileQuery({ params })
  const {
    data: userProfileData,
    verifyIsPrimeAdminUser,
    isLoading: isGetUserProfileLoading
  } = useUserProfileActions()

  const showMfa = userProfileData?.tenantId === userProfileData?.varTenantId
  let isMspEc = Boolean(mspEcProfileData.data?.msp_label)
  if (userProfileData?.varTenantId && !showMfa) {
    isMspEc = false
  }

  const isPrimeAdminUser = verifyIsPrimeAdminUser()
  const showRksSupport = isMspEc === false
  const isFirstLoading
    = recoveryPassphraseData.isLoading || mfaTenantDetailsData.isLoading
      || mspEcProfileData.isLoading || isGetUserProfileLoading

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
            <AccessSupportFormItem userProfileData={userProfileData} isMspEc={isMspEc} />
          </>
        )}

        {showMfa && (
          <>
            <Divider />
            <MFAFormItem mfaTenantDetailsData={mfaTenantDetailsData.data} />
          </>
        )}
      </Form>
    </Loader>
  )
}

export default styled(AccountSettings)`
  & .ant-list-item {
    padding: 0;
  }

  & .ant-select.ant-select-in-form-item {
    width: 200px;
  }

  & .ant-checkbox-wrapper-in-form-item {
    color: var(--acx-neutrals-60)
  }

  & .greyText {
    color: var(--acx-neutrals-50)
  }

  & .description {
    font-size: var(--acx-body-4-font-size);
  }

  & .descriptionsWrapper {
    margin-left: 24px;
    flex-wrap: wrap;
    align-content: flex-start;
  }

  .ant-divider {
    margin: 4px 0px 20px;
    background: var(--acx-neutrals-30);
  }
`