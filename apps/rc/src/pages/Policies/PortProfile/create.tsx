import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { PageHeader, StepsForm }                       from '@acx-ui/components'
import { getPolicyListRoutePath, PortProfileTabsEnum } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                  from '@acx-ui/react-router-dom'

export default function CreatePortProfile () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const createEthernetPortProfilePath =
    useTenantLink(`${getPolicyListRoutePath(true)}/ethernetPortProfile/create`)
  const createSwitchPortProfilePath =
    useTenantLink(`${getPolicyListRoutePath(true)}/portProfile/switch/profiles/add`)
  const portProfileRoute = getPolicyListRoutePath(true) + '/portProfile/wifi'

  const handleCreatePortProfile = async () => {
    const type = form.getFieldValue('portProfileType')
    navigate(type === PortProfileTabsEnum.WIFI ?
      createEthernetPortProfilePath : createSwitchPortProfilePath)
  }

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Add Port Profile' }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Port Profiles' }),
            link: portProfileRoute
          }
        ]}
      />
      <StepsForm
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
        onFinish={handleCreatePortProfile}>
        <StepsForm.StepForm>
          <Form.Item name='portProfileType'
            label={$t({ defaultMessage: 'Port Profile Type' })}
            initialValue={PortProfileTabsEnum.WIFI}>
            <Radio.Group>
              <Space direction='vertical'>
                <Radio value={PortProfileTabsEnum.WIFI}>
                  {$t({ defaultMessage: 'Wi-Fi' })}
                </Radio>
                <Radio value={PortProfileTabsEnum.SWITCH}>
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
