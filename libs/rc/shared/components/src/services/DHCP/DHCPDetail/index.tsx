import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, GridRow, GridCol, Tabs, Button, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import {
  useGetDHCPProfileQuery,
  useGetDhcpTemplateQuery,
  useGetVenuesTemplateListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  DHCPSaveData,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  useTemplateAwareServiceAllowedOperation,
  ServiceOperation,
  ServiceType,
  TableResult,
  useConfigTemplateQueryFnSwitcher,
  useServiceListBreadcrumb,
  Venue
} from '@acx-ui/rc/utils'
import { DHCPUsage } from '@acx-ui/rc/utils'

import { ServiceConfigTemplateLinkSwitcher } from '../../../configTemplates'
import { PoolTable }                         from '../DHCPForm'

import DHCPInstancesTable from './DHCPInstancesTable'
import DHCPOverview       from './DHCPOverview'

export function DHCPDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const breadcrumb = useServiceListBreadcrumb(ServiceType.DHCP)

  const { data, isFetching } = useConfigTemplateQueryFnSwitcher<DHCPSaveData | null>({
    useQueryFn: useGetDHCPProfileQuery,
    useTemplateQueryFn: useGetDhcpTemplateQuery,
    enableRbac: useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE),
    payload: { needUsage: true }
  })
  // eslint-disable-next-line max-len
  const { data: venuesList, isFetching: isVenueFetching } = useConfigTemplateQueryFnSwitcher<TableResult<Venue>>({
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
    <Loader states={[ {
      isFetching: isFetching || isVenueFetching,
      isLoading: false
    } ]}>
      <PageHeader
        title={data?.serviceName}
        breadcrumb={breadcrumb}
        extra={filterByAccessForServicePolicyMutation([
          <ServiceConfigTemplateLinkSwitcher
            // eslint-disable-next-line max-len
            rbacOpsIds={useTemplateAwareServiceAllowedOperation(ServiceType.DHCP, ServiceOperation.EDIT)}
            scopeKey={getScopeKeyByService(ServiceType.DHCP, ServiceOperation.EDIT)}
            type={ServiceType.DHCP}
            oper={ServiceOperation.EDIT}
            serviceId={params.serviceId!}
            children={
              <Button key='configure'
                disabled={
                  isVenueFetching || isFetching || (venuesList && venuesList.data.length > 0)}
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
              {// eslint-disable-next-line max-len
                <PoolTable data={data ? data.dhcpPools:[]} configureType={data?.dhcpMode} readonly={true}/>}
            </GridCol>
          </GridRow>
        </Tabs.TabPane>
      </Tabs>
    </Loader>
  )
}
