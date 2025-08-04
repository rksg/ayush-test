import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Card, SummaryCard, SpaceWrapper } from '@acx-ui/components'
import { Features }          from '@acx-ui/feature-toggle'
import {
  EdgeServiceStatusLight,
  SdLanTopologyDiagram
} from '@acx-ui/rc/components'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  EdgeMvSdLanViewData,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation,
  useIsEdgeFeatureReady } from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { NetworkTable } from './NetworkTable'

interface EdgeSdLanServiceProps {
  data: EdgeMvSdLanViewData;
}

const EdgeMvSdLan = ({ data }: EdgeSdLanServiceProps) => {
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
    edgeAlarmSummary
  } = data
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

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
    title: isEdgeL2greReady ?
      $t({ defaultMessage: 'Destination RUCKUS Edge cluster' }) :
      $t({ defaultMessage: 'Cluster' }),
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
    title: isEdgeL2greReady ?
      $t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' }) :
      $t({ defaultMessage: 'Tunnel Profile (AP- Cluster tunnel)' }),
    colSpan: 6,
    content: () => <TenantLink to={getPolicyDetailsLink({
      type: PolicyType.TUNNEL_PROFILE,
      oper: PolicyOperation.DETAIL,
      policyId: tunnelProfileId!
    })}>
      {tunnelProfileName}
    </TenantLink>
  }, ...(isGuestTunnelEnabled ? [{
    title: isEdgeL2greReady ?
      $t({ defaultMessage: 'Tunnel Profile (Cluster to DMZ)' }) :
      $t({ defaultMessage: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' }),
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


  return (
    <SpaceWrapper fullWidth direction='vertical' size={30}>
      {
        !isEdgeL2greReady &&
        <Card>
          <SdLanTopologyDiagram
            isGuestTunnelEnabled={!!isGuestTunnelEnabled}
            vertical={false}
          />
        </Card>
      }
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
          <NetworkTable data={data} />
        </Col>
      </Row>
    </SpaceWrapper>
  )
}

export default EdgeMvSdLan
