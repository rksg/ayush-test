import { useEffect, useMemo, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { useAlarmsListQuery }                    from '@acx-ui/rc/services'
import { Alarm, CommonUrlsInfo, useTableQuery }  from '@acx-ui/rc/utils'

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<Alarm>['columns'] = useMemo(() => [
    {
      key: 'startTime',
      title: $t({ defaultMessage: 'Alarm Time' }),
      dataIndex: 'startTime',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      key: 'severity',
      title: $t({ defaultMessage: 'Severity' }),
      dataIndex: 'severity',
      sorter: true
    },
    {
      key: 'message',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'message',
      sorter: false
    }
  ], [$t])

  return columns
}

const defaultPayload = {
  url: CommonUrlsInfo.getAlarmsList.url,
  fields: [
    'startTime',
    'severity',
    'message',
    'entity_id',
    'id',
    'serialNumber',
    'entityType',
    'entityId',
    'entity_type',
    'venueName',
    'apName',
    'switchName',
    'sourceType'
  ]
}

const defaultArray: Alarm[] = []

export function AlarmsTable () {
  const { $t } = useIntl()
  const AlarmsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useAlarmsListQuery,
      defaultPayload,
      sorter: {
        sortField: 'startTime',
        sortOrder: 'DESC'
      }
    })
    const [tableData, setTableData] = useState(defaultArray)
    useEffect(()=>{
      if (tableQuery.data?.data) {
        setTableData(tableQuery.data.data)
      }
    }, [tableQuery.data])

    return <Loader states={[tableQuery]}>
      <Table columns={useColumns()}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        style={{ width: '800px' }}
        rowKey='id' />
    </Loader>
  }

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Alarms' })}
    />
    <AlarmsTable />
  </>
}
