import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showActionModal, Table, TableProps }            from '@acx-ui/components'
import {
  useApplicationPolicyListQuery,
  useDelAppPolicyMutation, useGetAccessControlProfileListQuery
} from '@acx-ui/rc/services'
import {
  PolicyType,
  useTableQuery, ApplicationPolicy
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import ApplicationDrawer from '../AccessControlForm/ApplicationDrawer'


const defaultPayload = {
  searchString: '',
  filters: {
    type: [PolicyType.APPLICATION_POLICY]
  },
  fields: [
    'id',
    'name',
    'description',
    'rulesCount',
    'networksCount'
  ]
}

const ApplicationPolicyComponent = () => {
  const { $t } = useIntl()
  const params = useParams()

  const [ delAppPolicy ] = useDelAppPolicyMutation()

  const { data: accessControlList } = useGetAccessControlProfileListQuery({
    params: params
  }, {
    selectFromResult ({ data }) {
      return {
        data: data?.map(accessControl => accessControl?.applicationPolicy?.id)
      }
    }
  })


  const [editMode, setEditMode] = useState({
    id: '', isEdit: false
  })

  const tableQuery = useTableQuery({
    useQuery: useApplicationPolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<ApplicationPolicy>['rowActions'] = [
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
              delAppPolicy({ params: { ...params, applicationPolicyId: id } }).then(clearSelection)
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
    <Table<ApplicationPolicy>
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

  const columns: TableProps<ApplicationPolicy>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      align: 'left',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
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
      align: 'left',
      sorter: true
    },
    {
      key: 'rulesCount',
      title: $t({ defaultMessage: 'Rules' }),
      dataIndex: 'rulesCount',
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


export default ApplicationPolicyComponent
