import React, { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import { defaultNetworkPayload }                      from '@acx-ui/rc/components'
import {
  useDelL2AclPolicyMutation,
  useGetAccessControlProfileListQuery,
  useGetEnhancedL2AclProfileListQuery,
  useNetworkListQuery
} from '@acx-ui/rc/services'
import { AclOptionType, L2AclPolicy, Network, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess }                                     from '@acx-ui/user'

import { AddModeProps } from '../AccessControlForm/AccessControlForm'
import Layer2Drawer     from '../AccessControlForm/Layer2Drawer'

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'description',
    'macAddress',
    'networkIds'
  ],
  page: 1
}

const Layer2Component = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [addModeStatus, setAddModeStatus] = useState(
    { enable: true, visible: false } as AddModeProps
  )

  const [ delL2AclPolicy ] = useDelL2AclPolicyMutation()

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

  const { data: accessControlList } = useGetAccessControlProfileListQuery({
    params: params
  }, {
    selectFromResult ({ data }) {
      return {
        data: data?.map(accessControl => accessControl?.l2AclPolicy?.id)
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
    onClick: () => {
      setAddModeStatus({ enable: true, visible: true })
    }
  }]

  const rowActions: TableProps<L2AclPolicy>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id, networkIds }], clearSelection) => {
        if (networkIds?.length !== 0 || accessControlList?.includes(id)) {
          showActionModal({
            type: 'error',
            content: $t({
              // eslint-disable-next-line max-len
              defaultMessage: 'This policy has been applied in network or it been used in another access control policy.'
            })
          })
          clearSelection()
        } else {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Policy' }),
              entityValue: name
            },
            onOk: () => {
              delL2AclPolicy({ params: { ...params, l2AclPolicyId: id } }).then(clearSelection)
            }
          })
        }
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
    <Layer2Drawer
      onlyAddMode={addModeStatus}
    />
    <Table<L2AclPolicy>
      columns={useColumns(networkFilterOptions, editMode, setEditMode)}
      enableApiFilter={true}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      rowKey='id'
      actions={filterByAccess(actions)}
      rowActions={filterByAccess(rowActions)}
      rowSelection={{ type: 'radio' }}
    />
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
      key: 'macAddress',
      title: $t({ defaultMessage: 'MAC Addresses' }),
      dataIndex: 'macAddress',
      align: 'center',
      sorter: true
    },
    {
      key: 'networkIds',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkIds',
      filterable: networkFilterOptions,
      align: 'center',
      sorter: true,
      render: (data, row) => row.networkIds?.length
    }
  ]

  return columns
}


export default Layer2Component
