import { useIntl }                      from 'react-intl'
import { Path, useNavigate, useParams } from 'react-router-dom'

import { Button, Loader, PageHeader, showActionModal, Table, TableProps, Tooltip }                                                           from '@acx-ui/components'
import { useDeleteApSnmpPolicyMutation, useGetApSnmpViewModelQuery }                                                                         from '@acx-ui/rc/services'
import { ApSnmpViewModelData, getPolicyDetailsLink, getPolicyListRoutePath, getPolicyRoutePath, PolicyOperation, PolicyType, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                                                                                         from '@acx-ui/react-router-dom'

const defaultPayload = {
  searchString: '',
  fields: [ 'id', 'name', 'v2Agents', 'v3Agents', 'venues', 'aps', 'tags' ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25
}

export default function SnmpAgentTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()
  const tenantBasePath: Path = useTenantLink('')

  const tableQuery = useTableQuery({
    useQuery: useGetApSnmpViewModelQuery,
    defaultPayload
  })
  const [ deleteFn ] = useDeleteApSnmpPolicyMutation()
  const rowActions: TableProps<ApSnmpViewModelData>['rowActions'] = [
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
            deleteFn({ params: { tenantId, policyId: id } }).then(clearSelection)
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
            type: PolicyType.SNMP_AGENT,
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
            defaultMessage: 'SNMP Agent'
          })
        }
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) }
        ]}
        extra={[
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.CREATE })} key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add SNMP Agent' })}</Button>
          </TenantLink>
        ]}
      />
      <Loader states={[tableQuery]}>
        <Table<ApSnmpViewModelData>
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

  const columns: TableProps<ApSnmpViewModelData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.SNMP_AGENT,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'v2Agents',
      title: $t({ defaultMessage: 'SNMP v2' }),
      dataIndex: 'v2Agents',
      align: 'center',
      render: function (data, row) {
        const { count, names } = row.v2Agents || {}
        return (count)? <Tooltip title={names}>{count}</Tooltip> : 0
      }
    },
    {
      key: 'v3Agents',
      title: $t({ defaultMessage: 'SNMP v3' }),
      dataIndex: 'v3Agents',
      align: 'center',
      render: function (data, row) {
        const { count, names } = row.v3Agents || {}
        return (count)? <Tooltip title={names}>{count}</Tooltip> : 0
      }
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      align: 'center',
      render: function (data, row) {
        const { count, names } = row.venues || {}
        return (count)? <Tooltip title={names}>{count}</Tooltip> : 0
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      align: 'center',
      render: function (data, row) {
        const { count, names } = row.aps || {}
        return (count)? <Tooltip title={names}>{count}</Tooltip> : 0
      }
    }/*,
    {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      align: 'center',
      render: function (data, row) {
          return <>data.map(tag => <Button key={tag} type=link>{tag}</Button>)
      }
    }*/
  ]

  return columns
}
