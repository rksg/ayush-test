import { useState } from 'react'

import { Col, Row, Typography } from 'antd'
import { isNil }                from 'lodash'
import { useIntl }              from 'react-intl'

import { Card, SummaryCard } from '@acx-ui/components'
import {
  EdgeSdLanP2ActivatedNetworksTable,
  EdgeServiceStatusLight,
  SdLanTopologyDiagram,
  SpaceWrapper,
  isSdLanLastNetworkInVenue,
  showSdLanGuestFwdConflictModal,
  showSdLanVenueDissociateModal,
  useEdgeMvSdLanActions
} from '@acx-ui/rc/components'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  EdgeMvSdLanViewData,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation,
  NetworkTypeEnum,
  Network,
  hasServicePermission } from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

interface EdgeSdLanServiceProps {
  data: EdgeMvSdLanViewData;
}

const EdgeMvSdLan = ({ data }: EdgeSdLanServiceProps) => {
  const { venueId: sdLanVenueId }= useParams()
  const { $t } = useIntl()
  const {
    id: serviceId,
    name,
    edgeClusterId,
    edgeClusterName,
    isGuestTunnelEnabled,
    tunnelProfileId,
    tunnelProfileName,
    guestEdgeClusterId,
    guestEdgeClusterName,
    guestTunnelProfileId,
    guestTunnelProfileName,
    tunneledWlans,
    tunneledGuestWlans,
    edgeAlarmSummary
  } = data

  const [isActivateUpdating, setIsActivateUpdating] = useState<boolean>(false)
  const { toggleNetwork } = useEdgeMvSdLanActions()

  const infoFields = [{
    title: $t({ defaultMessage: 'Service Name' }),
    content: () => <TenantLink to={getServiceDetailsLink({
      type: ServiceType.EDGE_SD_LAN,
      oper: ServiceOperation.DETAIL,
      serviceId: serviceId!
    })}>
      {name}
    </TenantLink>
  }, {
    title: $t({ defaultMessage: 'Service Health' }),
    content: () => (
      <EdgeServiceStatusLight
        data={edgeAlarmSummary ? [edgeAlarmSummary] : []}
      />
    )
  }, {
    title: $t({ defaultMessage: 'Cluster' }),
    content: () => (
      <TenantLink to={`devices/edge/cluster/${edgeClusterId}/edit/cluster-details`}>
        {edgeClusterName}
      </TenantLink>)
  }, ...(isGuestTunnelEnabled ? [{
    title: $t({ defaultMessage: 'DMZ Cluster' }),
    content: () => (
      <TenantLink to={`devices/edge/cluster/${guestEdgeClusterId}/edit/cluster-details`}>
        {guestEdgeClusterName}
      </TenantLink>
    )
  }] : []),{
    title: $t({ defaultMessage: 'Tunnel Profile (AP- Cluster tunnel)' }),
    colSpan: 6,
    content: () => <TenantLink to={getPolicyDetailsLink({
      type: PolicyType.TUNNEL_PROFILE,
      oper: PolicyOperation.DETAIL,
      policyId: tunnelProfileId!
    })}>
      {tunnelProfileName}
    </TenantLink>
  }, ...(isGuestTunnelEnabled ? [{
    title: $t({ defaultMessage: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' }),
    colSpan: 6,
    content: () => (
      <TenantLink to={getPolicyDetailsLink({
        type: PolicyType.TUNNEL_PROFILE,
        oper: PolicyOperation.DETAIL,
        policyId: guestTunnelProfileId!
      })}>
        {guestTunnelProfileName}
      </TenantLink>
    )
  }] : [])]

  const handleActivateChange = async (
    fieldName: string,
    rowData: Network,
    checked: boolean
  ) => {
    const networkId = rowData.id!
    setIsActivateUpdating(true)

    const handleFinally = () => {
      setIsActivateUpdating(false)
    }

    // eslint-disable-next-line max-len
    if ((fieldName === 'activatedNetworks' && !checked) && isSdLanLastNetworkInVenue(tunneledWlans, sdLanVenueId)) {
      showSdLanVenueDissociateModal(async () => {
        await toggleNetwork(serviceId!, sdLanVenueId!, networkId, checked, false, handleFinally)
      }, handleFinally)
    } else {
      try {
      // network with vlan pooling enabled cannot be a SD-LAN guest network
        const isVlanPooling = !isNil(rowData.vlanPool)
        // eslint-disable-next-line max-len
        const isGuestNetworkAction = fieldName === 'activatedGuestNetworks' || (fieldName === 'activatedNetworks' && checked && !isVlanPooling)

        // eslint-disable-next-line max-len
        if ( isGuestTunnelEnabled && rowData.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL && isGuestNetworkAction) {
          const isFwdGuest = !(fieldName === 'activatedGuestNetworks' && !checked)

          showSdLanGuestFwdConflictModal({
            currentNetworkVenueId: sdLanVenueId!,
            currentNetworkId: networkId,
            currentNetworkName: rowData.name!,
            activatedGuest: checked,
            tunneledWlans,
            tunneledGuestWlans,
            onOk: async (impactVenueIds: string[]) => {

              if (impactVenueIds.length !== 0) {
              // eslint-disable-next-line max-len
                const actions = [toggleNetwork(serviceId!, sdLanVenueId!, networkId, true, isFwdGuest)]
                actions.push(...impactVenueIds.map(impactVenueId =>
                  toggleNetwork(serviceId!, impactVenueId, networkId, true, isFwdGuest)))
                await Promise.all(actions)

                handleFinally()
              } else {
              // eslint-disable-next-line max-len
                await toggleNetwork(serviceId!, sdLanVenueId!, networkId, true, isFwdGuest, handleFinally)
              }
            },
            onCancel: handleFinally
          })
        } else {
          await toggleNetwork(serviceId!, sdLanVenueId!, networkId, checked, false, handleFinally)
        }
      } catch(err) {
        handleFinally()
        // eslint-disable-next-line no-console
        console.error(err)
      }
    }
  }

  const getDisabledInfo = (_venueId: string,
    row: Network,
    isGuestSwitchBtn: boolean
  ) => {
    // eslint-disable-next-line max-len
    const hasEdgeUpdatePermission = hasServicePermission({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.EDIT })

    if (!hasEdgeUpdatePermission) {
      return {
        isDisabled: true,
        tooltip: $t({ defaultMessage: 'No permission on this' })
      }
    }

    const isSdLanLastNetwork = (tunneledWlans?.length ?? 0) <= 1
    if (!tunneledWlans || isGuestSwitchBtn || !isSdLanLastNetwork) return

    const isTheLastOne = tunneledWlans[0].networkId === row.id

    return {
      isDisabled: isTheLastOne,
      tooltip: isTheLastOne
        // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'Cannot deactivate the last network at this <venueSingular></venueSingular>' })
        : undefined
    }
  }

  return (
    <SpaceWrapper fullWidth direction='vertical' size={30}>
      <Card>
        <SdLanTopologyDiagram
          isGuestTunnelEnabled={!!isGuestTunnelEnabled}
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
            }, { value: isGuestTunnelEnabled })}
          </Typography.Text>
        </Col>
        <Col span={24}>
          <EdgeSdLanP2ActivatedNetworksTable
            columnsSetting={[{
              key: 'name',
              title: $t({ defaultMessage: 'Network' }),
              tooltip: undefined
            }]}
            venueId={sdLanVenueId!}
            isGuestTunnelEnabled={isGuestTunnelEnabled!}
            activated={tunneledWlans
              ?.filter(network => network.venueId === sdLanVenueId)
              .map(network => network.networkId)}
            activatedGuest={tunneledGuestWlans
              ?.filter(network => network.venueId === sdLanVenueId)
              .map(network => network.networkId)}
            disabled={getDisabledInfo}
            onActivateChange={handleActivateChange}
            isUpdating={isActivateUpdating}
          />
        </Col>
      </Row>
    </SpaceWrapper>
  )
}

export default EdgeMvSdLan