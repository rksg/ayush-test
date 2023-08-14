import { useContext } from 'react'

import moment                         from 'moment'
import { useIntl, MessageDescriptor } from 'react-intl'

import { defaultSort, sortProp, useAnalyticsFilter, getFilterPayload, kpiConfig, productNames } from '@acx-ui/analytics/utils'
import {
  Loader,
  TableProps,
  Table as CommonTable,
  ConfigChange,
  getConfigChangeEntityTypeMapping,
  Cascader
}                                                    from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { noDataDisplay }             from '@acx-ui/utils'

import { ConfigChangeContext, KPIFilterContext } from '../context'
import { hasConfigChange }                       from '../KPI'
import { useConfigChangeQuery }                  from '../services'

import { Badge, CascaderFilterWrapper }                        from './styledComponents'
import { EntityType, enumTextMap, filterKPIData, jsonMapping } from './util'

export function Table (props: {
  onRowClick?: (params: unknown) => void,
}) {
  const { $t } = useIntl()
  const { kpiFilter, applyKpiFilter } = useContext(KPIFilterContext)
  const { timeRanges: [startDate, endDate] } = useContext(ConfigChangeContext)
  const { path } = useAnalyticsFilter()
  const queryResults = useConfigChangeQuery({
    path,
    start: startDate.toISOString(),
    end: endDate.toISOString()
  }, { selectFromResult: queryResults => ({
    ...queryResults,
    data: filterKPIData(queryResults.data ?? [], kpiFilter)
  }) })

  const ColumnHeaders: TableProps<ConfigChange>['columns'] = [
    {
      key: 'timestamp',
      title: $t({ defaultMessage: 'Timestamp' }),
      dataIndex: 'timestamp',
      render: (_, { timestamp }) =>
        formatter(DateFormatEnum.DateTimeFormat)(moment(Number(timestamp))),
      sorter: { compare: sortProp('timestamp', defaultSort) },
      width: 130
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Entity Type' }),
      dataIndex: 'type',
      render: (_, row) => {
        const config = getConfigChangeEntityTypeMapping().find(type => type.key === row.type)
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
        const value = jsonMapping[type as EntityType].configMap.get(key, key)
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
          const mapped = enumTextMap.get(
            `${(jsonMapping[type as EntityType].enumMap).get(key, '')}-${value}`, value)
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
          const mapped = enumTextMap.get(
            `${(jsonMapping[type as EntityType].enumMap).get(key, '')}-${value}`, value)
          return (typeof mapped === 'string')
            ? mapped : $t(mapped as MessageDescriptor)
        })
        return generateValues.join(', ')
      },
      sorter: { compare: sortProp('newValues', defaultSort) }
    }
  ]

  const rowSelection = {
    // TODO: need to handle sync betweem chart and table
    onChange: (selectedRowKeys: React.Key[], selectedRows: ConfigChange[]) => {
      props.onRowClick?.({ id: selectedRowKeys[0], value: selectedRows[0] })
    }
  }

  const options = Object.keys(kpiConfig).reduce((agg, key)=> {
    const config = kpiConfig[key as keyof typeof kpiConfig]
    if(hasConfigChange(config)){
      agg.push({ value: key, label: $t(config.configChange.text || config.text, productNames) })
    }
    return agg
  }, [] as { value: string, label: string }[])

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
      />
    </Loader>
  </>
}
