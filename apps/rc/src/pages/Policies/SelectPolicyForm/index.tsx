import { Form, Radio } from 'antd'
import { useIntl }     from 'react-intl'

import { GridCol, GridRow, PageHeader, RadioCard, StepsFormLegacy, RadioCardCategory } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                    from '@acx-ui/feature-toggle'
import { useGetApSnmpViewModelQuery }                                                  from '@acx-ui/rc/services'
import {
  PolicyType,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { Path, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { policyTypeDescMapping, policyTypeLabelMapping } from '../contentsMap'

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
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const macRegistrationEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const ApSnmpPolicyTotalCount = useGetApSnmpViewModelQuery({
    params,
    payload: {
      fields: ['id']
    }
  }).data?.totalCount || 0
  const cloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

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
  if (isEdgeEnabled && isEdgeReady) {
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

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Policy or Profile' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ] : [
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
