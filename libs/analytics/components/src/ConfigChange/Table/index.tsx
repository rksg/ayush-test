import { useContext } from 'react'

import { CSVLink }                    from 'react-csv'
import { useIntl, MessageDescriptor } from 'react-intl'

import { defaultSort, sortProp, useAnalyticsFilter, kpiConfig, productNames } from '@acx-ui/analytics/utils'
import {
  Loader,
  TableProps,
  Table as CommonTable,
  ConfigChange,
  getConfigChangeEntityTypeMapping,
  Cascader
}                                                    from '@acx-ui/components'
import { LinkDocumentIcon } from '@acx-ui/icons'
import { noDataDisplay }    from '@acx-ui/utils'

import { ConfigChangeContext, KPIFilterContext } from '../context'
import { hasConfigChange }                       from '../KPI'
import { useConfigChangeQuery }                  from '../services'

import { Badge, CascaderFilterWrapper }                                                 from './styledComponents'
import { filterData, formatTimestamp, getConfiguration, getEntityType, getEntityValue } from './util'

export function Table (props: {
  selected: ConfigChange | null,
  onRowClick: (params: ConfigChange) => void,
  pagination: { current: number, pageSize: number },
  setPagination: (params: { current: number, pageSize: number }) => void,
  dotSelect: number | null,
  legend: Record<string, boolean>
}) {
  const { $t } = useIntl()
  const { kpiFilter, applyKpiFilter } = useContext(KPIFilterContext)
  const { timeRanges: [startDate, endDate] } = useContext(ConfigChangeContext)
  const { pathFilters } = useAnalyticsFilter()
  const { selected, onRowClick, pagination, setPagination, dotSelect, legend } = props
  const legendList = Object.keys(legend).filter(key => legend[key])

  const queryResults = useConfigChangeQuery({
    ...pathFilters,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  }, { selectFromResult: queryResults => ({
    ...queryResults,
    data: filterData(queryResults.data ?? [], kpiFilter, legendList)
  }) })

  const ColumnHeaders: TableProps<ConfigChange>['columns'] = [
    {
      key: 'timestamp',
      title: $t({ defaultMessage: 'Timestamp' }),
      dataIndex: 'timestamp',
      render: (_, { timestamp }) => formatTimestamp(timestamp),
      sorter: { compare: sortProp('timestamp', defaultSort) },
      width: 130
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Entity Type' }),
      dataIndex: 'type',
      render: (_, row) => {
        const config = getEntityType(row.type)
        return config ? <Badge key={row.id} color={config.color} text={config.label}/> : row.type
      },
      filterable: getConfigChangeEntityTypeMapping()
        .map(({ label, ...rest }) => ({ ...rest, value: label })),
      sorter: { compare: sortProp('type', defaultSort) },
      width: 100
    },
    {
      key: 'name',
      title: $t({ defaultMessage: 'Entity Name' }),
      dataIndex: 'name',
      render: (_, { name }, __, highlightFn) => highlightFn(String(name)),
      searchable: true,
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      key: 'key',
      title: $t({ defaultMessage: 'Configuration' }),
      dataIndex: 'key',
      render: (_, { type, key }) => {
        const value = getConfiguration(type, key)
        return (typeof value === 'string') ? value : $t(value as MessageDescriptor)
      },
      sorter: { compare: sortProp('key', defaultSort) }
    },
    {
      key: 'oldValues',
      title: $t({ defaultMessage: 'Change From' }),
      dataIndex: ['oldValues'],
      align: 'center',
      render: (_, { oldValues, type, key }) => {
        const generateValues = oldValues?.map(value => {
          const mapped = getEntityValue(type, key, value)
          return (typeof mapped === 'string')
            ? mapped : $t(mapped as MessageDescriptor)
        })
        return generateValues.join(', ')
      },
      sorter: { compare: sortProp('oldValues', defaultSort) }
    },
    {
      key: 'newValues',
      title: $t({ defaultMessage: 'Change To' }),
      dataIndex: ['newValues'],
      align: 'center',
      render: (_, { newValues, type, key }) => {
        const generateValues = newValues?.map(value => {
          const mapped = getEntityValue(type, key, value)
          return (typeof mapped === 'string')
            ? mapped : $t(mapped as MessageDescriptor)
        })
        return generateValues.join(', ')
      },
      sorter: { compare: sortProp('newValues', defaultSort) }
    }
  ]

  const rowSelection = {
    onChange: (_: React.Key[], selectedRows: ConfigChange[]) => {
      onRowClick?.(selectedRows[0])
    },
    ...(selected === null ? { selectedRowKeys: [] } : { selectedRowKeys: [selected.id!] })
  }

  const handlePaginationChange = (current: number, pageSize: number) => {
    setPagination({ current, pageSize })
  }

  const options = Object.keys(kpiConfig).reduce((agg, key)=> {
    const config = kpiConfig[key as keyof typeof kpiConfig]
    if(hasConfigChange(config)){
      agg.push({ value: key, label: $t(config.configChange.text || config.text, productNames) })
    }
    return agg
  }, [] as { value: string, label: string }[])

  const csvData = queryResults.data?.map(item => {
    const configValue = getConfiguration(item.type, item.key)

    const generateOldValues = item.oldValues?.map(value => {
      const mapped = getEntityValue(item.type, item.key, value)
      return (typeof mapped === 'string')
        ? mapped : $t(mapped as MessageDescriptor)
    })

    const generateNewValues = item.newValues?.map(value => {
      const mapped = getEntityValue(item.type, item.key, value)
      return (typeof mapped === 'string')
        ? mapped : $t(mapped as MessageDescriptor)
    })

    return ({
      timestamp: formatTimestamp(item.timestamp),
      type: getEntityType(item.type)?.label,
      name: String(item.name),
      key: (typeof configValue === 'string')
        ? configValue
        : $t(configValue as MessageDescriptor),
      oldValues: generateOldValues.join(', '),
      newValues: generateNewValues.join(', ')
    })})

  return <>
    <CascaderFilterWrapper>
      <Cascader
        multiple
        defaultValue={kpiFilter.map(kpi=>[kpi])}
        placeholder={$t({ defaultMessage: 'Add KPI filter' })}
        options={options}
        onApply={selectedOptions =>
          applyKpiFilter(selectedOptions?.length ? selectedOptions?.flat() as string[] : [])}
        allowClear
      />
    </CascaderFilterWrapper>
    <Loader states={[queryResults]}>
      <CommonTable
        settingsId='config-change-table'
        columns={ColumnHeaders}
        dataSource={queryResults.data}
        rowSelection={{ type: 'radio', ...rowSelection }}
        tableAlertRender={false}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        pagination={{
          ...pagination,
          onChange: handlePaginationChange
        }}
        key={dotSelect}
      />
      <div>
        <LinkDocumentIcon />
        <CSVLink
          data={csvData}
          headers={[
            { label: 'Timestamp', key: 'timestamp' },
            { label: 'Entity Type', key: 'type' },
            { label: 'Entity Name', key: 'name' },
            { label: 'Configuration', key: 'key' },
            { label: 'Change From', key: 'oldValues' },
            { label: 'Change To', key: 'newValues' }
          ]}
          filename='config-change-data.csv'
        >
          Download config change
        </CSVLink>
      </div>
    </Loader>
  </>
}
