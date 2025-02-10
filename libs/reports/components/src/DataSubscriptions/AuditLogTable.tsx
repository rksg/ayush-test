import { FC, ReactNode, useCallback, useMemo } from 'react'

import { Badge }                  from 'antd'
import moment                     from 'moment'
import { defineMessage, useIntl } from 'react-intl'

import { cssStr, Loader, Table, TableProps, Tooltip } from '@acx-ui/components'
import { DateFormatEnum, formats, formatter }         from '@acx-ui/formatter'
import { useTableQuery }                              from '@acx-ui/rc/utils'

import { useGetAuditsQuery, useRetryAuditMutation } from './services'
import { AuditDto, AuditStatusEnum }                from './types'

const retirableStatus = ['failure', 'success']
const settingsId = 'data-subscription-audit-table'

const statusColorMapping = (status: AuditDto['status']) => {
  switch (status) {
    case AuditStatusEnum.Failure:
      return cssStr('--acx-semantics-red-50')
    case AuditStatusEnum.Success:
      return cssStr('--acx-semantics-green-50')
    case AuditStatusEnum.InProgess: // fallthrough
    case AuditStatusEnum.Scheduled: // fallthrough
    default:
      return cssStr('--acx-neutrals-50')
  }
}

const renderStatusWithBadge = (status: AuditDto['status'], error?: string) => (
  <Badge
    color={statusColorMapping(status)}
    text={
      <Tooltip
        popupVisible={Boolean(error)}
        placement='top'
        title={error}
        dottedUnderline={Boolean(error)}
      >
        {status}
      </Tooltip>
    }
  />
)

interface AuditLogTableProps {
  dataSubscriptionId: string
}

const AuditLogTable: FC<AuditLogTableProps> = ({ dataSubscriptionId }) => {
  const { $t } = useIntl()

  const [retryAudit] = useRetryAuditMutation()

  const tableQuery = useTableQuery<AuditDto>({
    useQuery: useGetAuditsQuery,
    pagination: { settingsId },
    defaultPayload: { filters: { dataSubscriptionId } }
  })

  const getRetryError = useCallback(
    (audit: AuditDto): string | undefined => {
      if (!audit) return undefined

      const { status, start } = audit

      if (!retirableStatus.includes(status)) {
        return $t(
          { defaultMessage: 'Subscription is {status}' },
          { status }
        )
      }

      const inputDate = moment(start)
      const now = moment()
      const diffDays = now.diff(inputDate, 'days')

      if (diffDays >= 3) {
        return $t(
          defineMessage({
            defaultMessage:
              'Subscription can only be retried within 3 days from start date'
          })
        )
      }

      return undefined
    },
    [$t]
  )

  const rowActions: TableProps<AuditDto>['rowActions'] = useMemo(
    () => [
      {
        label: $t(defineMessage({ defaultMessage: 'Retry' })),
        onClick: ([{ id }], clearSelection) => {
          retryAudit(id)
          clearSelection()
        },
        disabled: ([selectedRow]) => !!getRetryError(selectedRow),
        tooltip: ([selectedRow]) => getRetryError(selectedRow)
      }
    ],
    [$t, retryAudit, getRetryError]
  )

  const columns: TableProps<AuditDto>['columns'] = useMemo(
    () => [
      {
        title: $t({ defaultMessage: 'Last update' }),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (_, { updatedAt }) =>
          formatter(DateFormatEnum.DateTimeFormat)(updatedAt)
      },
      {
        title: $t({ defaultMessage: 'Status' }),
        dataIndex: 'status',
        key: 'status',
        render: (_, { status, error }) => renderStatusWithBadge(status, error)
      },
      {
        title: $t({ defaultMessage: 'Size transferred' }),
        dataIndex: 'size',
        key: 'size',
        render: (_, { size }) => formats.bytesFormat(size)
      },
      {
        title: $t({ defaultMessage: 'Export start date' }),
        dataIndex: 'start',
        key: 'start',
        render: (_, { start }) =>
          formatter(DateFormatEnum.DateTimeFormat)(start)
      },
      {
        title: $t({ defaultMessage: 'Export end date' }),
        dataIndex: 'end',
        key: 'end',
        render: (_, { end }) => formatter(DateFormatEnum.DateTimeFormat)(end)
      }
    ],
    [$t]
  )

  return (
    <Loader states={[tableQuery]}>
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        onChange={tableQuery.handleTableChange}
        pagination={tableQuery.pagination}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{
          type: 'radio',
          getCheckboxProps: (record: AuditDto) => ({
            disabled: !!getRetryError(record)
          }),
          renderCell: (_, record: AuditDto, __, node: ReactNode) => {
            const retryError = getRetryError(record)
            if (retryError) {
              return <Tooltip title={retryError}>{node}</Tooltip>
            }
            return node
          }
        }}
      />
    </Loader>
  )
}

export default AuditLogTable