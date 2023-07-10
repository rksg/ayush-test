import React, { useEffect, useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { defaultNetworkPayload }     from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDelL2AclPoliciesMutation,
  useGetEnhancedL2AclProfileListQuery,
  useNetworkListQuery
} from '@acx-ui/rc/services'
import { AclOptionType, L2AclPolicy, Network, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                          from '@acx-ui/user'

import { AddModeProps }                    from '../AccessControlForm/AccessControlForm'
import Layer2Drawer                        from '../AccessControlForm/Layer2Drawer'
import { PROFILE_MAX_COUNT_LAYER2_POLICY } from '../constants'

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'description',
    'macAddressCount',
    'networkIds'
  ],
  page: 1,
  sortField: 'macAddressCount',
  sortOrder: 'DESC'
}

const Layer2Component = () => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const [addModeStatus, setAddModeStatus] = useState(
    { enable: true, visible: false } as AddModeProps
  )

  const [ deleteFn ] = useDelL2AclPoliciesMutation()

  const [networkFilterOptions, setNetworkFilterOptions] = useState([] as AclOptionType[])
  const [networkIds, setNetworkIds] = useState([] as string[])

  const networkTableQuery = useTableQuery<Network>({
    useQuery: useNetworkListQuery,
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

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedL2AclProfileListQuery,
    defaultPayload
  })

  useEffect(() => {
    if (tableQuery.data) {
      let unionNetworkIds = [] as string[]
      tableQuery.data.data.map(layer2Policy => {
        if (layer2Policy.networkIds) {
          unionNetworkIds.push(...layer2Policy.networkIds)
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
    label: $t({ defaultMessage: 'Add Layer 2 Policy' }),
    disabled: tableQuery.data?.totalCount! >= PROFILE_MAX_COUNT_LAYER2_POLICY,
    onClick: () => {
      setAddModeStatus({ enable: true, visible: true })
    }
  }]

  const doDelete = (selectedRows: L2AclPolicy[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Policy' }),
      selectedRows[0].name,
      [{ fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'Network' }) }],
      async () => deleteFn({ params, payload: selectedRows.map(row => row.id) }).then(callback)
    )
  }

  const rowActions: TableProps<L2AclPolicy>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        doDelete(rows, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        setEditMode({ id: id, isEdit: true })
      }
    }
  ]

  return <Loader states={[tableQuery]}>
    <Form form={form}>
      <Layer2Drawer
        onlyAddMode={addModeStatus}
      />
      <Table<L2AclPolicy>
        settingsId='policies-access-control-layer2-table'
        columns={useColumns(networkFilterOptions, editMode, setEditMode)}
        enableApiFilter={true}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        rowKey='id'
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'checkbox' }}
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

  const columns: TableProps<L2AclPolicy>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      align: 'left',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (data, row) {
        return <Layer2Drawer
          editMode={row.id === editMode.id ? editMode : { id: '', isEdit: false }}
          setEditMode={setEditMode}
          isOnlyViewMode={true}
          onlyViewMode={{ id: row.id, viewText: row.name }}
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
      key: 'macAddressCount',
      title: $t({ defaultMessage: 'MAC Addresses' }),
      dataIndex: 'macAddressCount',
      align: 'center',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend']
    },
    {
      key: 'networkIds',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkIds',
      filterable: networkFilterOptions,
      align: 'center',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      render: (data, row) => row.networkIds?.length
    }
  ]

  return columns
}


export default Layer2Component
