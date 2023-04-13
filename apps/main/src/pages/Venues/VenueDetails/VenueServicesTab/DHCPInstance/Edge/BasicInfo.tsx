import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow }                                                      from '@acx-ui/components'
import { DhcpStats, EdgeStatus, getServiceDetailsLink, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { TenantLink }                                                                  from '@acx-ui/react-router-dom'

interface EdgeDhcpBasicInfoProps {
  edgeData?: EdgeStatus
  dhcpData?: DhcpStats
}

export const EdgeDhcpBasicInfo = ({ edgeData, dhcpData }: EdgeDhcpBasicInfoProps) => {

  const { $t } = useIntl()

  const colSpan = 3

  return(
    <Card type='solid-bg'>
      <GridRow justify='space-between'>
        <GridCol col={{ span: colSpan }}>
          <Card.Title>
            {$t({ defaultMessage: 'Service Name' })}
          </Card.Title>
          {
            dhcpData &&
              <TenantLink
                to={getServiceDetailsLink({
                  type: ServiceType.EDGE_DHCP,
                  oper: ServiceOperation.DETAIL,
                  serviceId: dhcpData?.id!
                })}>
                {dhcpData?.serviceName}
              </TenantLink>
          }
        </GridCol>
        <GridCol col={{ span: colSpan }}>
          <Card.Title>
            {$t({ defaultMessage: 'Service Health' })}
          </Card.Title>
        </GridCol>
        <GridCol col={{ span: colSpan }}>
          <Card.Title>
            {$t({ defaultMessage: 'DHCP Relay' })}
          </Card.Title>
          {
            dhcpData?.dhcpRelay === 'true' ?
              $t({ defaultMessage: 'ON' }) :
              $t({ defaultMessage: 'OFF' })
          }
        </GridCol>
        <GridCol col={{ span: colSpan }}>
          <Card.Title>
            {$t({ defaultMessage: 'DHCP Pools' })}
          </Card.Title>
          {dhcpData?.dhcpPoolNum}
        </GridCol>
        <GridCol col={{ span: colSpan }}>
          <Card.Title>
            {$t({ defaultMessage: 'Lease Time' })}
          </Card.Title>
          {dhcpData?.leaseTime}
        </GridCol>
        <GridCol col={{ span: colSpan }}>
          <Card.Title>
            {$t({ defaultMessage: 'Smart Edge' })}
          </Card.Title>
          {<TenantLink to={`/devices/edge/${edgeData?.serialNumber}/edge-details/overview`}>
            {edgeData?.name}
          </TenantLink>}
        </GridCol>
      </GridRow>
    </Card>
  )
}