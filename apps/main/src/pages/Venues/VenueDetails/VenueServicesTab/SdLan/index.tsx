import { Col, Row, Space, Typography } from 'antd'
import { useIntl }                     from 'react-intl'

import { SummaryCard } from '@acx-ui/components'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  EdgeSdLanViewData,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { NetworkTable } from './NetworksTable'

interface EdgeSdLanServiceProps {
  data: EdgeSdLanViewData;
}

const EdgeSdLan = ({ data }: EdgeSdLanServiceProps) => {
  const { $t } = useIntl()
  const { id: serviceId } = data

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

  return (
    <Space direction='vertical' size={30}>
      <SummaryCard data={infoFields} />
      <Row>
        <Col span={24}>
          <Typography.Text strong>
            {$t({
              defaultMessage:
                // eslint-disable-next-line max-len
                'Networks running the SD-LAN on this venue:'
            })}
          </Typography.Text>
        </Col>
        <Col span={24}>
          <NetworkTable
            serviceId={serviceId!}
            activatedNetworkIds={data.networkIds}
          />
        </Col>
      </Row>
    </Space>
  )
}

export default EdgeSdLan
