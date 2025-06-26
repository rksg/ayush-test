import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'
import { Path }               from 'react-router-dom'

import { PageHeader, StepsForm }            from '@acx-ui/components'
import {
  getPolicyAllowedOperation,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  LocationExtended,
  PolicyOperation,
  PolicyType, useAdaptivePolicyBreadcrumb
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }                    from '@acx-ui/user'

enum AdaptivePolicyTabsEnum {
  ATTRIBUTE_GROUP = 'attributeGroup',
  ADAPTIVE_POLICY = 'adaptivePolicy',
  ADAPTIVE_POLICY_SET = 'adaptivePolicySet'
}

export default function CreateAdaptivePolicyProfile () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const createPolicyPath = {
    ...tenantBasePath,
    pathname: `${tenantBasePath.pathname}/` + getPolicyRoutePath({
      type: PolicyType.ADAPTIVE_POLICY,
      oper: PolicyOperation.CREATE
    })
  }
  const createPolicySetPath = {
    ...tenantBasePath,
    pathname: `${tenantBasePath.pathname}/` + getPolicyRoutePath({
      type: PolicyType.ADAPTIVE_POLICY_SET,
      oper: PolicyOperation.CREATE
    })
  }
  const createAttributeGroupPath = {
    ...tenantBasePath,
    pathname: `${tenantBasePath.pathname}/` + getPolicyRoutePath({
      type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
      oper: PolicyOperation.CREATE
    })
  }

  const policiesPageLink = useTenantLink(getSelectPolicyRoutePath(true))
  const fromPage = (useLocation() as LocationExtended)?.state?.from
  const breadcrumb = useAdaptivePolicyBreadcrumb(PolicyType.ADAPTIVE_POLICY)

  const handleCreation = async () => {
    const type = form.getFieldValue('templateInstanceType')
    navigate(type === AdaptivePolicyTabsEnum.ADAPTIVE_POLICY
      ? createPolicyPath
      : type === AdaptivePolicyTabsEnum.ADAPTIVE_POLICY_SET
        ? createPolicySetPath : createAttributeGroupPath
    , { state: { from: fromPage } })
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Adaptive Policy Instance' })}
        breadcrumb={breadcrumb}
      />
      <StepsForm
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
        onFinish={handleCreation}
        onCancel={() => navigate(policiesPageLink)}>
        <StepsForm.StepForm>
          <Form.Item name='templateInstanceType'
            label={$t({ defaultMessage: 'Template Instance Type' })}
            initialValue={AdaptivePolicyTabsEnum.ADAPTIVE_POLICY}>
            <Radio.Group>
              <Space direction='vertical'>
                {/* eslint-disable-next-line max-len */}
                { hasAllowedOperations(getPolicyAllowedOperation(PolicyType.ADAPTIVE_POLICY, PolicyOperation.CREATE) ?? []) &&
                <Radio value={AdaptivePolicyTabsEnum.ADAPTIVE_POLICY}>
                  {$t({ defaultMessage: 'Adaptive Policy' })}
                </Radio>}
                {/* eslint-disable-next-line max-len */}
                {hasAllowedOperations(getPolicyAllowedOperation(PolicyType.ADAPTIVE_POLICY_SET, PolicyOperation.CREATE) ?? []) &&
                <Radio value={AdaptivePolicyTabsEnum.ADAPTIVE_POLICY_SET}>
                  {$t({ defaultMessage: 'Adaptive Policy Set' })}
                </Radio>}
                {/* eslint-disable-next-line max-len */}
                { hasAllowedOperations(getPolicyAllowedOperation(PolicyType.RADIUS_ATTRIBUTE_GROUP, PolicyOperation.CREATE) ?? []) &&
                <Radio value={AdaptivePolicyTabsEnum.ATTRIBUTE_GROUP}>
                  {$t({ defaultMessage: 'RADIUS Attribute Group' })}
                </Radio>}
              </Space>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
