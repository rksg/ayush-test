import { Form, Radio, Typography } from 'antd'
import _                           from 'lodash'
import { defineMessage, useIntl }  from 'react-intl'

import {
  GridCol,
  GridRow,
  PageHeader,
  RadioCardCategory,
  StepsFormLegacy
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ServiceType,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { ServiceCard } from '../ServiceCard'

import * as UI from './styledComponents'

export default function SelectServiceForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const myServicesPath: Path = useTenantLink(getServiceListRoutePath(true))
  const tenantBasePath: Path = useTenantLink('')
  const propertyManagementEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

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
        {
          type: ServiceType.EDGE_DHCP,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled
        },
        { type: ServiceType.DPSK, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.NETWORK_SEGMENTATION,
          categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled || !isEdgeReady
        }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'Security' }),
      items: [
        { type: ServiceType.EDGE_FIREWALL,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled || !isEdgeReady
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
      title: defineMessage({ defaultMessage: 'Guests & Residents' }),
      items: [
        { type: ServiceType.PORTAL, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.WEBAUTH_SWITCH,
          categories: [RadioCardCategory.SWITCH],
          disabled: !isEdgeEnabled
        },
        {
          type: ServiceType.RESIDENT_PORTAL,
          categories: [RadioCardCategory.WIFI],
          disabled: !propertyManagementEnabled
        }
      ]
    }
  ]

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
      />
      <StepsFormLegacy
        onCancel={() => navigate(myServicesPath)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
      >
        <StepsFormLegacy.StepForm
          name='selectService'
          onFinish={(data) => navigateToCreateService(data)}
        >
          <Form.Item
            name='serviceType'
            rules={[{ required: true }]}
          >
            <Radio.Group style={{ width: '100%' }}>
              {sets.map(set => {
                const isAllDisabled = _.findIndex(set.items,
                  (o) => o.disabled === undefined || o.disabled === false ) === -1
                return !isAllDisabled &&
                <UI.CategoryContainer>
                  <Typography.Title level={3}>
                    { $t(set.title) }
                  </Typography.Title>
                  <GridRow>
                    {set.items.map(item => item.disabled
                      ? null
                      : <GridCol col={{ span: 6 }}>
                        <ServiceCard
                          key={item.type}
                          serviceType={item.type}
                          categories={item.categories}
                          type={'radio'}
                        />
                      </GridCol>)}
                  </GridRow>
                </UI.CategoryContainer>
              })}
            </Radio.Group>
          </Form.Item>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
