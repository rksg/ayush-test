import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import {
  useDelL3AclPolicyMutation,
  useGetAccessControlProfileListQuery,
  useL3AclPolicyListQuery
} from '@acx-ui/rc/services'
import {
  L2AclPolicy,
  L3AclPolicy,
  PolicyType,
  useTableQuery
} from '@acx-ui/rc/utils'

import Layer3Drawer from '../AccessControlForm/Layer3Drawer'


const defaultPayload = {
  searchString: '',
  filters: {
    type: [PolicyType.LAYER_3_POLICY]
  },
  fields: [
    'id',
    'name',
    'description',
    'rulesCount',
    'networksCount'
  ]
}

const Layer3Component = () => {
  const { $t } = useIntl()
  const params = useParams()

  const [ delL3AclPolicy ] = useDelL3AclPolicyMutation()

  const { data: accessControlList } = useGetAccessControlProfileListQuery({
    params: params
  }, {
    selectFromResult ({ data }) {
      return {
        data: data?.map(accessControl => accessControl?.l3AclPolicy?.id)
      }
    }
  })

  const [editMode, setEditMode] = useState({
    id: '', isEdit: false
  })

  const tableQuery = useTableQuery({
    useQuery: useL3AclPolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<L3AclPolicy>['rowActions'] = [
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
        } else {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Policy' }),
              entityValue: name
            },
            onOk: () => {
              delL3AclPolicy({ params: { ...params, l3AclPolicyId: id } }).then(clearSelection)
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
    <Table<L3AclPolicy>
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

  const columns: TableProps<L2AclPolicy>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return <Layer3Drawer
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


export default Layer3Component
