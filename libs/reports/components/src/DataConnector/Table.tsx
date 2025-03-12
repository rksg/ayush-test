import { FormattedMessage, useIntl } from 'react-intl'

import { Loader, showToast, Table, TableProps }   from '@acx-ui/components'
import { get }                                    from '@acx-ui/config'
import { DateFormatEnum, formatter }              from '@acx-ui/formatter'
import { useTableQuery }                          from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                              from '@acx-ui/types'
import {
  filterByAccess,
  getShowWithoutRbacCheckKey,
  hasPermission,
  hasRoles
} from '@acx-ui/user'

import {
  useDataConnectorQuery,
  usePatchDataConnectorMutation
} from './services'
import { DataConnector, Frequency }                            from './types'
import { Actions, frequencyMap, getUserId, isVisibleByAction } from './utils'

export function DataConnectorTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/dataConnector')
  const [patchDataConnector] = usePatchDataConnectorMutation()
  const userId = getUserId()

  type ActionsWithoutEdit = Exclude<Actions, Actions.Edit>
  const actionToSuccessVerbMap = {
    [Actions.Delete]: 'deleted',
    [Actions.Pause]: 'paused',
    [Actions.Resume]: 'resumed'
  }
  const actionToErrorVerbMap = {
    [Actions.Delete]: 'delete',
    [Actions.Pause]: 'pause',
    [Actions.Resume]: 'resume'
  }
  const showToastByAction = (isSuccess: boolean, action: ActionsWithoutEdit, count: number) => {
    isSuccess
      ? showToast({
        type: 'success',
        content:
          <FormattedMessage
            defaultMessage={`The selected
              {totalCount, plural,
              one {data connector has}
              other {data connectors have}} been {verb} successfully.`}
            values={{
              totalCount: count,
              verb: actionToSuccessVerbMap[action]
            }}
          />
      })
      : showToast({
        type: 'error',
        content:
          <FormattedMessage
            defaultMessage={`Failed to {verb} the selected
              {totalCount, plural,
              one {data connector}
              other {data connectors}}.`}
            values={{
              totalCount: count,
              verb: actionToErrorVerbMap[action]
            }}
          />
      })
  }

  const defaultPayload = {
    fields: [],  // select all
    filters: {}
  }
  const settingsId = 'data-connector-table'
  const tableQuery = useTableQuery<DataConnector>({
    // Use the default sortField by the component
    useQuery: useDataConnectorQuery,
    pagination: { settingsId },
    defaultPayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ascend'
    }
  })

  const columnHeaders: TableProps<DataConnector>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (
        name,
        { id, name: dataConnectorName, userId: dataConnectorUserId }
      ) =>
        userId === dataConnectorUserId ? (
          <TenantLink to={`dataConnector/auditLog/${id}`}>
            {dataConnectorName}
          </TenantLink>
        ) : (
          name
        )
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
      dataIndex: 'frequency',
      render: (_, row) => $t(frequencyMap[row.frequency as Frequency])
    },
    {
      key: 'updatedAt',
      title: $t({ defaultMessage: 'Last Update' }),
      dataIndex: 'updatedAt',
      render: (_, row) => formatter(DateFormatEnum.DateTimeFormat)(row.updatedAt)
    }
  ]

  const rowActions: TableProps<DataConnector>['rowActions'] = [
    {
      key: getShowWithoutRbacCheckKey(Actions.Resume),
      label: $t({ defaultMessage: 'Resume' }),
      visible: rows => isVisibleByAction(rows, Actions.Resume),
      onClick: async (selectedRows: DataConnector[], clearSelection) => {
        const payload = {
          ids: selectedRows.map(row => row.id),
          data: {
            status: true
          }
        }
        patchDataConnector({ payload }).unwrap()
          .then(() => {
            showToastByAction(true, Actions.Resume, selectedRows.length)
            clearSelection()
          })
          .catch(() => {
            showToastByAction(false, Actions.Resume, selectedRows.length)
          })
      }
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Pause),
      label: $t({ defaultMessage: 'Pause' }),
      visible: rows => isVisibleByAction(rows, Actions.Pause),
      onClick: async (selectedRows: DataConnector[], clearSelection) => {
        const payload = {
          ids: selectedRows.map(row => row.id),
          data: {
            status: false
          }
        }
        patchDataConnector({ payload }).unwrap()
          .then(() => {
            showToastByAction(true, Actions.Pause, selectedRows.length)
            clearSelection()
          })
          .catch(() => {
            showToastByAction(false, Actions.Pause, selectedRows.length)
          })
      }
    },
    {
      key: getShowWithoutRbacCheckKey(Actions.Edit),
      label: $t({ defaultMessage: 'Edit' }),
      visible: rows => isVisibleByAction(rows, Actions.Edit),
      onClick: (selectedRows: DataConnector[]) => {
        const row = selectedRows[0]
        const editPath = `edit/${row.id}`
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${editPath}`
        })
      }
    }
    // Hide delete button to preserve quota usage
  ]

  const hasDataPermission = get('IS_MLISA_SA')
    ? hasPermission({ permission: 'WRITE_DATA_CONNECTOR' })
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const allowedRowActions = filterByAccess(rowActions)

  return <Loader states={[tableQuery]}>
    <Table<DataConnector>
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
          getCheckboxProps: (record: DataConnector) => ({
            disabled: record.userId !== userId
          })
        }
      }
    />
  </Loader>
}
