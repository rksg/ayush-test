import React, { useEffect, useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  doProfileDelete,
  useDelAppPoliciesMutation,
  useGetEnhancedApplicationProfileListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  useTableQuery, ApplicationPolicy, AclOptionType, Network,
  WifiNetwork, getScopeKeyByPolicy, PolicyOperation, PolicyType,
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'

import { defaultNetworkPayload }                from '../../../NetworkTable'
import { AddModeProps }                         from '../../AccessControlForm'
import { ApplicationDrawer }                    from '../../AccessControlForm/ApplicationDrawer'
import { getToolTipByNetworkFilterOptions }     from '../AccessControlPolicy'
import { PROFILE_MAX_COUNT_APPLICATION_POLICY } from '../constants'

const defaultPayload = {
  fields: [
    'id',
    'name',
    'description',
    'rules',
    'wifiNetworkIds',
    'networkIds',
    'networkCount'
  ],
  page: 1
}

const ApplicationPolicyComponent = () => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const { $t } = useIntl()
  const params = useParams()
  const [addModeStatus, setAddModeStatus] = useState(
    { enable: true, visible: false } as AddModeProps
  )

  const [ deleteFn ] = useDelAppPoliciesMutation()

  const [networkFilterOptions, setNetworkFilterOptions] = useState([] as AclOptionType[])
  const [networkIds, setNetworkIds] = useState([] as string[])

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const networkTableQuery = useTableQuery<Network|WifiNetwork>({
    useQuery: isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery,
    defaultPayload: {
      ...defaultNetworkPayload,
      filters: {
        id: [...networkIds]
      }
    }
  })

  const [editMode, setEditMode] = useState({
    id: '', isEdit: false
  })

  const settingsId = 'policies-access-control-application-policy-table'
  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedApplicationProfileListQuery,
    defaultPayload,
    pagination: { settingsId },
    enableRbac
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

  const actions = [{
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.APPLICATION_POLICY, PolicyOperation.CREATE),
    scopeKey: getScopeKeyByPolicy(PolicyType.APPLICATION_POLICY, PolicyOperation.CREATE),
    label: $t({ defaultMessage: 'Add Application Policy' }),
    disabled: tableQuery.data?.totalCount! >= PROFILE_MAX_COUNT_APPLICATION_POLICY,
    onClick: () => {
      setAddModeStatus({ enable: true, visible: true })
    }
  }]

  const doDelete = (selectedRows: ApplicationPolicy[], callback: () => void) => {
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

  const rowActions: TableProps<ApplicationPolicy>['rowActions'] = [
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.APPLICATION_POLICY, PolicyOperation.DELETE),
      scopeKey: getScopeKeyByPolicy(PolicyType.APPLICATION_POLICY, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedItems => selectedItems.length > 0),
      onClick: (rows, clearSelection) => {
        doDelete(rows, clearSelection)
      }
    },
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.APPLICATION_POLICY, PolicyOperation.EDIT),
      scopeKey: getScopeKeyByPolicy(PolicyType.APPLICATION_POLICY, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedItems => selectedItems.length === 1),
      onClick: ([{ id }]) => {
        setEditMode({ id: id, isEdit: true })
      }
    }
  ]

  const allowedActions = filterByAccessForServicePolicyMutation(actions)
  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return <Loader states={[tableQuery]}>
    <Form>
      <ApplicationDrawer
        onlyAddMode={addModeStatus}
      />
      <Table<ApplicationPolicy>
        settingsId={settingsId}
        columns={useColumns(networkFilterOptions, editMode, setEditMode)}
        enableApiFilter={true}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        rowKey='id'
        actions={allowedActions}
        rowActions={allowedRowActions}
        rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
      />
    </Form>
  </Loader>
}

function useColumns (
  networkFilterOptions: AclOptionType[],
  editMode: { id: string, isEdit: boolean },
  setEditMode: (editMode: { id: string, isEdit: boolean }
  ) => void) {
  const { $t } = useIntl()

  const columns: TableProps<ApplicationPolicy>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return <ApplicationDrawer
          editMode={row.id === editMode.id ? editMode : { id: '', isEdit: false }}
          setEditMode={setEditMode}
          isOnlyViewMode={true}
          onlyViewMode={{ id: row.id ?? '', viewText: row.name }}
        />
      }
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      key: 'rules',
      title: $t({ defaultMessage: 'Rules' }),
      dataIndex: 'rules',
      align: 'center',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend']
    },
    {
      key: 'networkIds',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkIds',
      align: 'center',
      filterable: networkFilterOptions,
      sorter: true,
      render: (_, row) => getToolTipByNetworkFilterOptions(row, networkFilterOptions)
    }
  ]

  return columns
}


export default ApplicationPolicyComponent
