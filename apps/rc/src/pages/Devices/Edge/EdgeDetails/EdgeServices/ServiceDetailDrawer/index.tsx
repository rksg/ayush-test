import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                                                                                 from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                 from '@acx-ui/feature-toggle'
import { EdgeService, EdgeServiceTypeEnum, ServiceOperation, ServiceType, getServiceDetailsLink } from '@acx-ui/rc/utils'
import { TenantLink }                                                                             from '@acx-ui/react-router-dom'

import { getEdgeServiceTypeString } from '../utils'

import { DhcpDetails }                    from './DhcpDetails'
import { FirewallDetails }                from './FirewallDetails'
import { PersonalIdentityNetworkDetails } from './PersonalIdentityNetworkDetails'
import { SdLanDetails }                   from './SdLanDetails'
import { SdLanDetailsP2 }                 from './SdLanDetailsP2'

interface ServiceDetailDrawerProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  serviceData: EdgeService
}

const drawerWidthMap = {
  [EdgeServiceTypeEnum.DHCP]: 500,
  [EdgeServiceTypeEnum.FIREWALL]: '60%',
  [EdgeServiceTypeEnum.NETWORK_SEGMENTATION]: '50%',
  [EdgeServiceTypeEnum.SD_LAN]: 500,
  [EdgeServiceTypeEnum.SD_LAN_P2]: 500
}

const getDrawerFormLebelColMap = (serviceType: EdgeServiceTypeEnum) => {
  switch(serviceType) {
    case EdgeServiceTypeEnum.SD_LAN_P2:
      return 12
    default:
      return 8
  }
}

export const ServiceDetailDrawer = (props: ServiceDetailDrawerProps) => {
  const { visible, setVisible, serviceData } = props
  const { $t } = useIntl()
  const isEdgeSdLanHaEnabled = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)

  const onClose = () => {
    setVisible(false)
  }

  const drawerContent =(
    <Form
      labelCol={{ span: getDrawerFormLebelColMap(isEdgeSdLanHaEnabled
        ? EdgeServiceTypeEnum.SD_LAN_P2
        : serviceData.serviceType) }}
      labelAlign='left'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Service Name' })}
        children={
          <TenantLink
            to={getServiceDetailUrl(serviceData.serviceType, serviceData.serviceId)}>
            {serviceData.serviceName}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Service Type' })}
        children={getEdgeServiceTypeString($t, serviceData.serviceType)}
      />
      {
        isEdgeSdLanHaEnabled
          ? <SdLanDetailsP2 serviceData={serviceData} />
          : getContentByType(serviceData)
      }
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: 'Service Details' })}
      visible={visible}
      onClose={onClose}
      children={drawerContent}
      destroyOnClose={true}
      width={drawerWidthMap[serviceData.serviceType] ?? 475}
    />
  )
}

const getServiceDetailUrl = (serviceType: EdgeServiceTypeEnum, serviceId: string) => {
  switch(serviceType) {
    case EdgeServiceTypeEnum.DHCP:
      return getServiceDetailsLink({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.DETAIL,
        serviceId: serviceId
      })
    case EdgeServiceTypeEnum.FIREWALL:
      return getServiceDetailsLink({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.DETAIL,
        serviceId: serviceId
      })
    case EdgeServiceTypeEnum.NETWORK_SEGMENTATION:
      return getServiceDetailsLink({
        type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.DETAIL,
        serviceId: serviceId
      })
    case EdgeServiceTypeEnum.SD_LAN:
      return getServiceDetailsLink({
        type: ServiceType.EDGE_SD_LAN,
        oper: ServiceOperation.DETAIL,
        serviceId: serviceId
      })
    default:
      return ''
  }
}

const getContentByType = (serviceData: EdgeService) => {
  switch(serviceData.serviceType) {
    case EdgeServiceTypeEnum.DHCP:
      return <DhcpDetails serviceData={serviceData} />
    case EdgeServiceTypeEnum.FIREWALL:
      return <FirewallDetails serviceData={serviceData} />
    case EdgeServiceTypeEnum.NETWORK_SEGMENTATION:
      return <PersonalIdentityNetworkDetails serviceData={serviceData} />
    case EdgeServiceTypeEnum.SD_LAN:
      return <SdLanDetails serviceData={serviceData} />
    default:
      return
  }
}