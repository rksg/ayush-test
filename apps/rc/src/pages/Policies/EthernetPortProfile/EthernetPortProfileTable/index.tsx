
import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import {
  useDeleteEthernetPortProfileMutation,
  useGetAAAPolicyViewModelListQuery,
  useGetEthernetPortProfileViewDataListQuery }                     from '@acx-ui/rc/services'
import {
  AAAViewModalType,
  EthernetPortProfileViewData,
  getEthernetPortAuthTypeString,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  KeyValue,
  PolicyOperation,
  PolicyType,
  useTableQuery
}                                                                  from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { WifiScopes }                                              from '@acx-ui/types'
import { filterByAccess, hasPermission }                           from '@acx-ui/user'


const EthernetPortProfileTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const defaultEthernetPortProfileTablePayload = {}
  const emptyResult: KeyValue<string, string>[] = []
  const basePath: Path = useTenantLink('')
  const navigate = useNavigate()
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const tableQuery = useTableQuery({
    useQuery: useGetEthernetPortProfileViewDataListQuery,
    defaultPayload: defaultEthernetPortProfileTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name', 'venue']
    }
  })
  // eslint-disable-next-line max-len
  const { radiusNameMap }: { radiusNameMap: KeyValue<string, string>[] } = useGetAAAPolicyViewModelListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10000
    },
    enableRbac: enableServicePolicyRbac
  }, {
    selectFromResult: ({ data }: { data?: { data: AAAViewModalType[] } }) => ({
      radiusNameMap: data?.data
        ? data.data.map(radius => ({ key: radius.id!, value: radius.name }))
        : emptyResult
    })
  })

  const [deleteEthernetPortProfile] = useDeleteEthernetPortProfileMutation()

  const columns: TableProps<EthernetPortProfileViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        return (
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.ETHERNET_PORT_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: row.id
          })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'VLAN Untag' }),
      key: 'untagId',
      dataIndex: 'untagId',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'VLAN Members' }),
      key: 'vlanMembers',
      dataIndex: 'vlanMembers',
      sorter: true
    },
    {
      title: $t({ defaultMessage: '802.1X' }),
      key: 'authType',
      dataIndex: 'authType',
      sorter: true,
      render: (_, { authType }) => {
        const authTypeString = getEthernetPortAuthTypeString(authType)
        return (authTypeString)? 'ON (' + authTypeString + ')' : 'OFF'
      }
    },
    {
      title: $t({ defaultMessage: 'Auth Service' }),
      key: 'authRadiusId',
      dataIndex: 'authRadiusId',
      sorter: false,
      render: (_, { authRadiusId }) => {
        return (!authRadiusId)
          ? ''
          : (
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: authRadiusId })}>
              {radiusNameMap.find(radius => radius.key === authRadiusId)?.value || ''}
            </TenantLink>)
      }
    },
    {
      title: $t({ defaultMessage: 'Accounting Service' }),
      key: 'accountingRadiusId',
      dataIndex: 'accountingRadiusId',
      sorter: false,
      render: (_, { accountingRadiusId }) => {
        return (!accountingRadiusId)
          ? ''
          : (
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: accountingRadiusId })}>
              {radiusNameMap.find(radius => radius.key === accountingRadiusId)?.value || ''}
            </TenantLink>)
      }
    }
  ]

  const rowActions: TableProps<EthernetPortProfileViewData>['rowActions'] = [
    {
      scopeKey: [WifiScopes.UPDATE],
      // Default Ethernet Port Profile cannot Edit
      visible: (selectedRows) => selectedRows.length === 1
            && !selectedRows[0].isDefault,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.ETHERNET_PORT_PROFILE,
            oper: PolicyOperation.EDIT,
            policyId: selectedRows[0].id
          })
        })
      }
    },
    {
      scopeKey: [WifiScopes.DELETE],
      // Default Ethernet Port Profile cannot Delete
      visible: (selectedRows) => {
        return !selectedRows.some(row => row.isDefault)
      },
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteEthernetPortProfile({ params: { id: row.id } })))
              .then(clearSelection)
          }
        })
      }
    }
  ]

  const isSelectionVisible = hasPermission({
    scopes: [WifiScopes.UPDATE, WifiScopes.DELETE]
  })

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Ethernet Port Profile ({count})' },
            { count: tableQuery.data?.totalCount }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}

        extra={filterByAccess([<TenantLink scopeKey={[WifiScopes.CREATE]}
          // eslint-disable-next-line max-len
          to={getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE , oper: PolicyOperation.CREATE })}
        >
          <Button type='primary'>{$t({ defaultMessage: 'Add Ethernet Port Profile' })}</Button>
        </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table
          rowKey='id'
          columns={columns}
          rowActions={filterByAccess(rowActions)}
          rowSelection={isSelectionVisible && { type: 'checkbox' }}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

export default EthernetPortProfileTable