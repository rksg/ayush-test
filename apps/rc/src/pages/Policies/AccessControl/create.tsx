import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { PageHeader, StepsForm }                                                                  from '@acx-ui/components'
import { getSelectPolicyRoutePath, LocationExtended, NetworkTypeTabsEnum, usePoliciesBreadcrumb } from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink }                                                from '@acx-ui/react-router-dom'

export default function CreateAccessControl () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const createWifiAccessControlPath = useTenantLink('/policies/accessControl/create')
  const createSwitchAccessControlPath = useTenantLink('/policies/accessControl/switch/add')
  const wifiAccessControlRoute = '/policies/accessControl/wifi'
  const policiesPageLink = useTenantLink(getSelectPolicyRoutePath(true))
  const fromPage = (useLocation() as LocationExtended)?.state?.from

  const handleCreatePortProfile = async () => {
    const type = form.getFieldValue('accessControlType')
    navigate(type === NetworkTypeTabsEnum.WIFI ?
      createWifiAccessControlPath : createSwitchAccessControlPath, { state: { from: fromPage } })
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
