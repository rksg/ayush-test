import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, GridRow, GridCol, Button, Tabs } from '@acx-ui/components'
import {
  useGetDHCPProfileQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { DHCPUsage }      from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { DEFAULT_GUEST_DHCP_NAME } from '../DHCPForm/DHCPForm'
import { PoolTable }               from '../DHCPForm/DHCPPool/PoolTable'

import DHCPInstancesTable from './DHCPInstancesTable'
import DHCPOverview       from './DHCPOverview'

export default function DHCPServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const { data } = useGetDHCPProfileQuery({ params })
  const venuesList = useVenuesListQuery({ params, payload: {
    fields: ['name', 'id'],
    filters: {
      id: data?.usage?.map((usage:DHCPUsage)=>usage.venueId)||['none']
    }
  } })

  return (
    <>
      <PageHeader
        title={data?.serviceName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'DHCP' }),
            link: getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.LIST })
          }
        ]}
        extra={filterByAccess([
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.DHCP,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId!
          })}>
            <Button key='configure'
              disabled={(venuesList.data && venuesList.data.data.length>0)
                || data?.serviceName === DEFAULT_GUEST_DHCP_NAME}
              type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
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
