import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { PageHeader, StepsForm }  from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }  from '@acx-ui/rc/components'
import {
  getServiceAllowedOperation,
  getServiceListRoutePath,
  ServiceOperation,
  ServiceType,
  NetworkTypeTabsEnum,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }       from '@acx-ui/user'

export default function CreatePortalProfile () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const servicesCreatePageLink = useTenantLink(`${getServiceListRoutePath(true) + '/select'}`)
  const createGuestPortalPath =
    useTenantLink(getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE }))
  const createWebAuthSwitchPortalPath =
    useTenantLink(getServiceRoutePath({
      type: ServiceType.WEBAUTH_SWITCH, oper: ServiceOperation.CREATE
    }))

  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isPinSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)

  const handleCreatePortProfile = async () => {
    const type = form.getFieldValue('portalProfileType')
    navigate(type === NetworkTypeTabsEnum.WIFI ?
      createGuestPortalPath : createWebAuthSwitchPortalPath)
  }


  const guestPortalOids =
    getServiceAllowedOperation(ServiceType.PORTAL, ServiceOperation.CREATE)
  const hasCreateGuestPortalPermission =
    guestPortalOids ? hasAllowedOperations(guestPortalOids) : true

  const webAuthSwitchPortalCreateOids =
    getServiceAllowedOperation(ServiceType.WEBAUTH_SWITCH, ServiceOperation.CREATE)
  const hasWebAuthSwitchPortalPermission =
    webAuthSwitchPortalCreateOids ? hasAllowedOperations(webAuthSwitchPortalCreateOids) : true

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Add Portal' }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'My Services' }),
            link: getServiceListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Portal' }),
            link: getServiceListRoutePath(true) + '/portalProfile/wifi'
          }
        ]}
      />
      <StepsForm
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
        onFinish={handleCreatePortProfile}
        onCancel={() => navigate(servicesCreatePageLink)}>
        <StepsForm.StepForm>
          <Form.Item name='portalProfileType'
            label={$t({ defaultMessage: 'Portal Service Type' })}
            initialValue={hasCreateGuestPortalPermission ?
              NetworkTypeTabsEnum.WIFI : NetworkTypeTabsEnum.SWITCH}>
            <Radio.Group>
              <Space direction='vertical'>
                <Radio value={NetworkTypeTabsEnum.WIFI} disabled={!hasCreateGuestPortalPermission}>
                  {$t({ defaultMessage: 'Guest Portal' })}
                </Radio>
                <Radio value={NetworkTypeTabsEnum.SWITCH}
                  // eslint-disable-next-line max-len
                  disabled={!isEdgePinReady || !isPinSwitchEnabled || !hasWebAuthSwitchPortalPermission}>
                  {$t({ defaultMessage: 'PIN (Personal Identity Network) Portal for Switch' })}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
