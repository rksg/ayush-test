import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useDelL2AclPolicyMutation,
  useGetAccessControlProfileListQuery,
  useL2AclPolicyListQuery
} from '@acx-ui/rc/services'
import { L2AclPolicy, PolicyType, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess }                         from '@acx-ui/user'

import Layer2Drawer from '../AccessControlForm/Layer2Drawer'


const defaultPayload = {
  searchString: '',
  filters: {
    type: [PolicyType.LAYER_2_POLICY]
  },
  fields: [
    'id',
    'name',
    'description',
    'macAddressesCount',
    'networksCount'
  ]
}

const Layer2Component = () => {
  const { $t } = useIntl()
  const params = useParams()

  const [ delL2AclPolicy ] = useDelL2AclPolicyMutation()

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
    useQuery: useL2AclPolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<L2AclPolicy>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id, networksCount }], clearSelection) => {
        if (networksCount !== 0 || accessControlList?.includes(id)) {
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
    <Table<L2AclPolicy>
      columns={useColumns(editMode, setEditMode)}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='id'
      rowActions={filterByAccess(rowActions)}
      rowSelection={{ type: 'radio' }}
    />
  </Loader>
}

function useColumns (editMode: { id: string, isEdit: boolean }, setEditMode: (editMode: {
  id: string, isEdit: boolean
}) => void) {
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
      align: 'left',
      sorter: true
    },
    {
      key: 'macAddressesCount',
      title: $t({ defaultMessage: 'MAC Addresses' }),
      dataIndex: 'macAddressesCount',
      align: 'center',
      sorter: true
    },
    {
      key: 'networksCount',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networksCount',
      align: 'center',
      sorter: true
    }
  ]

  return columns
}


export default Layer2Component
