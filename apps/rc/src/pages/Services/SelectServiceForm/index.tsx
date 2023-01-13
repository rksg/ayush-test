import { Form, Radio, Typography } from 'antd'
import { defineMessage, useIntl }  from 'react-intl'

import {
  GridCol,
  GridRow,
  PageHeader,
  RadioCard,
  RadioCardCategory,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
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

  const sets = [
    {
      title: defineMessage({ defaultMessage: 'Connectivity' }),
      items: [
        { type: ServiceType.DHCP, categories: [RadioCardCategory.WIFI] },
        { type: ServiceType.DPSK, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.NETWORK_SEGMENTATION,
          categories: [RadioCardCategory.WIFI],
          disabled: !networkSegmentationEnabled
        }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'Application' }),
      items: [
        { type: ServiceType.MDNS_PROXY, categories: [RadioCardCategory.WIFI] },
        { type: ServiceType.WIFI_CALLING, categories: [RadioCardCategory.WIFI] }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'More Services' }),
      items: [
        { type: ServiceType.PORTAL, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.WEBAUTH_SWITCH,
          categories: [RadioCardCategory.SWITCH],
          disabled: !networkSegmentationEnabled
        }
      ]
    }
  ]

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
              {sets.map(set =>
                <UI.CategoryContainer>
                  <Typography.Title level={3}>
                    { $t(set.title) }
                  </Typography.Title>
                  <GridRow>
                    {set.items.map(item => item.disabled
                      ? null
                      : <GridCol col={{ span: 6 }}>
                        <RadioCard
                          type={'radio'}
                          key={item.type}
                          value={item.type}
                          title={$t(serviceTypeLabelMapping[item.type])}
                          description={$t(serviceTypeDescMapping[item.type])}
                          categories={item.categories}
                        />
                      </GridCol>)}
                  </GridRow>
                </UI.CategoryContainer>
              )}
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
