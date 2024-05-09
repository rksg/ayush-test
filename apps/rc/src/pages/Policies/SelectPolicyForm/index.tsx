import { Form, Radio } from 'antd'
import { useIntl }     from 'react-intl'

import {
  GridCol,
  GridRow,
  PageHeader,
  RadioCard,
  StepsFormLegacy,
  RadioCardCategory
} from '@acx-ui/components'
import {
  Features,
  TierFeatures,
  useIsSplitOn,
  useIsTierAllowed
} from '@acx-ui/feature-toggle'
import { IDENTITY_PROVIDER_MAX_COUNT, WIFI_OPERATOR_MAX_COUNT } from '@acx-ui/rc/components'
import {
  useGetApSnmpViewModelQuery,
  useGetIdentityProviderListQuery,
  useGetWifiOperatorListQuery
} from '@acx-ui/rc/services'
import {
  PolicyType,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  policyTypeLabelMapping, policyTypeDescMapping
} from '@acx-ui/rc/utils'
import { Path, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { WifiScopes }                                  from '@acx-ui/types'
import { hasPermission }                               from '@acx-ui/user'


interface policyOption {
  type: PolicyType,
  categories: RadioCardCategory[],
  disabled?: boolean
}

export default function SelectPolicyForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const policiesTablePath: Path = useTenantLink(getPolicyListRoutePath(true))
  const tenantBasePath: Path = useTenantLink('')
  const supportApSnmp = useIsSplitOn(Features.AP_SNMP)
  const supportHotspot20R1 = useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE)
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const macRegistrationEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const ApSnmpPolicyTotalCount = useGetApSnmpViewModelQuery({
    params,
    payload: {
      fields: ['id']
    }
  }, { skip: !supportApSnmp }).data?.totalCount || 0
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
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)

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

  const sets : policyOption[] = [
    { type: PolicyType.ACCESS_CONTROL, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.VLAN_POOL, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.ROGUE_AP_DETECTION, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.AAA, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.SYSLOG, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.CLIENT_ISOLATION, categories: [RadioCardCategory.WIFI] }
  ]

  if (supportApSnmp) {
    // AP SNMP Policy is limited to 64, so disable the radio card if the total count is 64
    sets.push({
      type: PolicyType.SNMP_AGENT,
      categories: [RadioCardCategory.WIFI],
      disabled: (ApSnmpPolicyTotalCount >= 64)
    })
  }

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

  if (isEdgeEnabled && isEdgeReady) {
    sets.push({
      type: PolicyType.TUNNEL_PROFILE, categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE]
    })
  }

  if(macRegistrationEnabled && hasPermission({ scopes: [WifiScopes.CREATE] })) {
    // eslint-disable-next-line max-len
    sets.push({ type: PolicyType.MAC_REGISTRATION_LIST, categories: [RadioCardCategory.WIFI] })
  }

  if(cloudpathBetaEnabled) {
    sets.push({ type: PolicyType.ADAPTIVE_POLICY, categories: [RadioCardCategory.WIFI] })
  }

  if (isCertificateTemplateEnabled && hasPermission({ scopes: [WifiScopes.CREATE] })) {
    sets.push({ type: PolicyType.CERTIFICATE_TEMPLATE, categories: [RadioCardCategory.WIFI] })
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
                {sets.map(set => <GridCol col={{ span: 6 }} key={set.type}>
                  <RadioCard
                    type={set.disabled ? 'disabled' : 'radio'}
                    key={set.type}
                    value={set.type}
                    title={$t(policyTypeLabelMapping[set.type])}
                    description={$t(policyTypeDescMapping[set.type])}
                    categories={set.categories}
                  />
                </GridCol>)}
              </GridRow>
            </Radio.Group>
          </Form.Item>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
