import { FC, ReactNode, useMemo } from 'react'

import { Badge }                  from 'antd'
import moment                     from 'moment'
import { defineMessage, useIntl } from 'react-intl'

import {
  cssStr,
  Loader,
  showToast,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { DateFormatEnum, formats, formatter } from '@acx-ui/formatter'
import { useTableQuery }                      from '@acx-ui/rc/utils'
import { getIntl }                            from '@acx-ui/utils'

import { useGetAuditsQuery, useRetryAuditMutation } from './services'
import { AuditDto, AuditStatusEnum }                from './types'

export const retryableStatus = [
  AuditStatusEnum.Failure,
  AuditStatusEnum.Success
]
const settingsId = 'data-connector-audit-table'

const statusColorMapping = (status: AuditDto['status']) => {
  switch (status) {
    case AuditStatusEnum.Failure:
      return cssStr('--acx-semantics-red-50')
    case AuditStatusEnum.Success:
      return cssStr('--acx-semantics-green-50')
    case AuditStatusEnum.InProgress: // fallthrough
    case AuditStatusEnum.Scheduled: // fallthrough
    default:
      return cssStr('--acx-neutrals-50')
  }
}

export const renderStatusWithBadge = (
  status: AuditDto['status'],
  error?: string
) => (
  <Badge
    color={statusColorMapping(status)}
    text={
      <Tooltip
        popupVisible={Boolean(error)}
        placement='top'
        title={error}
        dottedUnderline={Boolean(error)}
      >
        {getAuditStatusLabel(status)}
      </Tooltip>
    }
  />
)

const getAuditStatusLabel = (status: AuditDto['status']) => {
  const { $t } = getIntl()
  switch (status) {
    case AuditStatusEnum.Success:     return $t({ defaultMessage: 'Success' })
    case AuditStatusEnum.Failure:     return $t({ defaultMessage: 'Failure' })
    case AuditStatusEnum.InProgress:  return $t({ defaultMessage: 'In Progress' })
    case AuditStatusEnum.Scheduled:   return $t({ defaultMessage: 'Scheduled' })
  }
}

interface AuditLogTableProps {
  dataConnectorId: string;
}

export const getRetryError = (audit?: AuditDto): string | undefined => {
  if (!audit) return undefined
  const { $t } = getIntl()
  const { status, start } = audit

  if (!retryableStatus.includes(status)) {
    return $t({ defaultMessage: 'Connector is {status}' }, { status: getAuditStatusLabel(status) })
  }

  const inputDate = moment(start)
  const now = moment()
  const diffDays = now.diff(inputDate, 'days')

  if (diffDays >= 3) {
    return $t({ defaultMessage:
      'Connector can only be retried within 3 days from start date'
    })
  }

  return undefined
}

const AuditLogTable: FC<AuditLogTableProps> = ({ dataConnectorId }) => {
  const { $t } = useIntl()
  const [retryAudit] = useRetryAuditMutation()
  const tableQuery = useTableQuery<AuditDto>({
    useQuery: useGetAuditsQuery,
    pagination: { settingsId },
    defaultPayload: { filters: { dataConnectorId } }
  })

  const rowActions: TableProps<AuditDto>['rowActions'] = useMemo(
    () => [
      {
        label: $t(defineMessage({ defaultMessage: 'Retry' })),
        onClick: ([{ id }], clearSelection) => {
          retryAudit(id).unwrap()
            .then(() => {
              showToast({
                type: 'success',
                content: $t({
                  defaultMessage:
                    'The selected audit has been retried successfully.'
                })
              })
              clearSelection()
            })
            .catch(() => {
              showToast({
                type: 'error',
                content: $t({
                  defaultMessage: 'Failed to retry selected audit.'
                })
              })
            })
        },
        disabled: ([selectedRow]) => !!getRetryError(selectedRow),
        tooltip: ([selectedRow]) => getRetryError(selectedRow)
      }
    ],
    [$t, retryAudit]
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
        title: $t({ defaultMessage: 'Export start' }),
        dataIndex: 'start',
        key: 'start',
        render: (_, { start }) =>
          formatter(DateFormatEnum.DateTimeFormat)(
            moment(start).subtract(moment().utcOffset(), 'minutes')
          )
      },
      {
        title: $t({ defaultMessage: 'Export end' }),
        dataIndex: 'end',
        key: 'end',
        render: (_, { end }) =>
          formatter(DateFormatEnum.DateTimeFormat)(
            moment(end).subtract(moment().utcOffset(), 'minutes')
          )
      }
    ],
    [$t]
  )

  return (
    <Loader states={[tableQuery]}>
      <Table
        columns={columns}
        settingsId={settingsId}
        dataSource={tableQuery.data?.data}
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
