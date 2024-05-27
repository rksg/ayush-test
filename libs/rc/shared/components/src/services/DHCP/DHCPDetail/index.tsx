import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, GridRow, GridCol, Tabs, Button } from '@acx-ui/components'
import {
  useGetDHCPProfileQuery,
  useGetDhcpTemplateQuery,
  useGetVenuesTemplateListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  DHCPSaveData,
  ServiceOperation,
  ServiceType,
  TableResult,
  useConfigTemplateQueryFnSwitcher,
  useServiceListBreadcrumb,
  Venue
} from '@acx-ui/rc/utils'
import { DHCPUsage }      from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { ServiceConfigTemplateLinkSwitcher } from '../../../configTemplates'
import { PoolTable }                         from '../DHCPForm'

import DHCPInstancesTable from './DHCPInstancesTable'
import DHCPOverview       from './DHCPOverview'

export function DHCPDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const breadcrumb = useServiceListBreadcrumb(ServiceType.DHCP)

  const { data } = useConfigTemplateQueryFnSwitcher<DHCPSaveData | null>({
    useQueryFn: useGetDHCPProfileQuery,
    useTemplateQueryFn: useGetDhcpTemplateQuery
  })
  const venuesList = useConfigTemplateQueryFnSwitcher<TableResult<Venue>>({
    useQueryFn: useVenuesListQuery,
    useTemplateQueryFn: useGetVenuesTemplateListQuery,
    skip: !data,
    payload: {
      fields: ['name', 'id'],
      filters: {
        id: data?.usage?.map((usage: DHCPUsage) => usage.venueId) || ['none']
      }
    }
  })

  return (
    <>
      <PageHeader
        title={data?.serviceName}
        breadcrumb={breadcrumb}
        extra={filterByAccess([
          <ServiceConfigTemplateLinkSwitcher
            type={ServiceType.DHCP}
            oper={ServiceOperation.EDIT}
            serviceId={params.serviceId!}
            children={
              <Button key='configure'
                disabled={(venuesList.data && venuesList.data.data.length > 0)}
                type='primary'
              >{$t({ defaultMessage: 'Configure' })}</Button>
            }
          />
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
