import { useState } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import _                               from 'lodash'
import { useIntl }                     from 'react-intl'

import { SummaryCard }                                                                                                   from '@acx-ui/components'
import { ActivatedNetworksTableP2Props, EdgeSdLanP2ActivatedNetworksTable, SdLanTopologyDiagram }                        from '@acx-ui/rc/components'
import { useActivateEdgeSdLanNetworkMutation, useDeactivateEdgeSdLanNetworkMutation, useUpdateEdgeSdLanPartialMutation } from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  EdgeSdLanViewDataP2,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation,
  NetworkSaveData,
  NetworkTypeEnum
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

// type NetworksTableProps = Omit<ActivatedNetworksTableP2Props, 'activated' | 'activatedGuest'> & {
//   isGuestTunnelEnabled: boolean,
//   data?: EdgeSdLanActivatedNetwork[],
//   guestData?: EdgeSdLanActivatedNetwork[]
// }

// const NetworksTable = (props: NetworksTableProps) => {
//   const { data, guestData, ...others } = props

//   return <EdgeSdLanP2ActivatedNetworksTable
//     {...others}
//     activated={data?.map(i => i.id!) ?? []}
//     activatedGuest={guestData?.map(i => i.id!) ?? []}
//   />
// }


interface EdgeSdLanServiceProps {
  data: EdgeSdLanViewDataP2;
}

const EdgeSdLanP2 = ({ data }: EdgeSdLanServiceProps) => {
  const { $t } = useIntl()
  const { id: serviceId } = data
  const [isActivateUpdating, setIsActivateUpdating] = useState<boolean>(false)
  const [
    updateEdgeSdLan,
    { isLoading: isUpdateRequesting }
  ] = useUpdateEdgeSdLanPartialMutation()
  const [
    activateNetwork,
    { isLoading: isActivateRequesting }
  ] = useActivateEdgeSdLanNetworkMutation()
  const [
    deactivateNetwork,
    { isLoading: isDeactivateRequesting }
  ] = useDeactivateEdgeSdLanNetworkMutation()


  const infoFields = [{
    title: $t({ defaultMessage: 'Service Name' }),
    content: () => <TenantLink to={getServiceDetailsLink({
      type: ServiceType.EDGE_SD_LAN,
      oper: ServiceOperation.DETAIL,
      serviceId: serviceId!
    })}>
      {data.name}
    </TenantLink>
  }, {
    title: $t({ defaultMessage: 'Venue' }),
    content: () => <TenantLink to={`/venues/${data.venueId}/venue-details/overview`}>
      {data.venueName}
    </TenantLink>
  }, {
    title: $t({ defaultMessage: 'SmartEdge' }),
    content: () => <TenantLink to={`/devices/edge/${data.edgeId}/details/overview`}>
      {data.edgeName}
    </TenantLink>
  }, {
    title: $t({ defaultMessage: 'Tunnel Profile' }),
    content: () => <TenantLink to={getPolicyDetailsLink({
      type: PolicyType.TUNNEL_PROFILE,
      oper: PolicyOperation.DETAIL,
      policyId: data.tunnelProfileId!
    })}>
      {data.tunnelProfileName}
    </TenantLink>
  }]

  const toggleGuestNetwork = async (networkId: string, activate: boolean) => {
    if (activate) {
      await activateNetwork({
        params: {
          serviceId,
          wifiNetworkId: networkId
        },
        payload: {
          isGuestTunnelUtilized: true
        }
      }).unwrap()
    } else {
      await deactivateNetwork({ params: {
        serviceId,
        wifiNetworkId: networkId
      } }).unwrap()
    }
  }

  const handleActivateChange = async (
    fieldName: string,
    rowData: NetworkSaveData,
    checked: boolean,
    activated: NetworkSaveData[]
  ) => {
    const networkId = rowData.id!
    const newNetworkIds = activated.map(item => item.id)
    const payload = {
      networkIds: newNetworkIds
    }

    try {
      if (data.isGuestTunnelEnabled
      && rowData.type === NetworkTypeEnum.CAPTIVEPORTAL ) {
        if (fieldName === 'activatedNetworks') {
          await updateEdgeSdLan({
            params: { serviceId },
            payload,
            callback: async () => {
              await toggleGuestNetwork(networkId, checked)
              setIsActivateUpdating(false)
            } }).unwrap()
        }
      } else {
        await updateEdgeSdLan({
          params: { serviceId },
          payload,
          callback: () => {
            setIsActivateUpdating(false)
          } }).unwrap()
      }
    } catch(err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }

  return (
    <Space direction='vertical' size={30}>
      <SummaryCard data={infoFields} />
      <SdLanTopologyDiagram
        isGuestTunnelEnabled={data.isGuestTunnelEnabled}
        vertical={false}
      />
      <Row>
        <Col span={24}>
          <Typography.Text strong>
            {$t({
              defaultMessage: 'Networks that will tunnel the traffic to the clusters:'
            })}
          </Typography.Text>
        </Col>
        <Col span={24}>
          <EdgeSdLanP2ActivatedNetworksTable
            venueId={data.venueId}
            isGuestTunnelEnabled={data.isGuestTunnelEnabled}
            activated={data.networkIds}
            activatedGuest={data.guestNetworkIds}
            onActivateChange={handleActivateChange}
            isUpdating={isActivateUpdating
              || isUpdateRequesting
              || isActivateRequesting
              || isDeactivateRequesting}
          />
        </Col>
      </Row>
    </Space>
  )
}

export default EdgeSdLanP2
