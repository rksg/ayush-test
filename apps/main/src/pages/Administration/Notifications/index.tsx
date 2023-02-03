import { useState } from 'react'

import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useGetNotificationRecipientsQuery,
  useDeleteNotificationRecipientsMutation,
  useDeleteNotificationRecipientMutation
} from '@acx-ui/rc/services'
import {  useTableQuery, NotificationRecipient } from '@acx-ui/rc/utils'

import RecipientDialog from './RecipientDialog'

const FunctionEnabledStatusLightConfig = {
  active: {
    color: 'var(--acx-semantics-green-50)'
  },
  inActive: {
    color: 'var(--acx-neutrals-50)'
  }
}

export const NotificationsTable = () => {
  const { $t } = useIntl()
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<NotificationRecipient>({} as NotificationRecipient)

  const tableQuery = useTableQuery<NotificationRecipient>({
    useQuery: useGetNotificationRecipientsQuery,
    defaultPayload: {}
  })

  const [deleteRecipient, deleteOneState] = useDeleteNotificationRecipientMutation()
  const [deleteRecipients, deleteMultipleState] = useDeleteNotificationRecipientsMutation()


  const handleClickAddRecipient = () => {
    setShowDialog(true)
  }

  const renderDataWithStatus = (data:string, enabled: boolean) => {
    return data ? <Badge
      color={FunctionEnabledStatusLightConfig[enabled ? 'active' : 'inActive'].color}
      text={data}
    /> : data
  }

  const columns: TableProps<NotificationRecipient>['columns'] = [
    {
      title: $t({ defaultMessage: 'Recipient Name' }),
      key: 'name',
      dataIndex: 'name',
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Email Address' }),
      key: 'email',
      dataIndex: 'email',
      render: (data, row) => {
        return renderDataWithStatus(row.email, row.emailEnabled)
      }
    },
    {
      title: $t({ defaultMessage: 'Mobile Phone' }),
      key: 'mobile',
      dataIndex: 'mobile',
      render: (data, row) => {
        return renderDataWithStatus(row.mobile, row.mobileEnabled)
      }
    }
  ]

  const rowActions: TableProps<NotificationRecipient>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        // show edit dialog
        setEditMode(true)
        setEditData(selectedRows[0])
        handleClickAddRecipient()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Recipients' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            rows.length === 1 ?
              deleteRecipient({ params: { serialNumber: rows[0].id } })
                .then(clearSelection) :
              deleteRecipients({ payload: rows.map(item => item.id) })
                .then(clearSelection)
          }
        })
      }
    }
  ]

  const tableActions = [{
    label: $t({ defaultMessage: 'Add Recipient' }),
    onClick: handleClickAddRecipient
  }]

  const isLoading = deleteOneState.isLoading || deleteMultipleState.isLoading

  return (
    <>
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isLoading }
      ]}>
        <Table
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'checkbox' }}
          actions={tableActions}
        />
      </Loader>

      <RecipientDialog
        visible={showDialog}
        editMode={editMode}
        editData={editData}
      />
    </>
  )
}

const Notifications = () => {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Notifications' })}</>
}

export default Notifications