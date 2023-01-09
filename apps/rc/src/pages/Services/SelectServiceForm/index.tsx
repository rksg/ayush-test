import { Form, Radio, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import { GridCol, GridRow, PageHeader, RadioCard, StepsForm } from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import {
  ServiceType,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import {
  serviceTypeDescMapping,
  serviceTypeLabelMapping
} from '../contentsMap'

import * as UI from './styledComponents'

export default function SelectServiceForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const servicesTablePath: Path = useTenantLink(getServiceListRoutePath(true))
  const tenantBasePath: Path = useTenantLink('')
  const networkSegmentationEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION)

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
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) }
        ]}
      />
      <StepsForm
        onCancel={() => navigate(servicesTablePath)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
      >
        <StepsForm.StepForm
          name='selectService'
          onFinish={(data) => navigateToCreateService(data)}
        >
          <Form.Item
            name='serviceType'
            rules={[{ required: true }]}
          >
            <Radio.Group style={{ width: '100%' }}>
              <UI.CategoryContainer>
                <Typography.Title level={3}>
                  { $t({ defaultMessage: 'Connectivity' }) }
                </Typography.Title>
                <GridRow>
                  <GridCol col={{ span: 8 }}>
                    <RadioCard
                      type={'radio'}
                      key={ServiceType.DHCP}
                      value={ServiceType.DHCP}
                      title={$t(serviceTypeLabelMapping[ServiceType.DHCP])}
                      description={$t(serviceTypeDescMapping[ServiceType.DHCP])}
                      categories={['WiFi']}
                    />
                  </GridCol>
                  <GridCol col={{ span: 8 }}>
                    <RadioCard
                      type={'radio'}
                      key={ServiceType.DPSK}
                      value={ServiceType.DPSK}
                      title={$t(serviceTypeLabelMapping[ServiceType.DPSK])}
                      description={$t(serviceTypeDescMapping[ServiceType.DPSK])}
                      categories={['WiFi']}
                    />
                  </GridCol>
                  {networkSegmentationEnabled &&
                    <GridCol col={{ span: 8 }}>
                      <RadioCard
                        type={'radio'}
                        key={ServiceType.NETWORK_SEGMENTATION}
                        value={ServiceType.NETWORK_SEGMENTATION}
                        title={$t(serviceTypeLabelMapping[ServiceType.NETWORK_SEGMENTATION])}
                        description={$t(serviceTypeDescMapping[ServiceType.NETWORK_SEGMENTATION])}
                        categories={['WiFi']}
                      />
                    </GridCol>
                  }
                </GridRow>
              </UI.CategoryContainer>
              <UI.CategoryContainer>
                <Typography.Title level={3}>
                  { $t({ defaultMessage: 'Application' }) }
                </Typography.Title>
                <GridRow>
                  <GridCol col={{ span: 8 }}>
                    <RadioCard
                      type={'radio'}
                      key={ServiceType.MDNS_PROXY}
                      value={ServiceType.MDNS_PROXY}
                      title={$t(serviceTypeLabelMapping[ServiceType.MDNS_PROXY])}
                      description={$t(serviceTypeDescMapping[ServiceType.MDNS_PROXY])}
                      categories={['WiFi']}
                    />
                  </GridCol>
                  <GridCol col={{ span: 8 }}>
                    <RadioCard
                      type={'radio'}
                      key={ServiceType.WIFI_CALLING}
                      value={ServiceType.WIFI_CALLING}
                      title={$t(serviceTypeLabelMapping[ServiceType.WIFI_CALLING])}
                      description={$t(serviceTypeDescMapping[ServiceType.WIFI_CALLING])}
                      categories={['WiFi']}
                    />
                  </GridCol>
                </GridRow>
              </UI.CategoryContainer>
              <UI.CategoryContainer>
                <Typography.Title level={3}>
                  { $t({ defaultMessage: 'More Services' }) }
                </Typography.Title>
                <GridRow>
                  <GridCol col={{ span: 8 }}>
                    <RadioCard
                      type={'radio'}
                      key={ServiceType.PORTAL}
                      value={ServiceType.PORTAL}
                      title={$t(serviceTypeLabelMapping[ServiceType.PORTAL])}
                      description={$t(serviceTypeDescMapping[ServiceType.PORTAL])}
                      categories={['WiFi']}
                    />
                  </GridCol>
                </GridRow>
              </UI.CategoryContainer>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
