import { useMemo, useCallback } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import { defaultSort, dateSort, sortProp } from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, Card } from '@acx-ui/components'
import { DateFormatEnum, formatter }       from '@acx-ui/formatter'
import { DownloadOutlined }                from '@acx-ui/icons-new'
import { TenantLink }                      from '@acx-ui/react-router-dom'
import { handleBlobDownloadFile }          from '@acx-ui/utils'

import { usePoePdTableQuery, ImpactedSwitch } from './services'

import type { ChartProps } from '../types.d'

export function PoePdTable (props: ChartProps) {
  const { $t } = useIntl()
  const queryResults = usePoePdTableQuery({ id: props.incident.id })
  const columnHeaders: TableProps<ImpactedSwitch>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'Switch Name' })),
      dataIndex: 'name',
      key: 'name',
      render: (_, { mac, serial, name }, __, highlightFn) => <TenantLink
        to={`devices/switch/${mac.toLowerCase()}/${serial}/details/overview`}
        children={highlightFn(name)}
      />,
      fixed: 'left',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'MAC Address' })),
      dataIndex: 'mac',
      key: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) },
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Port Number' })),
      dataIndex: 'portNumber',
      key: 'portNumber',
      sorter: { compare: sortProp('portNumber', defaultSort) },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Event Time' })),
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (_, value) =>
        formatter(DateFormatEnum.DateTimeFormat)(value.eventTime),
      sorter: { compare: sortProp('eventTime', dateSort) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' is not changing

  const handleExportCSV = useCallback(() => {
    const headers = columnHeaders.map(col => col.title)
    const csvData = queryResults.data!.map(row =>
      columnHeaders.map(col => {
        let value = row[col.dataIndex as keyof typeof row]
        if (col.key === 'eventTime') {
          value = formatter(DateFormatEnum.DateTimeFormat)(value as string)
        }
        return value || '--'
      })
    )

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(value => `"${value}"`).join(','))
    ].join('\n')

    handleBlobDownloadFile(
      new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
      `Impacted-Switches-PoE-${props.incident.id}.csv`
    )
  }, [columnHeaders, queryResults.data, props.incident.id])

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Impacted Switches' })} type='no-border'>
        <Table
          type='tall'
          dataSource={queryResults.data}
          columns={columnHeaders}
          iconButton={queryResults.data && queryResults.data.length > 0 ? {
            icon: <DownloadOutlined />,
            onClick: handleExportCSV,
            tooltip: $t({ defaultMessage: 'Export to CSV' })
          } : undefined}
        />
      </Card>
    </Loader>
  )
}
