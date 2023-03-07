import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useDelSyslogPolicyMutation, useSyslogPolicyListQuery }           from '@acx-ui/rc/services'
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
        extra={[
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.CREATE })} key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add Syslog Server' })}</Button>
          </TenantLink>
        ]}
      />
      <Loader states={[tableQuery]}>
        <Table<SyslogPolicyListType>
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<SyslogPolicyListType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
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
      render: function (data, row) {
        return row.venueIds?.length ?? '--'
      }
    }
  ]

  return columns
}
