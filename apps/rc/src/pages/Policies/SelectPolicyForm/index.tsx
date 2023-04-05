import { Form, Radio } from 'antd'
import { useIntl }     from 'react-intl'

import {
  GridCol,
  GridRow,
  PageHeader,
  RadioCard ,
  StepsForm,
  RadioCardCategory
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  PolicyType,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { policyTypeDescMapping, policyTypeLabelMapping } from '../contentsMap'

export default function SelectPolicyForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const policiesTablePath: Path = useTenantLink(getPolicyListRoutePath(true))
  const tenantBasePath: Path = useTenantLink('')
  const supportApSnmp = useIsSplitOn(Features.AP_SNMP)
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)
  const macRegistrationEnabled = useIsSplitOn(Features.MAC_REGISTRATION)
  const attributeGropuEnabled = useIsSplitOn(Features.RADIUS_ATTRIBUTE_GROUP_CONFIG)
  const adaptivePolicyEnabled = useIsSplitOn(Features.POLICY_MANAGEMENT)

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

  const sets = [
    { type: PolicyType.ACCESS_CONTROL, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.VLAN_POOL, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.ROGUE_AP_DETECTION, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.AAA, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.SYSLOG, categories: [RadioCardCategory.WIFI] },
    { type: PolicyType.CLIENT_ISOLATION, categories: [RadioCardCategory.WIFI] }
  ]

  if (supportApSnmp) {
    sets.push({ type: PolicyType.SNMP_AGENT, categories: [RadioCardCategory.WIFI] })
  }
  if (isEdgeEnabled) {
    sets.push({ type: PolicyType.TUNNEL_PROFILE, categories: [RadioCardCategory.WIFI] })
  }

  if(macRegistrationEnabled) {
    sets.push({ type: PolicyType.MAC_REGISTRATION_LIST, categories: [RadioCardCategory.WIFI] })
  }

  if(adaptivePolicyEnabled && attributeGropuEnabled) {
    sets.push({ type: PolicyType.ADAPTIVE_POLICY, categories: [RadioCardCategory.WIFI] })
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Policy or Profile' })}
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) }
        ]}
      />
      <StepsForm
        onCancel={() => navigate(policiesTablePath)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
      >
        <StepsForm.StepForm
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
                    type='radio'
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
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
