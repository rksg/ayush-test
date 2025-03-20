import { useIntl } from 'react-intl'

import { Button, Card, GridCol, GridRow, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { useGetAccessControlOverviewQuery }                                      from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyAllowedOperation,
  PolicyType,
  PolicyOperation,
  useTableQuery,
  MacAclOverview
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }                    from '@acx-ui/react-router-dom'
import { SwitchScopes }                             from '@acx-ui/types'
import { filterByAccess, hasCrossVenuesPermission } from '@acx-ui/user'

export default function AccessControlOverview () {
  const { $t } = useIntl()
  const params = useParams()

  const accessControlRoute = getPolicyListRoutePath(true) + '/accessControl/switch'
  const settingsId = 'switch-access-control-overview'

  const defaultPayload = {
    fields: [ 'id', 'name', 'port' ],
    pagination: { settingsId }
  }

  // const { venueFilterOptions } = useVenuesListQuery({
  //   payload: {
  //     fields: ['name', 'country', 'latitude', 'longitude', 'id'],
  //     pageSize: 10000,
  //     sortField: 'name',
  //     sortOrder: 'ASC'
  //   }
  // }, {
  //   selectFromResult: ({ data }) => ({
  //     venueFilterOptions: data?.data
  //       .map(v => ({ key: v.id, value: v.name }))
  //       .sort((a, b) => a.value.localeCompare(b.value)) || true
  //   })
  // })

  const tableQuery = useTableQuery<MacAclOverview>({
    useQuery: useGetAccessControlOverviewQuery,
    defaultPayload,
    search: {
      searchString: '',
      searchTargetFields: ['name']
    }
  })

  function useColumns () {
    const { $t } = useIntl()
    const columns: TableProps<MacAclOverview>['columns'] = [
      {
        key: 'switchName',
        title: $t({ defaultMessage: 'Switch' }),
        dataIndex: 'switchName',
        searchable: true,
        sorter: true,
        render: function (_, row, __, highlightFn) {
          return (
            <TenantLink
              to={`/devices/switch/${row.switchId}/${row.serialNumber}/details/overview`}
              style={{ lineHeight: '20px' }}
            >
              {highlightFn(row.switchName)}
            </TenantLink>
          )
        }
      },
      {
        key: 'model',
        title: $t({ defaultMessage: 'Model' }),
        dataIndex: 'model',
        filterable: true,
        sorter: true,
        render: function (_, row) {
          return row.model?.replace('_', '-')
        }
      },
      {
        key: 'port',
        title: $t({ defaultMessage: 'Ports' }),
        dataIndex: 'port'
      },
      {
        key: 'venueName',
        title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
        dataIndex: 'venueName',
        filterKey: 'venueId',
        sorter: true,
        render: function (_, row) {
          return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}</TenantLink>
        }
      }
    ]
    return columns
  }


  const getConfigureButton = () => {
    return (
      <TenantLink
        scopeKey={[SwitchScopes.UPDATE]}
        rbacOpsIds={getPolicyAllowedOperation(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.EDIT)}
        to={`/policies/accessControl/switch/${params.accessControlId}/edit`}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
      </TenantLink>
    )
  }

  return (
    <>
      <PageHeader
        title={''}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Access Control' }),
            link: accessControlRoute
          }
        ]}

        extra={hasCrossVenuesPermission() && filterByAccess([getConfigureButton()])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Card>
            <Card.Title style={{ marginTop: '16px', marginBottom: '16px' }}>
              {$t({ defaultMessage: 'Instances({count})' },
                { count: tableQuery.data?.data?.length })}</Card.Title>
            <Loader states={[tableQuery]}>
              <Table<MacAclOverview>
                settingsId={settingsId}
                columns={useColumns()}
                dataSource={tableQuery.data?.data}
                pagination={tableQuery.pagination}
                onChange={tableQuery.handleTableChange}
                rowKey='switchId'
                onFilterChange={tableQuery.handleFilterChange}
              />
            </Loader>
          </Card>
        </GridCol>
      </GridRow>
    </>
  )
}
