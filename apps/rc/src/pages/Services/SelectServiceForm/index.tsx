import { Form, Radio, Space, Typography } from 'antd'
import { useIntl }                        from 'react-intl'

import { PageHeader, StepsForm }            from '@acx-ui/components'
import { ServiceType }                      from '@acx-ui/rc/utils'
import { Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { RadioDescription }                                from '../../NetworkForm/styledComponents'
import { serviceTypeDescMapping, serviceTypeLabelMapping } from '../contentsMap'
import { getServiceRoutePath, ServiceOperation }           from '../serviceRouteUtils'

import * as UI from './styledComponents'


export function SelectServiceForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const servicesTablePath: Path = useTenantLink('/services')
  const tenantBasePath: Path = useTenantLink('')

  const navigateToCreateService = async function (data: { serviceType: ServiceType }) {
    const serviceCreatePath = getServiceRoutePath({
      type: data.serviceType,
      oper: ServiceOperation.CREATE
    })

    navigate({
      ...tenantBasePath,
      pathname: `${tenantBasePath.pathname}/${serviceCreatePath}`
    })
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <StepsForm
        onCancel={() => navigate(servicesTablePath)}
      >
        <StepsForm.StepForm
          name='selectService'
          onFinish={(data) => navigateToCreateService(data)}
        >
          <Form.Item
            name='serviceType'
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <UI.CategoryContainer>
                <Typography.Title level={3}>
                  { $t({ defaultMessage: 'Connectivity' }) }
                </Typography.Title>
                <Space>
                  <Radio key={ServiceType.DHCP} value={ServiceType.DHCP}>
                    {$t(serviceTypeLabelMapping[ServiceType.DHCP])}
                    <RadioDescription>
                      {$t(serviceTypeDescMapping[ServiceType.DHCP])}
                    </RadioDescription>
                  </Radio>
                  <Radio key={ServiceType.DPSK} value={ServiceType.DPSK}>
                    {$t(serviceTypeLabelMapping[ServiceType.DPSK])}
                    <RadioDescription>
                      {$t(serviceTypeDescMapping[ServiceType.DPSK])}
                    </RadioDescription>
                  </Radio>
                </Space>
              </UI.CategoryContainer>
              <UI.CategoryContainer>
                <Typography.Title level={3}>
                  { $t({ defaultMessage: 'Application' }) }
                </Typography.Title>
                <Space>
                  <Radio key={ServiceType.MDNS_PROXY} value={ServiceType.MDNS_PROXY}>
                    {$t(serviceTypeLabelMapping[ServiceType.MDNS_PROXY])}
                    <RadioDescription>
                      {$t(serviceTypeDescMapping[ServiceType.MDNS_PROXY])}
                    </RadioDescription>
                  </Radio>
                  <Radio key={ServiceType.WIFI_CALLING} value={ServiceType.WIFI_CALLING}>
                    {$t(serviceTypeLabelMapping[ServiceType.WIFI_CALLING])}
                    <RadioDescription>
                      {$t(serviceTypeDescMapping[ServiceType.WIFI_CALLING])}
                    </RadioDescription>
                  </Radio>
                </Space>
              </UI.CategoryContainer>
              <UI.CategoryContainer>
                <Typography.Title level={3}>
                  { $t({ defaultMessage: 'More Services' }) }
                </Typography.Title>
                <Radio key={ServiceType.PORTAL} value={ServiceType.PORTAL}>
                  {$t(serviceTypeLabelMapping[ServiceType.PORTAL])}
                  <RadioDescription>
                    {$t(serviceTypeDescMapping[ServiceType.PORTAL])}
                  </RadioDescription>
                </Radio>
              </UI.CategoryContainer>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
