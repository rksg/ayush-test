import { FormattedMessage, useIntl } from 'react-intl'

import { getUserProfile as getRaiUserProfile }  from '@acx-ui/analytics/utils'
import { Loader, showToast, Table, TableProps } from '@acx-ui/components'
import { DateFormatEnum, formatter }            from '@acx-ui/formatter'
import { doProfileDelete }                      from '@acx-ui/rc/services'
import { useTableQuery }                        from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }           from '@acx-ui/react-router-dom'
import {
  filterByAccess,
  getShowWithoutRbacCheckKey,
  getUserProfile as getR1userProfile,
  hasPermission
} from '@acx-ui/user'

import { DataSubscription, useDataSubscriptionsQuery, useDeleteDataSubscriptionsMutation, usePatchDataSubscriptionsMutation } from './services'
import { Actions, isVisibleByAction }                                                                                         from './Utils'

export function DataSubscriptionsTable ({ isRAI }: { isRAI: boolean }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/dataSubscriptions')
  const [deleteDataSubscriptions] = useDeleteDataSubscriptionsMutation()
  const [patchDataSubscriptions] = usePatchDataSubscriptionsMutation()
  const userId = isRAI ? getRaiUserProfile().userId : getR1userProfile().profile.swuId

  const showToastByAction = (isSuccess: boolean, action: Actions, count: number) => {
    let verb = ''
    switch (action) {
      case Actions.Delete:
        verb = isSuccess ? 'deleted' : 'delete'
        break
      case Actions.Pause:
        verb = isSuccess ? 'paused' : 'pause'
        break
      case Actions.Resume:
        verb = isSuccess ? 'resumed' : 'resume'
        break
    }
    isSuccess
      ? showToast({
        type: 'success',
        content:
          <FormattedMessage
            defaultMessage={`The selected
              {totalCount, plural,
              one {data subscription has}
              other {data subscriptions have}} been {verb} successfully.`}
            values={{
              totalCount: count,
              verb
            }}
          />
      })
      : showToast({
        type: 'error',
        content:
          <FormattedMessage
            defaultMessage={`Failed to {verb} the selected
              {totalCount, plural,
              one {data subscription}
              other {data subscriptions}}.`}
            values={{
              totalCount: count,
              verb
            }}
          />
      })
  }

  const defaultPayload = {
    fields: [],  // select all
    filters: {}
  }
  const settingsId = 'data-subscription-table'
  const tableQuery = useTableQuery<DataSubscription>({
    // Use the default sortField by the component
    useQuery: useDataSubscriptionsQuery,
    pagination: { settingsId },
    defaultPayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ascend'
    }
  })

  const columnHeaders: TableProps<DataSubscription>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      fixed: 'left'
    },
    {
      key: 'userName',
      title: $t({ defaultMessage: 'Owner' }),
      dataIndex: 'userName'
    },
    {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      render: (_, row) => row.status
        ? $t({ defaultMessage: 'Active' })
        : $t({ defaultMessage: 'Paused' })
    },
    {
      key: 'frequency',
      title: $t({ defaultMessage: 'Frequency' }),
      dataIndex: 'frequency'
    },
    {
      key: 'updatedAt',
      title: $t({ defaultMessage: 'Last Update' }),
      dataIndex: 'updatedAt',
      render: (_, row) => formatter(DateFormatEnum.DateTimeFormat)(row.updatedAt)
    }
  ]

  const rowActions: TableProps<DataSubscription>['rowActions'] = [
    {
      key: getShowWithoutRbacCheckKey(Actions.Resume),
      label: $t({ defaultMessage: 'Resume' }),
      visible: rows => isVisibleByAction(rows, Actions.Resume),
      onClick: async (selectedRows: DataSubscription[], clearSelection) => {
        const payload = {
          dataSubscriptionIds: selectedRows.map(row => row.id),
          data: {
            status: true
          }
        }
        try {
          await patchDataSubscriptions({ payload }).unwrap()
          showToastByAction(true, Actions.Resume, selectedRows.length)
          clearSelection()
        } catch (error) {
          showToastByAction(false, Actions.Resume, selectedRows.length)
        }
      }
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Pause),
      label: $t({ defaultMessage: 'Pause' }),
      visible: rows => isVisibleByAction(rows, Actions.Pause),
      onClick: async (selectedRows: DataSubscription[], clearSelection) => {
        const payload = {
          dataSubscriptionIds: selectedRows.map(row => row.id),
          data: {
            status: false
          }
        }
        try {
          await patchDataSubscriptions({ payload }).unwrap()
          showToastByAction(true, Actions.Pause, selectedRows.length)
          clearSelection()
        } catch (error) {
          showToastByAction(false, Actions.Pause, selectedRows.length)
        }
      }
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Edit),
      label: $t({ defaultMessage: 'Edit' }),
      visible: rows => isVisibleByAction(rows, Actions.Edit),
      onClick: (selectedRows: DataSubscription[]) => {
        const row = selectedRows[0]
        const editPath = isRAI
          ? `edit/${row.id}`
          : `edit/TBD/${row.id}`  //TODO: use R1 edit path later
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${editPath}`
        })
      }
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Delete),
      label: $t({ defaultMessage: 'Delete' }),
      visible: rows => isVisibleByAction(rows, Actions.Delete),
      onClick: (selectedRows: DataSubscription[], clearSelection) => {
        doDelete(selectedRows, clearSelection)
      }
    }
  ]

  const deleteSubscriptionsWithToast =
    async (selectedRows: DataSubscription[], callback: () => void) => {
      try {
        await deleteDataSubscriptions({
          payload: selectedRows.map(row => row.id) }).unwrap()
        showToastByAction(true, Actions.Delete, selectedRows.length)
        callback()
      } catch (error) {
        showToastByAction(false, Actions.Delete, selectedRows.length)
      }
    }

  const doDelete = (selectedRows: DataSubscription[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Data Subscription' }),
      selectedRows[0].name,
      // no need to check the relation fields
      [],
      async () => deleteSubscriptionsWithToast(selectedRows, callback)
    )
  }

  const hasDataPermission = isRAI
    ? hasPermission({ permission: 'WRITE_DATA_SUBSCRIPTIONS' })
    : false //TODO: implement R1 permission later

  const allowedRowActions = filterByAccess(rowActions)

  return <Loader states={[tableQuery]}>
    <Table<DataSubscription>
      rowKey='id'
      settingsId={settingsId}
      columns={columnHeaders}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      rowActions={allowedRowActions}
      rowSelection={
        hasDataPermission && allowedRowActions.length > 0 && {
          type: 'checkbox',
          getCheckboxProps: (record: DataSubscription) => ({
            disabled: record.userId !== userId
          })
        }
      }
    />
  </Loader>
}