import { Col, Form, Radio, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { PageHeader, StepsForm }            from '@acx-ui/components'
import { PolicyType }                       from '@acx-ui/rc/utils'
import { Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { RadioDescription }                                            from '../../Networks/NetworkForm/styledComponents'
import { policyTypeDescMapping, policyTypeLabelMapping }               from '../contentsMap'
import { getPolicyListRoutePath, getPolicyRoutePath, PolicyOperation } from '../policyRouteUtils'



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
            <Radio.Group>
              <Row>
                <Col span={8}>
                  <Radio key={PolicyType.ACCESS_CONTROL} value={PolicyType.ACCESS_CONTROL}>
                    {$t(policyTypeLabelMapping[PolicyType.ACCESS_CONTROL])}
                    <RadioDescription>
                      {$t(policyTypeDescMapping[PolicyType.ACCESS_CONTROL])}
                    </RadioDescription>
                  </Radio>
                </Col>
                <Col span={8}>
                  <Radio key={PolicyType.VLAN_POOL} value={PolicyType.VLAN_POOL}>
                    {$t(policyTypeLabelMapping[PolicyType.VLAN_POOL])}
                    <RadioDescription>
                      {$t(policyTypeDescMapping[PolicyType.VLAN_POOL])}
                    </RadioDescription>
                  </Radio>
                </Col>
                <Col span={8}>
                  <Radio key={PolicyType.ROGUE_AP_DETECTION} value={PolicyType.ROGUE_AP_DETECTION}>
                    {$t(policyTypeLabelMapping[PolicyType.ROGUE_AP_DETECTION])}
                    <RadioDescription>
                      {$t(policyTypeDescMapping[PolicyType.ROGUE_AP_DETECTION])}
                    </RadioDescription>
                  </Radio>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <Radio key={PolicyType.AAA} value={PolicyType.AAA}>
                    {$t(policyTypeLabelMapping[PolicyType.AAA])}
                    <RadioDescription>
                      {$t(policyTypeDescMapping[PolicyType.AAA])}
                    </RadioDescription>
                  </Radio>
                </Col>
                <Col span={8}>
                  <Radio key={PolicyType.SYSLOG} value={PolicyType.SYSLOG}>
                    {$t(policyTypeLabelMapping[PolicyType.SYSLOG])}
                    <RadioDescription>
                      {$t(policyTypeDescMapping[PolicyType.SYSLOG])}
                    </RadioDescription>
                  </Radio>
                </Col>
                <Col span={8}>
                  <Radio key={PolicyType.CLIENT_ISOLATION} value={PolicyType.CLIENT_ISOLATION}>
                    {$t(policyTypeLabelMapping[PolicyType.CLIENT_ISOLATION])}
                    <RadioDescription>
                      {$t(policyTypeDescMapping[PolicyType.CLIENT_ISOLATION])}
                    </RadioDescription>
                  </Radio>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
