import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import { hasAccesses }                                from '@acx-ui/user'
import {
  useApplicationPolicyListQuery, useDeleteAccessControlProfileMutation,
  useDevicePolicyListQuery, useGetAccessControlProfileListQuery,
  useL2AclPolicyListQuery,
  useL3AclPolicyListQuery,
  usePolicyListQuery
} from '@acx-ui/rc/services'
import {
  AccessControlInfoType,
  ApplicationPolicy, DevicePolicy,
  getPolicyDetailsLink, L2AclPolicy, L3AclPolicy,
  Policy,
  PolicyOperation,
  PolicyType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useTenantLink, useNavigate, useParams } from '@acx-ui/react-router-dom'

import ApplicationDrawer from '../AccessControlForm/ApplicationDrawer'
import DeviceOSDrawer    from '../AccessControlForm/DeviceOSDrawer'
import Layer2Drawer      from '../AccessControlForm/Layer2Drawer'
import Layer3Drawer      from '../AccessControlForm/Layer3Drawer'


const defaultPayload = {
  searchString: '',
  filters: {
    type: [PolicyType.ACCESS_CONTROL]
  },
  fields: [
    'id',
    'name',
    'type',
    'scope',
    'cog'
  ]
}

const listPayload = {
  fields: ['name', 'id'], sortField: 'name',
  sortOrder: 'ASC', page: 1, pageSize: 10000
}

const AccessControlSet = () => {
  const { $t } = useIntl()
  const tenantBasePath: Path = useTenantLink('')
  const navigate = useNavigate()
  const params = useParams()

  const tableQuery = useTableQuery({
    useQuery: usePolicyListQuery,
    defaultPayload
  })

  const [ delAccessControl ] = useDeleteAccessControlProfileMutation()

  const { data: accessControlList } = useGetAccessControlProfileListQuery({
    params: params
  })

  const { selectedLayer2 } = useL2AclPolicyListQuery({
    params: params,
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        selectedLayer2: data?.data ?? []
      }
    }
  })

  const { selectedLayer3 } = useL3AclPolicyListQuery({
    params: params,
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        selectedLayer3: data?.data ?? []
      }
    }
  })

  const { selectedDevicePolicy } = useDevicePolicyListQuery({
    params: params,
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        selectedDevicePolicy: data?.data ?? []
      }
    }
  })

  const { selectedApplicationPolicy } = useApplicationPolicyListQuery({
    params: params,
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        selectedApplicationPolicy: data?.data ?? []
      }
    }
  })

  const rowActions: TableProps<Policy>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id, scope }], clearSelection) => {
        if (scope !== 0) {
          showActionModal({
            type: 'error',
            content: $t({
              defaultMessage: 'This policy has been applied in network'
            })
          })
        } else {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Policy' }),
              entityValue: name
            },
            onOk: () => {
              delAccessControl({ params: { ...params, policyId: id } }).then(clearSelection)
            }
          })
        }
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.ACCESS_CONTROL,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    }
  ]

  return <Loader states={[tableQuery]}>
    <Table<Policy>
      columns={useColumns(
        accessControlList ?? [],
        selectedLayer2,
        selectedLayer3,
        selectedDevicePolicy,
        selectedApplicationPolicy
      )}
      dataSource={tableQuery?.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      rowKey='id'
      rowActions={hasAccesses(rowActions)}
      rowSelection={{ type: 'radio' }}
    />
  </Loader>
}

