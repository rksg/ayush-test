import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'
import { Path }               from 'react-router-dom'

import { PageHeader, StepsForm }                                  from '@acx-ui/components'
import {
  getPolicyRoutePath,
  getSelectServiceRoutePath, hasPolicyPermission,
  LocationExtended,
  PolicyOperation,
  PolicyType, redirectPreviousPage, useAdaptivePolicyBreadcrumb
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'


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

  const pathMap: Record<AdaptivePolicyTabsEnum, Path> = {
    [AdaptivePolicyTabsEnum.ADAPTIVE_POLICY]: createPolicyPath,
    [AdaptivePolicyTabsEnum.ADAPTIVE_POLICY_SET]: createPolicySetPath,
    [AdaptivePolicyTabsEnum.ATTRIBUTE_GROUP]: createAttributeGroupPath
  }

  const fromPage = (useLocation() as LocationExtended)?.state?.from
  const selectServicePageLink = useTenantLink(getSelectServiceRoutePath(true))
  const breadcrumb = useAdaptivePolicyBreadcrumb(PolicyType.ADAPTIVE_POLICY)

  const handleCreation = async () => {
    const type = form.getFieldValue('templateInstanceType')
    navigate(pathMap[type as AdaptivePolicyTabsEnum], { state: { from: fromPage } })
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
        onCancel={() => redirectPreviousPage(navigate, fromPage?.pathname, selectServicePageLink)}>
        <StepsForm.StepForm>
          <Form.Item name='templateInstanceType'
            label={$t({ defaultMessage: 'Template Instance Type' })}
            initialValue={AdaptivePolicyTabsEnum.ADAPTIVE_POLICY}>
            <Radio.Group>
              <Space direction='vertical'>
                {/* eslint-disable-next-line max-len */}
                { hasPolicyPermission({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.CREATE }) &&
                <Radio value={AdaptivePolicyTabsEnum.ADAPTIVE_POLICY}>
                  {$t({ defaultMessage: 'Adaptive Policy' })}
                </Radio>}
                {/* eslint-disable-next-line max-len */}
                { hasPolicyPermission({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.CREATE }) &&
                <Radio value={AdaptivePolicyTabsEnum.ADAPTIVE_POLICY_SET}>
                  {$t({ defaultMessage: 'Adaptive Policy Set' })}
                </Radio>}
                {/* eslint-disable-next-line max-len */}
                { hasPolicyPermission({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.CREATE }) &&
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
