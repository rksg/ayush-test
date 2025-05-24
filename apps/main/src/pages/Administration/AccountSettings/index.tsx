import { Form, Divider } from 'antd'
import styled            from 'styled-components/macro'

import { Loader, StepsForm }                                                                         from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                                  from '@acx-ui/feature-toggle'
import { useGetMspEcProfileQuery }                                                                   from '@acx-ui/msp/services'
import { MSPUtils }                                                                                  from '@acx-ui/msp/utils'
import { useGetRecoveryPassphraseQuery, useGetTenantAuthenticationsQuery, useGetTenantDetailsQuery } from '@acx-ui/rc/services'
import { AdministrationUrlsInfo }                                                                    from '@acx-ui/rc/utils'
import {
  useUserProfileContext,
  useGetMfaTenantDetailsQuery,
  getUserProfile,
  hasAllowedOperations
} from '@acx-ui/user'
import { AccountType, getOpsApi, isDelegationMode, useTenantId } from '@acx-ui/utils'

import { AccessSupportFormItem }         from './AccessSupportFormItem'
import { AppTokenFormItem }              from './AppTokenFormItem'
import { AuthServerFormItem }            from './AuthServerFormItem'
import { DefaultSystemLanguageFormItem } from './DefaultSystemLanguageFormItem'
import { DeleteAccountFormItem }         from './DeleteAccountFormItem'
import { EnableR1Beta }                  from './EnableR1Beta'
import { EnableR1BetaFeatures }          from './EnableR1Beta/EnableR1BetaFeatures'
import { MapRegionFormItem }             from './MapRegionFormItem'
import { MFAFormItem }                   from './MFAFormItem'
import { RecoveryPassphraseFormItem }    from './RecoveryPassphraseFormItem'
import { SmsProviderItem }               from './SmsProviderItem'
import * as UI                           from './styledComponents'

interface AccountSettingsProps {
  className?: string,
}
const AccountSettings = (props : AccountSettingsProps) => {
  const { className } = props
  const params = { tenantId: useTenantId() }
  const betaButtonToggle = useIsSplitOn(Features.BETA_BUTTON)
  const mfaNewApiToggle = useIsSplitOn(Features.MFA_NEW_API_TOGGLE)
  const { rbacOpsApiEnabled } = getUserProfile()
  const {
    data: userProfileData,
    isPrimeAdmin,
    betaEnabled
  } = useUserProfileContext()
  const mspUtils = MSPUtils()

  const recoveryPassphraseData = useGetRecoveryPassphraseQuery({ params })
  const mfaTenantDetailsData = useGetMfaTenantDetailsQuery({ params, enableRbac: mfaNewApiToggle })
  const mspEcProfileData = useGetMspEcProfileQuery({ params })
  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const tenantType = tenantDetailsData.data?.tenantType
  const canMSPDelegation = isDelegationMode() === false
  const hasMSPEcLabel = mspUtils.isMspEc(mspEcProfileData.data)
  // has msp-ec label AND non-delegationMode
  const isMspEc = hasMSPEcLabel && userProfileData?.varTenantId && canMSPDelegation === true
  const isDogfood = userProfileData?.dogfood

  const isPrimeAdminUser = isPrimeAdmin()
  const isSsoAllowed = useIsTierAllowed(Features.SSO)
  const isIdmDecoupling = useIsSplitOn(Features.IDM_DECOUPLING) && isSsoAllowed
  const isApiKeyEnabled = useIsSplitOn(Features.IDM_APPLICATION_KEY_TOGGLE)
  const isSmsProviderEnabled = useIsSplitOn(Features.NUVO_SMS_PROVIDER_TOGGLE)
  const isBetaFeatureListEnabled = useIsSplitOn(Features.EARLY_ACCESS_FEATURE_LIST_TOGGLE)
  const isLoginSSoTechpartnerEnabled = useIsSplitOn(Features.LOGIN_SSO_SAML_TECHPARTNER)
  const isLoginSSoMspEcEnabled = useIsSplitOn(Features.LOGIN_SSO_SAML_MSPEC)
  const isSoftTenantDeleteEnabled = useIsSplitOn(Features.NUKETENANT_SOFT_TENANT_DELETE_TOGGLE)

  const hasPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([
      getOpsApi(AdministrationUrlsInfo.getTenantAuthentications)
    ]) : isPrimeAdminUser

  const isTechPartner =
  tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER
  const showRksSupport = isMspEc === false
  const isFirstLoading = recoveryPassphraseData.isLoading
    || mfaTenantDetailsData.isLoading || mspEcProfileData.isLoading

  const showSsoSupport = hasPermission && isIdmDecoupling && !isDogfood
    && (canMSPDelegation || ((isLoginSSoMspEcEnabled ? isMspEc : !isMspEc)
    || (isLoginSSoTechpartnerEnabled && isTechPartner)))

  const showApiKeySupport = hasPermission && isApiKeyEnabled
  const showBetaButton = isPrimeAdminUser && betaButtonToggle && showRksSupport
  const showSoftDeleteButton = (rbacOpsApiEnabled ? hasAllowedOperations([
    getOpsApi(AdministrationUrlsInfo.deleteTenant)
  ]) : isPrimeAdminUser) && isSoftTenantDeleteEnabled &&
   canMSPDelegation

  const authenticationData =
    useGetTenantAuthenticationsQuery({ params }, { skip: !hasPermission })
  const isFetching = recoveryPassphraseData.isFetching

  return (
    <Loader states={[{ isLoading: isFirstLoading, isFetching }]}>
      <Form
        className={className}
        layout='horizontal'
        labelAlign='left'
      >
        <StepsForm.TextContent>
          <RecoveryPassphraseFormItem recoveryPassphraseData={recoveryPassphraseData?.data} />

          { (isPrimeAdminUser) && (
            <>
              <Divider />
              <DefaultSystemLanguageFormItem />
            </>
          )}

          { isSmsProviderEnabled && (
            <>
              <Divider />
              <SmsProviderItem/>
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

          { showBetaButton && (
            <>
              <Divider />
              {isBetaFeatureListEnabled
                ? <EnableR1BetaFeatures
                  betaStatus={betaEnabled}
                  isPrimeAdminUser={isPrimeAdminUser}
                /> :
                <EnableR1Beta
                  betaStatus={betaEnabled}
                  isPrimeAdminUser={isPrimeAdminUser}
                />}
            </>
          )}

          {canMSPDelegation && (
            <>
              <Divider />
              <MFAFormItem
                mfaTenantDetailsData={mfaTenantDetailsData.data}
                isPrimeAdminUser={isPrimeAdminUser}
                isMspEc={isMspEc as boolean}
              />
            </>
          )}

          { showSsoSupport && (
            <>
              <Divider />
              <AuthServerFormItem
                tenantAuthenticationData={authenticationData.data}
              />
            </>
          )}

          { showApiKeySupport && (
            <>
              <Divider />
              <AppTokenFormItem
                tenantAuthenticationData={authenticationData.data}
              />
            </>
          )}

          { showSoftDeleteButton && (
            <>
              <Divider />
              <DeleteAccountFormItem />
            </>
          )}

        </StepsForm.TextContent>
      </Form>
    </Loader>
  )
}

export default styled(AccountSettings)`${UI.styles}`
