import { useEffect, useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button } from '@acx-ui/components'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { DownloadOutlined }                  from '@acx-ui/icons'
import { AdminLog, TableQuery }              from '@acx-ui/rc/utils'
import { RequestPayload }                    from '@acx-ui/types'
import { noDataDisplay }                     from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'

import { filtersFrom, getDescription, getSource, valueFrom } from './helpers'
import { adminLogTypeMapping, severityMapping }              from './mapping'
import { useExportCsv }                                      from './useExportCsv'

interface AdminLogTableProps {
  tableQuery: TableQuery<AdminLog, RequestPayload<unknown>, unknown>
}

const AdminLogTable = ({ tableQuery }: AdminLogTableProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<AdminLog>()
  const { exportCsv, disabled } = useExportCsv<AdminLog>(tableQuery)

  useEffect(() => { setVisible(false) },[tableQuery.data?.data])

  const columns: TableProps<AdminLog>['columns'] = [
    {
      key: 'event_datetime',
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'event_datetime',
      defaultSortOrder: 'descend',
      sorter: true,
      fixed: 'left',
      render: function (_, row) {
        return <Button
          type='link'
          size='small'
          onClick={()=>{
            setVisible(true)
            setCurrent(row)
          }}
        >{formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.event_datetime)}</Button>
      }
    },
    {
      key: 'severity',
      title: $t({ defaultMessage: 'Severity' }),
      dataIndex: 'severity',
      sorter: true,
      render: (_, row) => valueFrom(severityMapping, row.severity)
    },
    {
      key: 'entity_type',
      title: $t({ defaultMessage: 'Event Type' }),
      dataIndex: 'entity_type',
      sorter: true,
      searchable: true,
      render: (_, row, __, highlightFn) =>
        highlightFn(valueFrom(adminLogTypeMapping, row.entity_type)),
      filterable: filtersFrom(adminLogTypeMapping)
    },
    {
      key: 'adminName',
      title: $t({ defaultMessage: 'Source' }),
      dataIndex: 'adminName',
      sorter: true,
      render: (_, row) => getSource(row)
    },
    {
      key: 'message',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'message',
      searchable: true,
      render: (_, row, __, highlightFn) => getDescription(row, highlightFn)
    }
  ]
  const getDrawerData = (data: AdminLog) => [
    {
      title: defineMessage({ defaultMessage: 'Time' }),
      value: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(data.event_datetime)
    },
    {
      title: defineMessage({ defaultMessage: 'Severity' }),
      value: valueFrom(severityMapping, data.severity)
    },
    {
      title: defineMessage({ defaultMessage: 'Event Type' }),
      value: valueFrom(adminLogTypeMapping, data.entity_type)
    },
    {
      title: defineMessage({ defaultMessage: 'IP Address' }),
      value: data.ipAddress?? noDataDisplay
    },
    {
      title: defineMessage({ defaultMessage: 'Source' }),
      value: getSource(data)
    },
    {
      title: defineMessage({ defaultMessage: 'Description' }),
      value: getDescription(data)
    }
  ]

  return <Loader states={[tableQuery]}>
    <Table
      rowKey='tableKey'
      columns={columns}
      dataSource={tableQuery.data?.data ?? []}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      enableApiFilter={true}
      iconButton={{ icon: <DownloadOutlined />, disabled, onClick: exportCsv }}
    />
    {visible && <TimelineDrawer
      title={defineMessage({ defaultMessage: 'Log Details' })}
      visible={visible}
      onClose={()=>setVisible(false)}
      data={getDrawerData(current!)}
    />}
  </Loader>
}

export { AdminLogTable }
