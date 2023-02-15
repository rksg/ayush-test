import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, Table, TableProps }           from '@acx-ui/components'
import { useDelDevicePolicyMutation, useDevicePolicyListQuery } from '@acx-ui/rc/services'
import {
  DevicePolicy,
  PolicyType,
  useTableQuery
} from '@acx-ui/rc/utils'

import DeviceOSDrawer from '../AccessControlForm/DeviceOSDrawer'


const defaultPayload = {
  searchString: '',
  filters: {
    type: [PolicyType.DEVICE_POLICY]
  },
  fields: [
    'id',
    'name',
    'description',
    'rulesCount',
    'networksCount'
  ]
}

const DevicePolicyComponent = () => {
  const { $t } = useIntl()
  const params = useParams()

  const [ delDevicePolicy ] = useDelDevicePolicyMutation()

  const [editMode, setEditMode] = useState({
    id: '', isEdit: false
  })

  const tableQuery = useTableQuery({
    useQuery: useDevicePolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<DevicePolicy>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: name
          },
          onOk: () => {
            delDevicePolicy({ params: { ...params, devicePolicyId: id } }).then(clearSelection)
          }
        })
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
    <Table<DevicePolicy>
      columns={useColumns(editMode, setEditMode)}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='id'
      rowActions={rowActions}
      rowSelection={{ type: 'radio' }}
    />
  </Loader>
}

function useColumns (editMode: { id: string, isEdit: boolean }, setEditMode: (editMode: {
  id: string, isEdit: boolean
}) => void) {
  const { $t } = useIntl()

  const columns: TableProps<DevicePolicy>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return <DeviceOSDrawer
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
      key: 'rulesCount',
      title: $t({ defaultMessage: 'Rules' }),
      dataIndex: 'rulesCount',
      sorter: true
    },
    {
      key: 'networksCount',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networksCount',
      sorter: true
    }
  ]

  return columns
}


export default DevicePolicyComponent
