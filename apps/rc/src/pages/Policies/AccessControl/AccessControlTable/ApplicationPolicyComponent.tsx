import { useEffect, useState } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { defaultNetworkPayload }     from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDelAppPoliciesMutation,
  useGetEnhancedApplicationProfileListQuery,
  useNetworkListQuery
} from '@acx-ui/rc/services'
import {
  useTableQuery, ApplicationPolicy, AclOptionType, Network
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { AddModeProps }                         from '../AccessControlForm/AccessControlForm'
import ApplicationDrawer                        from '../AccessControlForm/ApplicationDrawer'
import { PROFILE_MAX_COUNT_APPLICATION_POLICY } from '../constants'

const defaultPayload = {
  fields: [
    'id',
    'name',
    'description',
    'rules',
    'networkIds'
  ],
  page: 1
}

const ApplicationPolicyComponent = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [addModeStatus, setAddModeStatus] = useState(
    { enable: true, visible: false } as AddModeProps
  )

  const [ deleteFn ] = useDelAppPoliciesMutation()

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
    useQuery: useGetEnhancedApplicationProfileListQuery,
    defaultPayload
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
      async () => deleteFn({ params, payload: selectedRows.map(row => row.id) }).then(callback)
    )
  }

  const rowActions: TableProps<ApplicationPolicy>['rowActions'] = [
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
    <Form>
      <ApplicationDrawer
        onlyAddMode={addModeStatus}
      />
    </Form>
    <Table<ApplicationPolicy>
      settingsId='policies-access-control-application-policy-table'
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
      render: function (data, row) {
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
      sortDirections: ['descend', 'ascend', 'descend'],
      render: (data, row) => row.networkIds?.length
    }
  ]

  return columns
}


export default ApplicationPolicyComponent
