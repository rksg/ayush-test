import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, GridRow, GridCol, DisabledButton, Button, Tabs } from '@acx-ui/components'
import { ClockOutlined }                                              from '@acx-ui/icons'
import { useGetDHCPProfileQuery }                                     from '@acx-ui/rc/services'
import {
  getServiceDetailsLink,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { PoolTable } from '../DHCPForm/DHCPPool/PoolTable'

import DHCPInstancesTable from './DHCPInstancesTable'
import DHCPOverview       from './DHCPOverview'


export default function DHCPServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const { data } = useGetDHCPProfileQuery({ params })

  return (
    <>
      <PageHeader
        title={data?.serviceName}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'DHCP Services' }),
            link: getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.LIST })
          }
        ]}
        extra={[
          <DisabledButton key={'date-filter'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </DisabledButton>,
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.DHCP,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId!
          })}>
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Tabs defaultActiveKey={'OVERVIEW'}>
        <Tabs.TabPane key={'OVERVIEW'} tab={$t({ defaultMessage: 'Overview' })}>
          <GridRow>
            <GridCol col={{ span: 24 }}>
              <DHCPOverview poolNumber={data?.dhcpPools.length} configureType={data?.dhcpMode} />
            </GridCol>
            <GridCol col={{ span: 24 }}>
              <DHCPInstancesTable />
            </GridCol>
          </GridRow>
        </Tabs.TabPane>
        <Tabs.TabPane key={'DHCP_POOL'} tab={$t({ defaultMessage: 'DHCP Pool' })}>
          <GridRow>
            <GridCol col={{ span: 24 }}>
              <PoolTable data={data ? data.dhcpPools:[]} readonly={true}/>
            </GridCol>
          </GridRow>
        </Tabs.TabPane>
      </Tabs>


    </>
  )
}