function useColumns (
  accessControlList: AccessControlInfoType[],
  selectedLayer2: L2AclPolicy[],
  selectedLayer3: L3AclPolicy[],
  selectedDevicePolicy: DevicePolicy[],
  selectedApplicationPolicy: ApplicationPolicy[]) {
  const { $t } = useIntl()


  const columns: TableProps<Policy>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      align: 'left',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.ACCESS_CONTROL,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'l2AclPolicy',
      title: $t({ defaultMessage: 'Layer 2' }),
      dataIndex: 'l2AclPolicy',
      align: 'left',
      sorter: true,
      render: function (data, row) {
        let aclPolicy = accessControlList.find(acl => acl.id === row.id)
        let l2AclPolicyName = selectedLayer2?.find(layer2 =>
          layer2.id === aclPolicy?.l2AclPolicy?.id)?.name
        return l2AclPolicyName
          ? <Layer2Drawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: aclPolicy?.l2AclPolicy?.id ?? '', viewText: l2AclPolicyName }}
          />
          : '-'
      }
    },
    {
      key: 'l3AclPolicy',
      title: $t({ defaultMessage: 'Layer 3' }),
      dataIndex: 'l3AclPolicy',
      align: 'left',
      sorter: true,
      render: function (data, row) {
        let aclPolicy = accessControlList.find(acl => acl.id === row.id)
        let l3AclPolicyName = selectedLayer3?.find(layer3 =>
          layer3.id === aclPolicy?.l3AclPolicy?.id)?.name
        return l3AclPolicyName
          ? <Layer3Drawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: aclPolicy?.l3AclPolicy?.id ?? '', viewText: l3AclPolicyName }}
          />
          : '-'
      }
    },
    {
      key: 'devicePolicy',
      title: $t({ defaultMessage: 'Device & OS' }),
      dataIndex: 'devicePolicy',
      align: 'left',
      sorter: true,
      render: function (data, row) {
        let aclPolicy = accessControlList.find(acl => acl.id === row.id)
        let devicePolicyName = selectedDevicePolicy?.find(device =>
          device.id === aclPolicy?.devicePolicy?.id
        )?.name
        return devicePolicyName
          ? <DeviceOSDrawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: aclPolicy?.devicePolicy?.id ?? '', viewText: devicePolicyName }}
          />
          : '-'
      }
    },
    {
      key: 'applicationPolicy',
      title: $t({ defaultMessage: 'Applications' }),
      dataIndex: 'applicationPolicy',
      align: 'left',
      sorter: true,
      render: function (data, row) {
        let aclPolicy = accessControlList.find(acl => acl.id === row.id)
        let applicationPolicyName = selectedApplicationPolicy?.find(application =>
          application.id === aclPolicy?.applicationPolicy?.id
        )?.name
        return applicationPolicyName
          ? <ApplicationDrawer
            isOnlyViewMode={true}
            onlyViewMode={{
              id: aclPolicy?.applicationPolicy?.id ?? '',
              viewText: applicationPolicyName
            }}
          />
          : '-'
      }
    },
    {
      key: 'clientRateLimit',
      title: $t({ defaultMessage: 'Client Rate Limit' }),
      dataIndex: 'clientRateLimit',
      align: 'left',
      sorter: true,
      render: function (data, row) {
        let aclPolicy = accessControlList.find(acl => acl.id === row.id)
        return <ClientRateLimitComponent aclPolicy={aclPolicy}/>
      }
    },
    {
      key: 'scope',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'scope',
      align: 'center',
      sorter: true
    }
  ]

  return columns
}

const ClientRateLimitComponent = (props: { aclPolicy: AccessControlInfoType | undefined }) => {
  const { $t } = useIntl()
  const { aclPolicy } = props
  const UNLIMITED = $t({ defaultMessage: 'Unlimited' })

  const clientRateLimit = aclPolicy?.rateLimiting
  const uplink = clientRateLimit?.hasOwnProperty('uplinkLimit') && clientRateLimit.uplinkLimit > 0
    ? $t({ defaultMessage: '{count} Mbps' }, {
      count: clientRateLimit?.uplinkLimit
    })
    : UNLIMITED
  // eslint-disable-next-line max-len
  const downlink = clientRateLimit?.hasOwnProperty('downlinkLimit') && clientRateLimit.downlinkLimit > 0
    ? $t({ defaultMessage: '{count} Mbps' }, {
      count: clientRateLimit?.downlinkLimit
    })
    : UNLIMITED

  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
    <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
      {$t({ defaultMessage: 'UP:  ' })}
    </div><div>{uplink}</div>
    <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
      {$t({ defaultMessage: 'DOWN:' })}
    </div><div>{downlink}</div>
  </div>
}


export default AccessControlSet
