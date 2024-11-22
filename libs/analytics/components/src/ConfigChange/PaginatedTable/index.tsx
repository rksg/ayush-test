import { useContext } from 'react'

import _                              from 'lodash'
import moment                         from 'moment'
import { useIntl, MessageDescriptor } from 'react-intl'

import { defaultSort, sortProp, useAnalyticsFilter, kpiConfig, productNames } from '@acx-ui/analytics/utils'
import {
  Loader,
  TableProps,
  Table as CommonTable,
  ConfigChange,
  getConfigChangeEntityTypeMapping,
  Cascader,
  Filter,
  CONFIG_CHANGE_DEFAULT_PAGINATION
}                                    from '@acx-ui/components'
import { ConfigChangePaginationParams } from '@acx-ui/components'
import { DateFormatEnum, formatter }    from '@acx-ui/formatter'
import { noDataDisplay }                from '@acx-ui/utils'

import { ConfigChangeContext }                          from '../context'
import { hasConfigChange }                              from '../KPI'
import { usePagedConfigChangeQuery, PagedConfigChange } from '../services'

import { Badge, CascaderFilterWrapper }         from './styledComponents'
import { EntityType, enumTextMap, jsonMapping } from './util'

export function PaginatedTable () {
  const { $t } = useIntl()
  const { pathFilters } = useAnalyticsFilter()
  const {
    timeRanges: [startDate, endDate],
    kpiFilter, applyKpiFilter,
    legendFilter, entityNameSearch, setEntityNameSearch, entityTypeFilter, setEntityTypeFilter,
    pagination, applyPagination,
    selected, dotSelect, onRowClick
  } = useContext(ConfigChangeContext)

  const entityTypeMapping = getConfigChangeEntityTypeMapping()

  const queryResults = usePagedConfigChangeQuery({
    ...pathFilters,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
    filterBy: {
      kpiFilter,
      entityName: entityNameSearch,
      entityType: legendFilter.filter(t => (
        _.isEmpty(entityTypeFilter) || entityTypeFilter.includes(t)))
    }
  })

  const ColumnHeaders: TableProps<PagedConfigChange['data'][0]>['columns'] = [
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
        const config = entityTypeMapping.find(type => type.key === row.type)
        return config ? <Badge key={row.id} color={config.color} text={config.label}/> : row.type
      },
      filterable: entityTypeMapping.map(({ label, ...rest }) => ({ ...rest, value: label })),
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
    onChange: (_: React.Key[], selectedRows: ConfigChange[]) => {
      onRowClick?.(selectedRows[0])
    },
    ...(selected === null ? { selectedRowKeys: [] } : { selectedRowKeys: [selected.id!] })
  }

  const handlePaginationChange = (
    current: ConfigChangePaginationParams['current'],
    pageSize: ConfigChangePaginationParams['pageSize']
  ) => {
    applyPagination({ current, pageSize })
  }

  const handleFilterChange = (
    filters: Filter, search: { searchString?: string }
  ) => {
    applyPagination(CONFIG_CHANGE_DEFAULT_PAGINATION)
    setEntityNameSearch(search.searchString || '')
    setEntityTypeFilter((filters?.type as string[]) || [])
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
        dataSource={queryResults.data?.data}
        rowSelection={{ type: 'radio', ...rowSelection }}
        tableAlertRender={false}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        pagination={{
          ...pagination,
          total: queryResults.data?.total || 0,
          onChange: handlePaginationChange
        }}
        key={dotSelect}
        enableApiFilter={true}
        onFilterChange={handleFilterChange}
      />
    </Loader>
  </>
}
