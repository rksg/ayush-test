import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import {
  categoryMapping,
  PageHeader,
  RadioCard,
  RadioCardCategory,
  StepsForm
}  from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }  from '@acx-ui/rc/components'
import {
  getServiceAllowedOperation,
  getSelectServiceRoutePath,
  ServiceOperation,
  ServiceType,
  PortalProfileTabsEnum,
  getServiceRoutePath,
  LocationExtended,
  useServiceListBreadcrumb
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }                    from '@acx-ui/user'

export default function CreatePortalProfile () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const fromPage = (useLocation() as LocationExtended)?.state?.from
  const servicesCreatePageLink = useTenantLink(getSelectServiceRoutePath(true))
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
    navigate(type === PortalProfileTabsEnum.GUEST ?
      createGuestPortalPath : createWebAuthSwitchPortalPath, { state: { from: fromPage } })
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
        title={$t({ defaultMessage: 'Add Portal' })}
        breadcrumb={useServiceListBreadcrumb(ServiceType.PORTAL_PROFILE)}
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
              PortalProfileTabsEnum.GUEST : PortalProfileTabsEnum.PIN}>
            <Radio.Group>
              <Space direction='vertical'>
                <Radio value={PortalProfileTabsEnum.GUEST}
                  disabled={!hasCreateGuestPortalPermission}>
                  <RadioCard.CategoryWrapper style={{ position: 'static' }}>
                    {$t({ defaultMessage: 'Guest Portal' })}
                    <RadioCard.Category color={categoryMapping[RadioCardCategory.WIFI].color}>
                      {$t(categoryMapping[RadioCardCategory.WIFI].text)}
                    </RadioCard.Category>
                  </RadioCard.CategoryWrapper>
                </Radio>
                <Radio value={PortalProfileTabsEnum.PIN}
                  // eslint-disable-next-line max-len
                  disabled={!isEdgePinReady || ! isPinSwitchEnabled || !hasWebAuthSwitchPortalPermission}>
                  <RadioCard.CategoryWrapper style={{ position: 'static' }}>
                    {$t({ defaultMessage: 'PIN (Personal Identity Network) Portal for Switch' })}
                    <RadioCard.Category color={categoryMapping[RadioCardCategory.EDGE].color}>
                      {$t(categoryMapping[RadioCardCategory.EDGE].text)}
                    </RadioCard.Category>
                  </RadioCard.CategoryWrapper>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
