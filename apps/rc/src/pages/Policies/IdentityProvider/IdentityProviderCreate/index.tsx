
import { useEffect } from 'react'

import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'
import { useNavigate }        from 'react-router-dom'

import { PageHeader, StepsForm }                                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                                                 from '@acx-ui/feature-toggle'
import { IDENTITY_PROVIDER_MAX_COUNT, SAML_MAX_COUNT }                            from '@acx-ui/rc/components'
import { useGetIdentityProviderListQuery, useGetSamlIdpProfileViewDataListQuery } from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  getPolicyAllowedOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { useTenantLink }        from '@acx-ui/react-router-dom'
import { hasAllowedOperations } from '@acx-ui/user'

const IdentityProviderCreate = () => {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const isSupportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)
  const isCaptivePortalSsoSamlEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_SSO_SAML_TOGGLE)

  const policiesPageLink = useTenantLink(`${getPolicyListRoutePath(true) + '/select'}`)

  const identityProviderRoute = (isCaptivePortalSsoSamlEnabled)?
    getPolicyRoutePath({
      type: PolicyType.SAML_IDP,
      oper: PolicyOperation.LIST
    }) :
    getPolicyRoutePath({
      type: PolicyType.IDENTITY_PROVIDER,
      oper: PolicyOperation.LIST
    })

  const createSamlIdpPath = useTenantLink('/policies/samlIdp/add')
  const createIdentityProviderPath =
    useTenantLink(
      getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.CREATE })
    )

  const samlIdpOids = getPolicyAllowedOperation(PolicyType.SAML_IDP, PolicyOperation.CREATE)
  const hasCreateSamlIdpPermission = samlIdpOids? hasAllowedOperations(samlIdpOids) : true

  const hotspot20IdpOids =
    getPolicyAllowedOperation(PolicyType.IDENTITY_PROVIDER, PolicyOperation.CREATE)
  const hasCreateHotspot20IdpPermission =
    hotspot20IdpOids? hasAllowedOperations(hotspot20IdpOids) : true

  const handleCreateIdP = async () => {
    const type = form.getFieldValue('idpType')
    navigate(type === PolicyType.SAML_IDP ?
      createSamlIdpPath : createIdentityProviderPath)
  }

  const currentSamlIdpNumber = (useGetSamlIdpProfileViewDataListQuery(
    {
      payload: {
        fields: ['id']
      }
    },
    {
      skip: !isCaptivePortalSsoSamlEnabled || !hasCreateSamlIdpPermission
    }
  )).data?.totalCount ?? 0

  const currentHotspot20IdpNumber = (useGetIdentityProviderListQuery(
    {
      payload: {
        fields: ['id']
      }
    },
    {
      skip: !isSupportHotspot20R1 || !hasCreateHotspot20IdpPermission
    }
  )).data?.totalCount ?? 0

  const isSamlIdpOptionSelectable =
    isCaptivePortalSsoSamlEnabled &&
    hasCreateSamlIdpPermission &&
    (currentSamlIdpNumber < SAML_MAX_COUNT)

  useEffect(() => {
    if (isSamlIdpOptionSelectable) {
      form.setFieldsValue({ idpType: PolicyType.SAML_IDP })
    } else {
      form.setFieldsValue({ idpType: PolicyType.IDENTITY_PROVIDER })
    }
  }, [isSamlIdpOptionSelectable])
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Identity Provider' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Identity Provider' }),
            link: identityProviderRoute
          }
        ]}
      />
      <StepsForm
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
        onFinish={handleCreateIdP}
        onCancel={() => navigate(policiesPageLink)}>
        <StepsForm.StepForm>
          <Form.Item name='idpType'
            label={$t({ defaultMessage: 'Identity Provider Type' })}
            initialValue={
              (isSamlIdpOptionSelectable) ?
                PolicyType.SAML_IDP : PolicyType.IDENTITY_PROVIDER}>
            <Radio.Group>
              <Space direction='vertical'>
                <Radio
                  value={PolicyType.SAML_IDP}
                  disabled={
                    !isCaptivePortalSsoSamlEnabled ||
                    !hasCreateSamlIdpPermission ||
                    (currentSamlIdpNumber >= SAML_MAX_COUNT)
                  }
                >
                  {$t({ defaultMessage: 'SAML IdP' })}
                </Radio>
                <Radio
                  value={PolicyType.IDENTITY_PROVIDER}
                  disabled={
                    !isSupportHotspot20R1 ||
                    !hasCreateHotspot20IdpPermission ||
                    (currentHotspot20IdpNumber >= IDENTITY_PROVIDER_MAX_COUNT)
                  }
                >
                  {$t({ defaultMessage: 'Hotspot 2.0 IdP' })}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default IdentityProviderCreate