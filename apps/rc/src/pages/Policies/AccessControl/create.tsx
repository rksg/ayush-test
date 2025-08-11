/* eslint-disable max-len */

import { Form, Radio, Space } from 'antd'
import { useWatch }           from 'antd/lib/form/Form'
import { useIntl }            from 'react-intl'
import { Path }               from 'react-router-dom'

import { PageHeader, StepsForm } from '@acx-ui/components'
import {
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  hasPolicyPermission,
  LocationExtended,
  NetworkTypeTabsEnum, PolicyOperation,
  PolicyType,
  usePolicyListBreadcrumb,
  usePolicyPageHeaderTitle
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

export default function CreateAccessControl () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const policiesPageLink = useTenantLink(getSelectPolicyRoutePath(true))
  const fromPage = (useLocation() as LocationExtended)?.state?.from
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.ACCESS_CONTROL_CONSOLIDATION)
  const pageTitle = usePolicyPageHeaderTitle(false, PolicyType.ACCESS_CONTROL_CONSOLIDATION)

  const accessControlType = useWatch<string>('accessControlType', form)
  const accessControlInstanceType = useWatch<string>('accessControlInstanceType', form)

  const handleCreatePortProfile = async () => {
    // eslint-disable-next-line max-len
    navigate(pathMapping[accessControlType as NetworkTypeTabsEnum][accessControlInstanceType as PolicyType]!,
      { state: { from: fromPage } })
  }

  const pathMapping = {
    [NetworkTypeTabsEnum.WIFI]: {
      // eslint-disable-next-line max-len
      [PolicyType.ACCESS_CONTROL]: useTenantLink(getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })),
      // eslint-disable-next-line max-len
      [PolicyType.LAYER_2_POLICY]: useTenantLink(getPolicyRoutePath({ type: PolicyType.LAYER_2_POLICY, oper: PolicyOperation.CREATE })),
      // eslint-disable-next-line max-len
      [PolicyType.LAYER_3_POLICY]: useTenantLink(getPolicyRoutePath({ type: PolicyType.LAYER_3_POLICY, oper: PolicyOperation.CREATE })),
      // eslint-disable-next-line max-len
      [PolicyType.DEVICE_POLICY]: useTenantLink(getPolicyRoutePath({ type: PolicyType.DEVICE_POLICY, oper: PolicyOperation.CREATE })),
      // eslint-disable-next-line max-len
      [PolicyType.APPLICATION_POLICY]: useTenantLink(getPolicyRoutePath({ type: PolicyType.APPLICATION_POLICY, oper: PolicyOperation.CREATE }))
    },
    [NetworkTypeTabsEnum.SWITCH]: {
      [PolicyType.ACCESS_CONTROL]: useTenantLink('/policies/accessControl/switch/add'),
      [PolicyType.LAYER_2_POLICY]: useTenantLink('/policies/accessControl/switch/layer2/add')
    }
  } as { [K in NetworkTypeTabsEnum]: Partial<Record<PolicyType, Path>> }

  const accessControlInstance = {
    [NetworkTypeTabsEnum.WIFI]: <Form.Item name='accessControlInstanceType'
      label={$t({ defaultMessage: 'Wi-Fi Access Control Profile' })}
      initialValue={PolicyType.ACCESS_CONTROL}>
      <Radio.Group>
        <Space direction='vertical'>
          <Radio value={PolicyType.ACCESS_CONTROL}
            disabled={!hasPolicyPermission({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })}>
            {$t({ defaultMessage: 'Access Control Set' })}
          </Radio>
          <Radio value={PolicyType.LAYER_2_POLICY}
            disabled={!hasPolicyPermission({ type: PolicyType.LAYER_2_POLICY, oper: PolicyOperation.CREATE })}>
            {$t({ defaultMessage: 'Layer 2' })}
          </Radio>
          <Radio value={PolicyType.LAYER_3_POLICY}
            disabled={!hasPolicyPermission({ type: PolicyType.LAYER_3_POLICY, oper: PolicyOperation.CREATE })}>
            {$t({ defaultMessage: 'Layer 3' })}
          </Radio>
          <Radio value={PolicyType.DEVICE_POLICY}
            disabled={!hasPolicyPermission({ type: PolicyType.DEVICE_POLICY, oper: PolicyOperation.CREATE })}>
            {$t({ defaultMessage: 'Device & OS' })}
          </Radio>
          <Radio value={PolicyType.APPLICATION_POLICY}
            disabled={!hasPolicyPermission({ type: PolicyType.APPLICATION_POLICY, oper: PolicyOperation.CREATE })}>
            {$t({ defaultMessage: 'Applications' })}
          </Radio>
        </Space>
      </Radio.Group>
    </Form.Item>,
    [NetworkTypeTabsEnum.SWITCH]: <Form.Item name='accessControlInstanceType'
      label={$t({ defaultMessage: 'Switch Access Control Profile' })}
      initialValue={PolicyType.ACCESS_CONTROL}>
      <Radio.Group>
        <Space direction='vertical'>
          <Radio value={PolicyType.ACCESS_CONTROL}
            disabled={!hasPolicyPermission({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })}>
            {$t({ defaultMessage: 'Access Control Set' })}
          </Radio>
          <Radio value={PolicyType.LAYER_2_POLICY}
            disabled={!hasPolicyPermission({ type: PolicyType.LAYER_2_POLICY, oper: PolicyOperation.CREATE })}>
            {$t({ defaultMessage: 'Layer 2' })}
          </Radio>
        </Space>
      </Radio.Group>
    </Form.Item>
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />
      <StepsForm
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
        onFinish={handleCreatePortProfile}
        onCancel={() => navigate(policiesPageLink)}>
        <StepsForm.StepForm>
          <Form.Item name='accessControlType'
            label={$t({ defaultMessage: 'Access Control Type' })}
            initialValue={NetworkTypeTabsEnum.WIFI}>
            <Radio.Group>
              <Space direction='vertical'>
                <Radio value={NetworkTypeTabsEnum.WIFI}>
                  {$t({ defaultMessage: 'Wi-Fi' })}
                </Radio>
                <Radio value={NetworkTypeTabsEnum.SWITCH}>
                  {$t({ defaultMessage: 'Switch' })}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          { accessControlInstance[accessControlType as NetworkTypeTabsEnum] }
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
