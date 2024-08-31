import { Form, Radio } from 'antd'
import { useIntl }     from 'react-intl'

import {
  GridCol,
  GridRow,
  PageHeader,
  RadioCard,
  RadioCardCategory,
  StepsFormLegacy
} from '@acx-ui/components'
import {
  Features,
  useIsSplitOn,
  useIsTierAllowed
} from '@acx-ui/feature-toggle'
import { IDENTITY_PROVIDER_MAX_COUNT, WIFI_OPERATOR_MAX_COUNT, useIsEdgeFeatureReady, useIsEdgeReady } from '@acx-ui/rc/components'
import {
  useGetApSnmpViewModelQuery,
  useGetIdentityProviderListQuery,
  useGetWifiOperatorListQuery
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  ServicePolicyCardData,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  hasCloudpathAccess,
  isServicePolicyCardEnabled,
  policyTypeDescMapping,
  policyTypeLabelMapping
} from '@acx-ui/rc/utils'
import { Path, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { WifiScopes }                                  from '@acx-ui/types'
import { hasPermission }                               from '@acx-ui/user'


export default function SelectPolicyForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const policiesTablePath: Path = useTenantLink(getPolicyListRoutePath(true))
  const tenantBasePath: Path = useTenantLink('')
  const supportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)
  const isEdgeEnabled = useIsEdgeReady()
  const macRegistrationEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isEdgeQosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)
  const ApSnmpPolicyTotalCount = useGetApSnmpViewModelQuery({
    params,
    enableRbac: isUseRbacApi,
    payload: {
      fields: ['id']
    }
  }).data?.totalCount || 0
  const WifiOperatorTotalCount = useGetWifiOperatorListQuery({
    params,
    payload: {
      fields: ['id']
    }
  }, { skip: !supportHotspot20R1 }).data?.totalCount || 0
  const IdentityProviderTotalCount = useGetIdentityProviderListQuery({
    params,
    payload: {
      fields: ['id']
    }
  }, { skip: !supportHotspot20R1 }).data?.totalCount || 0
  const cloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)

  const navigateToCreatePolicy = async function (data: { policyType: PolicyType }) {
    const policyCreatePath = getPolicyRoutePath({
      type: data.policyType,
      oper: PolicyOperation.CREATE
    })

    navigate({
      ...tenantBasePath,
      pathname: `${tenantBasePath.pathname}/${policyCreatePath}`
    })
  }

  const sets : ServicePolicyCardData<PolicyType>[] = [
    { type: PolicyType.ACCESS_CONTROL, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.VLAN_POOL, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.ROGUE_AP_DETECTION, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.AAA, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.SYSLOG, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.CLIENT_ISOLATION, categories: [RadioCardCategory.WIFI] },
    {
      type: PolicyType.SNMP_AGENT,
      categories: [RadioCardCategory.WIFI],
      disabled: (ApSnmpPolicyTotalCount >= 64)
    }
  ]

  if (supportHotspot20R1) {
    sets.push({
      type: PolicyType.WIFI_OPERATOR,
      categories: [RadioCardCategory.WIFI],
      disabled: (WifiOperatorTotalCount >= WIFI_OPERATOR_MAX_COUNT)
    })
    sets.push({
      type: PolicyType.IDENTITY_PROVIDER,
      categories: [RadioCardCategory.WIFI],
      disabled: (IdentityProviderTotalCount >= IDENTITY_PROVIDER_MAX_COUNT)
    })
  }

  if (isEdgeEnabled) {
    sets.push({
      type: PolicyType.TUNNEL_PROFILE, categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE]
    })
  }

  if(macRegistrationEnabled) {
    // eslint-disable-next-line max-len
    sets.push({ type: PolicyType.MAC_REGISTRATION_LIST, categories: [RadioCardCategory.WIFI] })
  }

  if(cloudpathBetaEnabled) {
    sets.push({ type: PolicyType.ADAPTIVE_POLICY, categories: [RadioCardCategory.WIFI] })
  }

  if (isConnectionMeteringEnabled && hasCloudpathAccess()) {
    // eslint-disable-next-line max-len
    sets.push({ type: PolicyType.CONNECTION_METERING, categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE] })
  }

  if (isCertificateTemplateEnabled && hasPermission({ scopes: [WifiScopes.CREATE] })) {
    sets.push({ type: PolicyType.CERTIFICATE_TEMPLATE, categories: [RadioCardCategory.WIFI] })
  }

  if (isSoftGreEnabled && hasPermission({ scopes: [WifiScopes.CREATE] })) {
    sets.push({ type: PolicyType.SOFTGRE, categories: [RadioCardCategory.WIFI] })
  }

  if (isEdgeQosEnabled) {
    sets.push({
      type: PolicyType.QOS_BANDWIDTH, categories: [RadioCardCategory.EDGE]
    })
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Policy or Profile' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
      />
      <StepsFormLegacy
        onCancel={() => navigate(policiesTablePath)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
      >
        <StepsFormLegacy.StepForm
          name='selectService'
          onFinish={(data) => navigateToCreatePolicy(data)}
        >
          <Form.Item
            name='policyType'
            rules={[{ required: true }]}
          >
            <Radio.Group style={{ width: '100%' }}>
              <GridRow>
                {
                  // eslint-disable-next-line max-len
                  sets.filter(set => isServicePolicyCardEnabled<PolicyType>(set, 'create')).map(set => {
                    return <GridCol col={{ span: 6 }} key={set.type}>
                      <RadioCard
                        type={'radio'}
                        key={set.type}
                        value={set.type}
                        title={$t(policyTypeLabelMapping[set.type])}
                        description={$t(policyTypeDescMapping[set.type])}
                        categories={set.categories}
                      />
                    </GridCol>
                  })
                }
              </GridRow>
            </Radio.Group>
          </Form.Item>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
