import React, { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  ColumnType,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  doProfileDelete,
  useDeleteAccessControlProfilesMutation,
  useGetEnhancedAccessControlProfileListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  AclOptionType,
  EnhancedAccessControlInfoType, filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink, getScopeKeyByPolicy, Network,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  WifiNetwork
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useTenantLink, useNavigate, useParams } from '@acx-ui/react-router-dom'
import { getUserProfile, isCoreTier }                              from '@acx-ui/user'

import { defaultNetworkPayload }            from '../../../NetworkTable'
import { ApplicationDrawer }                from '../../AccessControlForm/ApplicationDrawer'
import { DeviceOSDrawer }                   from '../../AccessControlForm/DeviceOSDrawer'
import { Layer2Drawer }                     from '../../AccessControlForm/Layer2Drawer'
import { Layer3Drawer }                     from '../../AccessControlForm/Layer3Drawer'
import { getToolTipByNetworkFilterOptions } from '../AccessControlPolicy'


const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'l2AclPolicyName',
    'l2AclPolicyId',
    'l3AclPolicyName',
    'l3AclPolicyId',
    'devicePolicyName',
    'devicePolicyId',
    'applicationPolicyName',
    'applicationPolicyId',
    'clientRateUpLinkLimit',
    'clientRateDownLinkLimit',
    'networkIds',
    'networkCount'
  ],
  page: 1
}

const AccessControlSet = () => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const { $t } = useIntl()
  const tenantBasePath: Path = useTenantLink('')
  const navigate = useNavigate()
  const params = useParams()

  const [networkFilterOptions, setNetworkFilterOptions] = useState([] as AclOptionType[])
  const [networkIds, setNetworkIds] = useState([] as string[])

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const settingsId = 'policies-access-control-set-table'
  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload,
    pagination: { settingsId },
    enableRbac
  })

  const networkTableQuery = useTableQuery<Network|WifiNetwork>({
    useQuery: isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery,
    defaultPayload: {
      ...defaultNetworkPayload,
      filters: {
        id: [...networkIds]
      }
    }
  })

  useEffect(() => {
    if (tableQuery.data) {
      let unionNetworkIds = [] as string[]
      tableQuery.data.data.map(policy => {
        if (policy.networkIds) {
          unionNetworkIds.push(...policy.networkIds)
        }
      })
      setNetworkIds([...new Set(unionNetworkIds)])

      networkTableQuery.setPayload({
        ...defaultPayload,
        filters: {
          id: [...networkIds]
        }
      })
    }
  }, [tableQuery.data])

  useEffect(() => {
    if (networkTableQuery.data && networkIds.length) {
      setNetworkFilterOptions(
        [...networkTableQuery.data.data.map(
          (network) => {
            return { key: network.id, value: network.name }
          })]
      )
    }
  }, [networkTableQuery.data, networkIds])

  const [ deleteFn ] = useDeleteAccessControlProfilesMutation()

  const doDelete = (selectedRows: EnhancedAccessControlInfoType[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Policy' }),
      selectedRows[0].name,
      [{ fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'Network' }) }],
      async () => deleteFn({
        params,
        payload: selectedRows.map(row => row.id),
        enableRbac
      }).then(callback)
    )
  }


  const rowActions: TableProps<EnhancedAccessControlInfoType>['rowActions'] = [
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.ACCESS_CONTROL, PolicyOperation.DELETE),
      scopeKey: getScopeKeyByPolicy(PolicyType.ACCESS_CONTROL, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedItems => selectedItems.length > 0),
      onClick: (rows, clearSelection) => {
        doDelete(rows, clearSelection)
      }
    },
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.ACCESS_CONTROL, PolicyOperation.EDIT),
      scopeKey: getScopeKeyByPolicy(PolicyType.ACCESS_CONTROL, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedItems => selectedItems.length === 1),
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

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return <Loader states={[tableQuery]}>
    <Table<EnhancedAccessControlInfoType>
      settingsId={settingsId}
      enableApiFilter={true}
      columns={useColumns(networkFilterOptions)}
      dataSource={tableQuery?.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      rowKey='id'
      rowActions={allowedRowActions}
      rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
    />
  </Loader>
}

function useColumns (networkFilterOptions: AclOptionType[]) {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const form = Form.useFormInstance()


  const columns: TableProps<EnhancedAccessControlInfoType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.ACCESS_CONTROL,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'l2AclPolicyName',
      title: $t({ defaultMessage: 'Layer 2' }),
      dataIndex: 'l2AclPolicyName',
      sorter: true,
      render: function (_, row) {
        return row.l2AclPolicyId
          ? <Form form={form}><Layer2Drawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: row.l2AclPolicyId, viewText: row.l2AclPolicyName }}
          /></Form>
          : '-'
      }
    },
    {
      key: 'l3AclPolicyName',
      title: $t({ defaultMessage: 'Layer 3' }),
      dataIndex: 'l3AclPolicyName',
      sorter: true,
      render: function (_, row) {
        return row.l3AclPolicyId
          ? <Form form={form}><Layer3Drawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: row.l3AclPolicyId, viewText: row.l3AclPolicyName }}
          /></Form>
          : '-'
      }
    },
    {
      key: 'devicePolicyName',
      title: $t({ defaultMessage: 'Device & OS' }),
      dataIndex: 'devicePolicyName',
      sorter: true,
      render: function (_, row) {
        return row.devicePolicyId
          ? <Form form={form}><DeviceOSDrawer
            isOnlyViewMode={true}
            onlyViewMode={{ id: row.devicePolicyId, viewText: row.devicePolicyName }}
          /></Form>
          : '-'
      }
    },
    ...((isCore) ? [] : [{
      key: 'applicationPolicyName',
      title: $t({ defaultMessage: 'Applications' }),
      dataIndex: 'applicationPolicyName',
      sorter: true,
      render: function (_, row) {
        return row.applicationPolicyId
          ? <Form form={form}><ApplicationDrawer
            isOnlyViewMode={true}
            onlyViewMode={{
              id: row.applicationPolicyId,
              viewText: row.applicationPolicyName
            }}
          /></Form>
          : '-'
      }
    } as ColumnType<EnhancedAccessControlInfoType>]),
    {
      key: 'clientRateLimit',
      title: $t({ defaultMessage: 'Client Rate Limit' }),
      dataIndex: 'clientRateLimit',
      sorter: true,
      render: function (_, row) {
        return <ClientRateLimitComponent
          clientRateUpLinkLimit={row.clientRateUpLinkLimit}
          clientRateDownLinkLimit={row.clientRateDownLinkLimit}
        />
      }
    },
    {
      key: 'networkIds',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkIds',
      align: 'center',
      filterable: networkFilterOptions,
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      render: (_, row) => getToolTipByNetworkFilterOptions(row, networkFilterOptions)
    }
  ]

  return columns
}

const ClientRateLimitComponent = (
  props: { clientRateUpLinkLimit: number, clientRateDownLinkLimit: number }
) => {
  const { $t } = useIntl()
  const { clientRateUpLinkLimit, clientRateDownLinkLimit } = props
  const UNLIMITED = $t({ defaultMessage: 'Unlimited' })

  const uplink = clientRateUpLinkLimit
    ? $t({ defaultMessage: '{count} Mbps' }, {
      count: clientRateUpLinkLimit
    })
    : UNLIMITED
  const downlink = clientRateDownLinkLimit
    ? $t({ defaultMessage: '{count} Mbps' }, {
      count: clientRateDownLinkLimit
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
