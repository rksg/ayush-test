import { Form, Radio, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import {
  GridCol,
  GridRow,
  PageHeader,
  RadioCardCategory,
  StepsFormLegacy
} from '@acx-ui/components'
import { Features, TierFeatures, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady, useIsWifiCallingProfileLimitReached }               from '@acx-ui/rc/components'
import {
  ServiceOperation,
  ServiceType,
  getServiceListRoutePath,
  getServiceRoutePath,
  isServiceCardEnabled,
  isServiceCardSetEnabled
} from '@acx-ui/rc/utils'
import { Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { ServiceCard } from '../ServiceCard'
import { getUserProfile, isCoreTier } from '@acx-ui/user'

import * as UI from './styledComponents'

export default function SelectServiceForm () {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const navigate = useNavigate()
  const myServicesPath: Path = useTenantLink(getServiceListRoutePath(true))
  const tenantBasePath: Path = useTenantLink('')
  const propertyManagementEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const isPortalProfileEnabled = useIsSplitOn(Features.PORTAL_PROFILE_CONSOLIDATION_TOGGLE)
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinHaReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)
  const isEdgeTnmServiceReady = useIsEdgeFeatureReady(Features.EDGE_THIRDPARTY_MGMT_TOGGLE)
  const isEdgeOltEnabled = useIsSplitOn(Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)
  const { isLimitReached: isWifiCallingLimitReached } = useIsWifiCallingProfileLimitReached()

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

  const set = [
    {
      title: $t({ defaultMessage: 'Connectivity' }),
      items: [
        { type: ServiceType.DHCP, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.EDGE_DHCP,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeHaReady || !isEdgeDhcpHaReady
        },
        {
          type: ServiceType.DPSK,
          categories: [RadioCardCategory.WIFI]
        },
        {
          type: ServiceType.PIN,
          categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
          disabled: !isEdgeHaReady || !isEdgePinHaReady
        },
        {
          type: ServiceType.EDGE_SD_LAN,
          categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
          disabled: !(isEdgeSdLanReady || isEdgeSdLanHaReady)
        },
        {
          type: ServiceType.EDGE_OLT,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeOltEnabled
        }
      ]
    },
    {
      title: $t({ defaultMessage: 'Security' }),
      items: [
        { type: ServiceType.EDGE_FIREWALL,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeHaReady || !isEdgeFirewallHaReady
        }
      ]
    },
    {
      title: $t({ defaultMessage: 'Application' }),
      items: [
        { type: ServiceType.MDNS_PROXY, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.EDGE_MDNS_PROXY,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeMdnsReady,
          isBetaFeature: useIsBetaEnabled(TierFeatures.EDGE_MDNS_PROXY)
        },
        {
          type: ServiceType.EDGE_TNM_SERVICE,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeTnmServiceReady
        },
        {
          type: ServiceType.WIFI_CALLING,
          categories: [RadioCardCategory.WIFI],
          disabled: isWifiCallingLimitReached
        }
      ]
    },
    {
      title: $t({ defaultMessage: 'Guests & Residents' }),
      items: [
        ...(isPortalProfileEnabled ? [
          {
            type: ServiceType.PORTAL_PROFILE,
            categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH]
          }
        ] : [
          { type: ServiceType.PORTAL, categories: [RadioCardCategory.WIFI] },
          {
            type: ServiceType.WEBAUTH_SWITCH,
            categories: [RadioCardCategory.SWITCH],
            disabled: !isEdgeHaReady || !isEdgePinHaReady || !networkSegmentationSwitchEnabled
          }
        ]),
        ...(isCore ? [] : [{
          type: ServiceType.RESIDENT_PORTAL,
          categories: [RadioCardCategory.WIFI],
          disabled: !propertyManagementEnabled
        }])
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
              {
                // eslint-disable-next-line max-len
                set.filter(set => isServiceCardSetEnabled(set, ServiceOperation.CREATE)).map(set => {
                  return <UI.CategoryContainer key={set.title}>
                    <Typography.Title level={3}>
                      { set.title }
                    </Typography.Title>
                    <GridRow>
                      {
                        // eslint-disable-next-line max-len
                        set.items.filter(item => isServiceCardEnabled(item, ServiceOperation.CREATE)).map(item => {
                          return item.type === ServiceType.EDGE_OLT
                            ? <UI.OltCardWrapper key={item.type} col={{ span: 6 }}>
                              <ServiceCard
                                key={item.type}
                                serviceType={item.type}
                                categories={item.categories}
                                type={'radio'}
                                isBetaFeature={false}
                              />
                            </UI.OltCardWrapper>
                            :<GridCol key={item.type} col={{ span: 6 }}>
                              <ServiceCard
                                key={item.type}
                                serviceType={item.type}
                                categories={item.categories}
                                type={'radio'}
                                isBetaFeature={item.isBetaFeature}
                              />
                            </GridCol>
                        })
                      }
                    </GridRow>
                  </UI.CategoryContainer>
                })
              }
            </Radio.Group>
          </Form.Item>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
