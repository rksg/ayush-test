import { useContext, useEffect } from 'react'

import { SorterResult }               from 'antd/lib/table/interface'
import moment                         from 'moment'
import { useIntl, MessageDescriptor } from 'react-intl'

import {
  useAnalyticsFilter,
  formattedPath,
  impactedArea
}                                    from '@acx-ui/analytics/utils'
import {
  Loader,
  TableProps,
  Table as CommonTable,
  ConfigChange,
  getConfigChangeEntityTypeMapping,
  Filter,
  Tooltip
}                                    from '@acx-ui/components'
import { ConfigChangePaginationParams } from '@acx-ui/components'
import { get }                          from '@acx-ui/config'
import { Features, useAnySplitsOn }     from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }    from '@acx-ui/formatter'
import { TenantLink }                   from '@acx-ui/react-router-dom'
import { hasPermission }                from '@acx-ui/user'
import { noDataDisplay }                from '@acx-ui/utils'

import { ConfigChangeContext }                                       from '../context'
import { usePagedConfigChangeQuery, PagedConfigChange, SORTER_ABBR } from '../services'

import { Badge }                                from './styledComponents'
import { EntityType, enumTextMap, jsonMapping } from './util'

export const DEFAULT_SORTER = {
  sortField: 'timestamp',
  sortOrder: SORTER_ABBR.DESC
}

export const transferSorter = (order:string) => {
  switch(order){
    case 'ascend':
      return SORTER_ABBR.ASC
    case 'descend':
      return SORTER_ABBR.DESC
    default:
      return DEFAULT_SORTER.sortOrder
  }
}

export const useColumns = () => {
  const showIntentAI = useAnySplitsOn([
    Features.INTENT_AI_CONFIG_CHANGE_TOGGLE,
    Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE
  ])

  const { $t } = useIntl()
  const entityTypeMapping = getConfigChangeEntityTypeMapping(Boolean(showIntentAI))
  const columnHeaders: TableProps<PagedConfigChange['data'][0]>['columns'] = [
    {
      key: 'timestamp',
      title: $t({ defaultMessage: 'Timestamp' }),
      dataIndex: 'timestamp',
      render: (_, row) => {
        const timestamp = formatter(DateFormatEnum.DateTimeFormat)(moment(Number(row.timestamp)))
        const isMLISA = get('IS_MLISA_SA')
        if (showIntentAI && row.type === 'intentAI' &&
          (isMLISA ? hasPermission({ permission: 'READ_INTENT_AI' }) : true)) {
          const code = row.key.substring(row.key.lastIndexOf('.') + 1)
          const linkPath = isMLISA
            ? `/intentAI/${row.root}/${row.sliceId}/${code}`
            : `/analytics/intentAI/${row.sliceId}/${code}`
          return (
            <TenantLink to={linkPath}>
              {timestamp}
            </TenantLink>
          )
        }
        return timestamp
      },
      defaultSortOrder: 'descend',
      sorter: true,
      width: 130
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Entity' }),
      dataIndex: 'type',
      render: (_, row) => {
        const config = entityTypeMapping.find(type => type.key === row.type)
        return config ? <Badge key={row.id} color={config.color} text={config.label}/> : row.type
      },
      width: 100
    },
    {
      key: 'name',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'name',
      render: (_, value, __, highlightFn ) => {
        const { name } = value
        if(!showIntentAI){
          return highlightFn(String(name))
        } else {
          const { path, sliceValue } = value
          const scope = impactedArea(path!, sliceValue!) as string
          return <Tooltip
            placement='top'
            title={formattedPath(path!, sliceValue!)}
            dottedUnderline={true}
          >
            {highlightFn(scope)}
          </Tooltip>
        }
      },
      searchable: true
    },
    {
      key: 'key',
      title: $t({ defaultMessage: 'Configuration / Intent' }),
      dataIndex: 'key',
      render: (_, { type, key }) => {
        const value = jsonMapping[type as EntityType].configMap.get(key, key)
        return (typeof value === 'string') ? value : $t(value as MessageDescriptor)
      }
    },
    {
      key: 'oldValues',
      title: $t({ defaultMessage: 'Old Value' }),
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
      }
    },
    {
      key: 'newValues',
      title: $t({ defaultMessage: 'New Value / Action' }),
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
      }
    }
  ]
  return { columnHeaders }
}

export function PagedTable () {
  const showIntentAI = useAnySplitsOn([
    Features.INTENT_AI_CONFIG_CHANGE_TOGGLE,
    Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE
  ])

  const { pathFilters } = useAnalyticsFilter()
  const {
    timeRanges: [startDate, endDate],
    entityList, kpiFilter,
    entityNameSearch, setEntityNameSearch,
    entityTypeFilter, setEntityTypeFilter,
    pagination, applyPagination,
    selected, onRowClick,
    sorter, setSorter
  } = useContext(ConfigChangeContext)

  const basicPayload = {
    ...pathFilters,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    showIntentAI: showIntentAI ?? false
  }

  const queryResults = usePagedConfigChangeQuery({
    ...basicPayload,
    page: pagination.current,
    pageSize: pagination.pageSize,
    filterBy: {
      kpiFilter,
      entityName: entityNameSearch,
      entityType: entityTypeFilter.length === 0
        ? entityList.map(t => t.key) : entityTypeFilter
    },
    sortBy: sorter
  }, { skip: showIntentAI === null })

  useEffect(
    ()=> applyPagination({ total: queryResults.data?.total || 0 }),
    [queryResults]
  )

  const { columnHeaders } = useColumns()

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
    setEntityNameSearch(search.searchString || '')
    setEntityTypeFilter((filters?.type as string[]) || [])
  }

  const handleTableChange: TableProps<ConfigChange>['onChange'] = (
    _, __, customSorter, customAction
  ) => {
    const order = (customSorter as SorterResult<ConfigChange>).order
    customAction.action === 'sort' && setSorter(transferSorter(order!))
  }

  return <Loader states={[queryResults]}>
    <CommonTable
      settingsId='config-change-table'
      columns={columnHeaders}
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
      enableApiFilter={true}
      onFilterChange={handleFilterChange}
      onChange={handleTableChange}
      highLightValue={entityNameSearch}
      preventRenderHeader
      stickyOffsetY={47}
    />
  </Loader>
}
