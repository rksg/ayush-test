import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                                                                                 from '@acx-ui/components'
import { EdgeService, EdgeServiceTypeEnum, ServiceOperation, ServiceType, getServiceDetailsLink } from '@acx-ui/rc/utils'
import { TenantLink }                                                                             from '@acx-ui/react-router-dom'


import { getEdgeServiceTypeString } from '../utils'

import { DhcpDetails }     from './DhcpDetails'
import { FirewallDetails } from './FirewallDetails'

interface ServiceDetailDrawerProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  serviceData: EdgeService
}

const drawerWidthMap = {
  [EdgeServiceTypeEnum.DHCP]: 500,
  [EdgeServiceTypeEnum.FIREWALL]: '60%',
  [EdgeServiceTypeEnum.NETWORK_SEGMENTATION]: '55%'
}

export const ServiceDetailDrawer = (props: ServiceDetailDrawerProps) => {
  const { visible, setVisible, serviceData } = props
  const { $t } = useIntl()

  const onClose = () => {
    setVisible(false)
  }

  const drawerContent =(
    <Form
      labelCol={{ span: 8 }}
      labelAlign='left'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Service Name' })}
        children={
          <TenantLink
            to={getServiceDetailUrl(
              serviceData.serviceType,
              serviceData.serviceId
            )}>
            {serviceData.serviceName}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Service Type' })}
        children={getEdgeServiceTypeString($t, serviceData.serviceType)}
      />
      {getContentByType(serviceData)}
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

const getServiceDetailUrl = (serviceType: EdgeServiceTypeEnum, servieId: string) => {
  switch(serviceType) {
    case EdgeServiceTypeEnum.DHCP:
      return getServiceDetailsLink({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.DETAIL,
        serviceId: servieId
      })
    case EdgeServiceTypeEnum.FIREWALL:
      return getServiceDetailsLink({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.DETAIL,
        serviceId: servieId
      })
    case EdgeServiceTypeEnum.NETWORK_SEGMENTATION:
      return getServiceDetailsLink({
        type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.DETAIL,
        serviceId: servieId
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
      return <>Nsg Details</>
    default:
      return <></>
  }
}