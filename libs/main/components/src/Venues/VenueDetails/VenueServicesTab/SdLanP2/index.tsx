import { useState } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import { useIntl }                     from 'react-intl'

import { Card, SummaryCard }                                       from '@acx-ui/components'
import { EdgeSdLanP2ActivatedNetworksTable, SdLanTopologyDiagram } from '@acx-ui/rc/components'
import {
  useActivateEdgeSdLanNetworkMutation,
  useDeactivateEdgeSdLanNetworkMutation
} from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  EdgeSdLanViewDataP2,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation,
  NetworkSaveData,
  NetworkTypeEnum } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

interface EdgeSdLanServiceProps {
  data: EdgeSdLanViewDataP2;
}

const EdgeSdLanP2 = ({ data }: EdgeSdLanServiceProps) => {
  const { $t } = useIntl()
  const { id: serviceId } = data
  const [isActivateUpdating, setIsActivateUpdating] = useState<boolean>(false)
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
    title: $t({ defaultMessage: 'Cluster' }),
    content: () => <TenantLink to={`/devices/edge/${data.clusterId}/details/overview`}>
      {data.clusterName}
    </TenantLink>
  }, ...(data.isGuestTunnelEnabled ? [{
    title: $t({ defaultMessage: 'DMZ Cluster' }),
    content: () => (
      <TenantLink to={`/devices/edge/${data.guestClusterId}/details/overview`}>
        {data.guestClusterName}
      </TenantLink>
    )
  }] : []),{
    title: $t({ defaultMessage: 'Tunnel Profile (AP- Cluster tunnel)' }),
    colSpan: 6,
    content: () => <TenantLink to={getPolicyDetailsLink({
      type: PolicyType.TUNNEL_PROFILE,
      oper: PolicyOperation.DETAIL,
      policyId: data.tunnelProfileId!
    })}>
      {data.tunnelProfileName}
    </TenantLink>
  }, ...(data.isGuestTunnelEnabled ? [{
    title: $t({ defaultMessage: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' }),
    colSpan: 6,
    content: () => (
      <TenantLink to={getPolicyDetailsLink({
        type: PolicyType.TUNNEL_PROFILE,
        oper: PolicyOperation.DETAIL,
        policyId: data.guestTunnelProfileId!
      })}>
        {data.guestTunnelProfileName}
      </TenantLink>
    )
  }] : [])]

  const toggleNetwork = async (
    isGuest: boolean,
    networkId: string,
    activate: boolean,
    cb?: () => void) => {
    // - activate network/guestNetwork
    // - deactivate guestNetwork
    if (activate || (!activate && isGuest)) {
      await activateNetwork({
        params: {
          serviceId,
          wifiNetworkId: networkId
        },
        payload: {
          isGuestTunnelUtilized: activate
        },
        callback: cb
      }).unwrap()
    } else {
      await deactivateNetwork({ params: {
        serviceId,
        wifiNetworkId: networkId
      }, callback: cb }).unwrap()
    }
  }

  const handleActivateChange = async (
    fieldName: string,
    rowData: NetworkSaveData,
    checked: boolean
  ) => {
    const networkId = rowData.id!
    setIsActivateUpdating(true)

    try {
      if (data.isGuestTunnelEnabled
      && rowData.type === NetworkTypeEnum.CAPTIVEPORTAL ) {
        const isGuestNetwork = fieldName === 'activatedGuestNetworks'
        await toggleNetwork(isGuestNetwork, networkId, checked)
      } else {
        await toggleNetwork(false, networkId, checked)
      }

      setIsActivateUpdating(false)
    } catch(err) {
      setIsActivateUpdating(false)
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }

  return (
    <Space direction='vertical' size={30}>
      <Card>
        <SdLanTopologyDiagram
          isGuestTunnelEnabled={data.isGuestTunnelEnabled}
          vertical={false}
        />
      </Card>
      <SummaryCard data={infoFields} />
      <Row>
        <Col span={24}>
          <Typography.Text strong>
            {$t({
              // eslint-disable-next-line max-len
              defaultMessage: 'Networks that will tunnel the traffic to the {value, select, true {clusters} other {cluster}}:'
            }, { value: data.isGuestTunnelEnabled })}
          </Typography.Text>
        </Col>
        <Col span={24}>
          <EdgeSdLanP2ActivatedNetworksTable
            columnsSetting={[{
              key: 'name',
              title: $t({ defaultMessage: 'Network' }),
              tooltip: undefined
            }]}
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
