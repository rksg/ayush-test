import { useState } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import { useIntl }                     from 'react-intl'

import { Card, SummaryCard }                                       from '@acx-ui/components'
import { EdgeSdLanP2ActivatedNetworksTable, SdLanTopologyDiagram } from '@acx-ui/rc/components'
import {
  useActivateEdgeSdLanNetworkMutation,
  useDeactivateEdgeSdLanNetworkMutation,
  useUpdateEdgeSdLanPartialP2Mutation
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
    updateEdgeSdLan,
    { isLoading: isUpdateRequesting }
  ] = useUpdateEdgeSdLanPartialP2Mutation()
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
      type: ServiceType.EDGE_SD_LAN_P2,
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
    content: () => <TenantLink to={`/devices/edge/${data.edgeId}/details/overview`}>
      {data.edgeName}
    </TenantLink>
  }, ...(data.isGuestTunnelEnabled ? [{
    title: $t({ defaultMessage: 'DMZ Cluster' }),
    content: () => (
      <TenantLink to={`/devices/edge/${data.guestEdgeId}/details/overview`}>
        {data.guestEdgeName}
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

  const toggleGuestNetwork = async (networkId: string, activate: boolean, cb?: () => void) => {
    if (activate) {
      await activateNetwork({
        params: {
          serviceId,
          wifiNetworkId: networkId
        },
        payload: {
          isGuestTunnelUtilized: true
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
    checked: boolean,
    activated: NetworkSaveData[]
  ) => {
    const networkId = rowData.id!
    const newNetworkIds = activated.map(item => item.id)
    const payload = {
      networkIds: newNetworkIds
    }
    setIsActivateUpdating(true)

    try {
      if (data.isGuestTunnelEnabled
      && rowData.type === NetworkTypeEnum.CAPTIVEPORTAL ) {
        if (fieldName === 'activatedNetworks'
        // eslint-disable-next-line max-len
        || (fieldName === 'activatedGuestNetworks' && checked && !data.networkIds.includes(networkId))) {

          let updateGuestNetwork = true
          // directly activated guest network should also activated network tunneled to DC edge
          if (fieldName === 'activatedGuestNetworks') {
            payload.networkIds = data.networkIds.concat(networkId)
          } else {
            // check diff on guestNetwork when toggle network
            if ((checked && data.guestNetworkIds.includes(networkId))
            || (!checked && !data.guestNetworkIds.includes(networkId))) {
              updateGuestNetwork = false
            }
          }

          //Activate network
          await updateEdgeSdLan({
            params: { serviceId },
            payload,
            callback: async () => {
              if (updateGuestNetwork) {
                // TODO: should be blocking after activity fixed
                // await toggleGuestNetwork(networkId, checked, () => {
                //   setIsActivateUpdating(false)
                // })
                await toggleGuestNetwork(networkId, checked)
              }

              setIsActivateUpdating(false)
            } }).unwrap()
        } else {
          // deactivate guest network
          // TODO: should be blocking after activity fixed
          // await toggleGuestNetwork(networkId, checked, () => {
          //   setIsActivateUpdating(false)
          // })
          await toggleGuestNetwork(networkId, checked)
          setIsActivateUpdating(false)
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
