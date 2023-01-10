import { Form, Radio } from 'antd'
import { useIntl }     from 'react-intl'

import { GridCol, GridRow, PageHeader, RadioCard, RadioCardProps, StepsForm } from '@acx-ui/components'
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

  const category = { wifi: 'WiFi', switch: 'Switch' } as const

  const sets = [
    { type: PolicyType.ACCESS_CONTROL, categories: [category.wifi] },
    { type: PolicyType.VLAN_POOL, categories: [category.switch] },
    { type: PolicyType.ROGUE_AP_DETECTION, categories: [category.wifi] },
    { type: PolicyType.AAA, categories: [category.wifi, category.switch] },
    { type: PolicyType.SYSLOG, categories: [category.wifi, category.switch] },
    { type: PolicyType.CLIENT_ISOLATION, categories: [category.wifi] }
  ]

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
                {sets.map(set => <GridCol col={{ span: 8 }} key={set.type}>
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
