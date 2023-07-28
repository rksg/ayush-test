import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { SimpleListTooltip }                             from '@acx-ui/rc/components'
import {
  useDelSyslogPoliciesMutation,
  useSyslogPolicyListQuery,
  useGetVenuesQuery, doProfileDelete
} from '@acx-ui/rc/services'
import {
  FacilityEnum,
  FlowLevelEnum,
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  SyslogPolicyListType,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                               from '@acx-ui/user'

import { facilityLabelMapping, flowLevelLabelMapping } from '../../contentsMap'
import { PROFILE_MAX_COUNT }                           from '../constants'

const defaultPayload = {
  fields: [
    'id',
    'name',
    'venueIds',
    'primaryServer',
    'secondaryServer',
    'flowLevel',
    'facility'
  ],
  searchString: '',
  filters: {},
  sortField: 'name',
  sortOrder: 'ASC'
}

export default function SyslogTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDelSyslogPoliciesMutation()

  const tableQuery = useTableQuery({
    useQuery: useSyslogPolicyListQuery,
    defaultPayload
  })

  const doDelete = (selectedRows: SyslogPolicyListType[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Policy' }),
      selectedRows[0].name,
      [{ fieldName: 'venueIds', fieldText: $t({ defaultMessage: 'Venue' }) }],
      async () => deleteFn({ params, payload: selectedRows.map(row => row.id) }).then(callback)
    )
  }

  const rowActions: TableProps<SyslogPolicyListType>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        doDelete(rows, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedItems => selectedItems.length === 1),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.SYSLOG,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          $t({
            defaultMessage: 'Syslog Server'
          })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.CREATE })}>
            <Button type='primary' disabled={tableQuery.data?.totalCount! >= PROFILE_MAX_COUNT}>
              {$t({ defaultMessage: 'Add Syslog Server' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<SyslogPolicyListType>
          settingsId='policies-syslog-table'
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'checkbox' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const params = useParams()
  const emptyVenues: { key: string, value: string }[] = []
  const { venueNameMap } = useGetVenuesQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueNameMap: data?.data
        ? data.data.map(venue => ({ key: venue.id, value: venue.name }))
        : emptyVenues
    })
  })

  const columns: TableProps<SyslogPolicyListType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.SYSLOG,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'primaryServer',
      title: $t({ defaultMessage: 'Primary Server' }),
      dataIndex: 'primaryServer',
      sorter: true,
      render: function (data, row) {
        return row.primaryServer ?? '--'
      }
    },
    {
      key: 'secondaryServer',
      title: $t({ defaultMessage: 'Secondary Server' }),
      dataIndex: 'secondaryServer',
      sorter: true,
      render: function (data, row) {
        return row.secondaryServer && row.secondaryServer.length > 0 ? row.secondaryServer : '--'
      }
    },
    {
      key: 'facility',
      title: $t({ defaultMessage: 'Event Facility' }),
      dataIndex: 'facility',
      sorter: true,
      render: function (data, row) {
        return row.facility ? $t(facilityLabelMapping[row.facility as FacilityEnum]) : '--'
      }
    },
    {
      key: 'flowLevel',
      title: $t({ defaultMessage: 'Send Logs' }),
      dataIndex: 'flowLevel',
      sorter: true,
      render: function (data, row) {
        return row.flowLevel ? $t(flowLevelLabelMapping[row.flowLevel as FlowLevelEnum]) : '--'
      }
    },
    {
      key: 'venueIds',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueIds',
      filterable: venueNameMap,
      sorter: true,
      render: function (data, row) {
        if (!row.venueIds || row.venueIds.length === 0) return 0

        // eslint-disable-next-line max-len
        const tooltipItems = venueNameMap.filter(v => row.venueIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={row.venueIds.length} />
      }
    }
  ]

  return columns
}
