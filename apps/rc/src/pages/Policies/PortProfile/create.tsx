/* eslint-disable max-len */
import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { PageHeader, StepsForm }  from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import {
  getPolicyAllowedOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  PortProfileTabsEnum,
  usePoliciesBreadcrumb
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }       from '@acx-ui/user'

export default function CreatePortProfile () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const createEthernetPortProfilePath = useTenantLink(
    getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE, oper: PolicyOperation.CREATE })
  )
  const createSwitchPortProfilePath =
    useTenantLink(`${getPolicyListRoutePath(true)}/portProfile/switch/profiles/add`)
  const portProfileRoute = getPolicyListRoutePath(true) + '/portProfile/wifi'
  const policiesPageLink = useTenantLink(`${getPolicyListRoutePath(true) + '/select'}`)
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isSwitchPortProfileEnabled = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)

  const handleCreatePortProfile = async () => {
    const type = form.getFieldValue('portProfileType')
    navigate(type === PortProfileTabsEnum.WIFI ?
      createEthernetPortProfilePath : createSwitchPortProfilePath)
  }

  const wifiPortProfileOids = getPolicyAllowedOperation(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.CREATE)
  const hasCreateWifiPortProfilePermission = wifiPortProfileOids? hasAllowedOperations(wifiPortProfileOids) : true

  const switchPortProfileOids = getPolicyAllowedOperation(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.CREATE)
  const hasCreateSwitchPortProfilePermission = switchPortProfileOids? hasAllowedOperations(switchPortProfileOids) : true

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Add Port Profile' }
          )
        }
        breadcrumb={[
          ...usePoliciesBreadcrumb(),
          {
            text: $t({ defaultMessage: 'Port Profiles' }),
            link: portProfileRoute
          }
        ]}
      />
      <StepsForm
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
        onFinish={handleCreatePortProfile}
        onCancel={() => navigate(policiesPageLink)}>
        <StepsForm.StepForm>
          <Form.Item name='portProfileType'
            label={$t({ defaultMessage: 'Port Profile Type' })}
            initialValue={(isEthernetPortProfileEnabled && hasCreateWifiPortProfilePermission) ?
              PortProfileTabsEnum.WIFI : PortProfileTabsEnum.SWITCH}>
            <Radio.Group>
              <Space direction='vertical'>
                <Radio value={PortProfileTabsEnum.WIFI} disabled={!isEthernetPortProfileEnabled || !hasCreateWifiPortProfilePermission}>
                  {$t({ defaultMessage: 'Wi-Fi' })}
                </Radio>
                <Radio value={PortProfileTabsEnum.SWITCH} disabled={!isSwitchPortProfileEnabled || !hasCreateSwitchPortProfilePermission}>
                  {$t({ defaultMessage: 'Switch' })}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
