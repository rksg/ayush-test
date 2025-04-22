import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { PageHeader, StepsForm }                                              from '@acx-ui/components'
import { getPolicyListRoutePath, NetworkTypeTabsEnum, usePoliciesBreadcrumb } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                         from '@acx-ui/react-router-dom'

export default function CreateAccessControl () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const createWifiAccessControlPath =
    useTenantLink(`${getPolicyListRoutePath(true)}/accessControl/create`)
  const createSwitchAccessControlPath =
    useTenantLink(`${getPolicyListRoutePath(true)}/accessControl/switch/add`)
  const wifiAccessControlRoute = getPolicyListRoutePath(true) + '/accessControl/wifi'
  const policiesPageLink = useTenantLink(`${getPolicyListRoutePath(true) + '/select'}`)

  const handleCreatePortProfile = async () => {
    const type = form.getFieldValue('accessControlType')
    navigate(type === NetworkTypeTabsEnum.WIFI ?
      createWifiAccessControlPath : createSwitchAccessControlPath)
  }

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Add Access Control' }
          )
        }
        breadcrumb={[
          ...usePoliciesBreadcrumb(),
          {
            text: $t({ defaultMessage: 'Access Control' }),
            link: wifiAccessControlRoute
          }
        ]}
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
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
