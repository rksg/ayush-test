import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                                                                                 from '@acx-ui/components'
import { Features }                                                                               from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                                  from '@acx-ui/rc/components'
import { EdgeService, EdgeServiceTypeEnum, ServiceOperation, ServiceType, getServiceDetailsLink } from '@acx-ui/rc/utils'
import { TenantLink }                                                                             from '@acx-ui/react-router-dom'

import { getEdgeServiceTypeString } from '../utils'

import { DhcpDetails }                    from './DhcpDetails'
import { FirewallDetails }                from './FirewallDetails'
import { MdnsDetails }                    from './MdnsDetails'
import { MvSdLanDetails }                 from './MvSdLan'
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
  [EdgeServiceTypeEnum.PIN]: '50%',
  [EdgeServiceTypeEnum.SD_LAN]: 500,
  [EdgeServiceTypeEnum.SD_LAN_P2]: 500,
  [EdgeServiceTypeEnum.MV_SD_LAN]: 500,
  [EdgeServiceTypeEnum.MDNS_PROXY]: 500
}

const getDrawerFormLebelColMap = (serviceType: EdgeServiceTypeEnum) => {
  switch(serviceType) {
    case EdgeServiceTypeEnum.SD_LAN_P2:
    case EdgeServiceTypeEnum.MV_SD_LAN:
      return 12
    default:
      return 8
  }
}

const useSdLanServiceType = () => {
  const isEdgeSdLanHaEnabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isMvEdgeSdLanEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  return isMvEdgeSdLanEnabled
    ? EdgeServiceTypeEnum.MV_SD_LAN
    : (isEdgeSdLanHaEnabled ? EdgeServiceTypeEnum.SD_LAN_P2 : EdgeServiceTypeEnum.SD_LAN)
}

export const ServiceDetailDrawer = (props: ServiceDetailDrawerProps) => {
  const { visible, setVisible, serviceData } = props
  const { $t } = useIntl()
  const serviceContent = useServiceContentByType(serviceData)
  const sdLanServiceType = useSdLanServiceType()

  const onClose = () => {
    setVisible(false)
  }

  const serviceType = serviceData.serviceType === EdgeServiceTypeEnum.SD_LAN
    ? sdLanServiceType
    : serviceData.serviceType

  const drawerContent =(
    <Form
      labelCol={{ span: getDrawerFormLebelColMap(serviceType) }}
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

      {serviceContent}
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
    case EdgeServiceTypeEnum.PIN:
      return getServiceDetailsLink({
        type: ServiceType.PIN,
        oper: ServiceOperation.DETAIL,
        serviceId: serviceId
      })
    case EdgeServiceTypeEnum.SD_LAN:
      return getServiceDetailsLink({
        type: ServiceType.EDGE_SD_LAN,
        oper: ServiceOperation.DETAIL,
        serviceId: serviceId
      })
    case EdgeServiceTypeEnum.MDNS_PROXY:
      return getServiceDetailsLink({
        type: ServiceType.EDGE_MDNS_PROXY,
        oper: ServiceOperation.DETAIL,
        serviceId: serviceId
      })
    default:
      return ''
  }
}

const useServiceContentByType = (serviceData: EdgeService) => {
  const sdLanServiceType = useSdLanServiceType()

  switch(serviceData.serviceType) {
    case EdgeServiceTypeEnum.DHCP:
      return <DhcpDetails serviceData={serviceData} />
    case EdgeServiceTypeEnum.FIREWALL:
      return <FirewallDetails serviceData={serviceData} />
    case EdgeServiceTypeEnum.PIN:
      return <PersonalIdentityNetworkDetails serviceData={serviceData} />
    case EdgeServiceTypeEnum.SD_LAN:
      return sdLanServiceType === EdgeServiceTypeEnum.MV_SD_LAN
        ? <MvSdLanDetails serviceData={serviceData} />
        : (sdLanServiceType === EdgeServiceTypeEnum.SD_LAN_P2
          ? <SdLanDetailsP2 serviceData={serviceData} />
          : <SdLanDetails serviceData={serviceData} />)
    case EdgeServiceTypeEnum.MDNS_PROXY:
      return <MdnsDetails serviceData={serviceData} />
    default:
      return
  }
}