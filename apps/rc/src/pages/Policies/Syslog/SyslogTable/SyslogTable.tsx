import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import {
  useDelSyslogPolicyMutation,
  useSyslogPolicyListQuery,
  useGetVenuesQuery
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
import { filterByAccess }                                          from '@acx-ui/user'

import { facilityLabelMapping, flowLevelLabelMapping } from '../../contentsMap'


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
  const [ deleteFn ] = useDelSyslogPolicyMutation()

  const tableQuery = useTableQuery({
    useQuery: useSyslogPolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<SyslogPolicyListType>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: name
          },
          onOk: () => {
            deleteFn({ params: { ...params, policyId: id } }).then(clearSelection)
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
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
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Syslog Server' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<SyslogPolicyListType>
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
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
      sortOrder: 'ASC'
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
      render: function (data, row) {
        return row.primaryServer ?? '--'
      }
    },
    {
      key: 'secondaryServer',
      title: $t({ defaultMessage: 'Secondary Server' }),
      dataIndex: 'secondaryServer',
      render: function (data, row) {
        return row.secondaryServer ?? '--'
      }
    },
    {
      key: 'facility',
      title: $t({ defaultMessage: 'Event Facility' }),
      dataIndex: 'facility',
      render: function (data, row) {
        return row.facility ? $t(facilityLabelMapping[row.facility as FacilityEnum]) : '--'
      }
    },
    {
      key: 'flowLevel',
      title: $t({ defaultMessage: 'Send Logs' }),
      dataIndex: 'flowLevel',
      render: function (data, row) {
        return row.flowLevel ? $t(flowLevelLabelMapping[row.flowLevel as FlowLevelEnum]) : '--'
      }
    },
    {
      key: 'venueIds',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueIds',
      filterable: venueNameMap,
      render: function (data, row) {
        return row.venueIds?.length ?? '--'
      }
    }
  ]

  return columns
}
