import { useEffect, useState } from 'react'

import _                          from 'lodash'
import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button, Filter } from '@acx-ui/components'
import { DateFormatEnum, formatter }                 from '@acx-ui/formatter'
import { DownloadOutlined }                          from '@acx-ui/icons'
import { useDownloadEventsCSVMutation }              from '@acx-ui/rc/services'
import { AdminLog, RequestPayload, TableQuery }      from '@acx-ui/rc/utils'
import { useParams }                                 from '@acx-ui/react-router-dom'
import { useUserProfileContext }                     from '@acx-ui/user'
import { useDateFilter }                             from '@acx-ui/utils'

import { TimelineDrawer } from '../TimelineDrawer'

import { filtersFrom, getDescription, getSource, valueFrom } from './helpers'
import { adminLogTypeMapping, severityMapping }              from './mapping'

interface AdminLogTableProps {
  tableQuery: TableQuery<AdminLog, RequestPayload<unknown>, unknown>
}

const AdminLogTable = ({ tableQuery }: AdminLogTableProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<AdminLog>()
  const [ downloadCsv ] = useDownloadEventsCSVMutation()
  const params = useParams()
  const { data: userProfileData } = useUserProfileContext()
  const { startDate, endDate } = useDateFilter()
  const tableData = tableQuery.data?.data ?? []
  useEffect(() => { setVisible(false) },[tableQuery.data?.data])

  const columns: TableProps<AdminLog>['columns'] = [
    {
      key: 'event_datetime',
      title: $t({ defaultMessage: 'Date' }),
      dataIndex: 'event_datetime',
      defaultSortOrder: 'descend',
      sorter: true,
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
      sorter: true,
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
      title: defineMessage({ defaultMessage: 'Source' }),
      value: getSource(data)
    },
    {
      title: defineMessage({ defaultMessage: 'Description' }),
      value: getDescription(data)
    }
  ]

  const payload = {
    clientDateFormat: userProfileData.dateFormat.replace('mm', 'MM'),
    clientTimeZone: moment.tz.guess(),
    detailLevel: userProfileData.detailLevel,
    eventsPeriodForExport: {
      fromTime: moment.utc(startDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      toTime: moment.utc(endDate).format('YYYY-MM-DDTHH:mm:ss[Z]')
    },
    fields: ['event_datetime', 'severity', 'entity_type', 'entity_id', 'message'],
    filters: _.omit(tableQuery?.payload?.filters as Filter, ['fromTime', 'toTime']),
    isSupport: false,
    searchString: tableQuery?.payload?.searchString as string,
    searchTargetFields: tableQuery?.payload?.searchTargetFields as string[],
    sortField: 'event_datetime',
    sortOrder: 'DESC',
    tenantId: params.tenantId!
  }

  const exportButton = {
    icon: <DownloadOutlined />,
    disabled: !(tableData && tableData.length > 0),
    onClick: () => downloadCsv(payload)
  }

  return <Loader states={[tableQuery]}>
    <Table
      rowKey='id'
      columns={columns}
      dataSource={tableData}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      enableApiFilter={true}
      headerButton={exportButton}
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
