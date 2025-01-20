import { useContext } from 'react'

import moment                         from 'moment'
import { useIntl, MessageDescriptor } from 'react-intl'

import {
  defaultSort,
  sortProp,
  useAnalyticsFilter,
  kpiConfig,
  productNames,
  formattedPath,
  impactedArea
}                                    from '@acx-ui/analytics/utils'
import {
  Loader,
  TableProps,
  Table as CommonTable,
  ConfigChange,
  getConfigChangeEntityTypeMapping,
  Cascader,
  Tooltip
}                                              from '@acx-ui/components'
import { get }                                 from '@acx-ui/config'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }           from '@acx-ui/formatter'
import { DownloadOutlined }                    from '@acx-ui/icons'
import { TenantLink }                          from '@acx-ui/react-router-dom'
import { exportMessageMapping, noDataDisplay } from '@acx-ui/utils'

import { ConfigChangeContext }  from '../context'
import { hasConfigChange }      from '../KPI'
import { useConfigChangeQuery } from '../services'

import { downloadConfigChangeList }                     from './download'
import { Badge, CascaderFilterWrapper }                 from './styledComponents'
import { filterData, getConfiguration, getEntityValue } from './util'

export function Table () {
  const showIntentAI = [
    useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE)
  ].some(Boolean)

  const { $t } = useIntl()
  const { pathFilters } = useAnalyticsFilter()
  const {
    timeRanges: [startDate, endDate],
    kpiFilter, applyKpiFilter,
    legendFilter,
    pagination, applyPagination,
    selected, onRowClick, dotSelect
  } = useContext(ConfigChangeContext)

  const basicQueryPayload = {
    ...pathFilters,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    showIntentAI
  }

  const queryResults = useConfigChangeQuery(basicQueryPayload,
    { selectFromResult: queryResults => ({
      ...queryResults,
      data: filterData(queryResults.data ?? [], kpiFilter, legendFilter)
    }) })

  const entityTypeMapping = getConfigChangeEntityTypeMapping(showIntentAI)

  const ColumnHeaders: TableProps<ConfigChange>['columns'] = [
    {
      key: 'timestamp',
      title: $t({ defaultMessage: 'Timestamp' }),
      dataIndex: 'timestamp',
      render: (_, row) => {
        const timestamp = formatter(DateFormatEnum.DateTimeFormat)(moment(Number(row.timestamp)))
        if (showIntentAI && row.type === 'intentAI') {
          const code = row.key.substring(row.key.lastIndexOf('.') + 1)
          const linkPath = get('IS_MLISA_SA')
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
      sorter: { compare: sortProp('timestamp', defaultSort) },
      width: 130
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Entity Type' }),
      dataIndex: 'type',
      render: (_, row) => {
        const config = entityTypeMapping.find(type => type.key === row.type)!
        return <Badge key={row.id} color={config.color} text={config.label}/>
      },
      filterable: entityTypeMapping.map(({ label, ...rest }) => ({ ...rest, value: label })),
      sorter: { compare: sortProp('type', defaultSort) },
      width: 100
    },
    {
      key: 'name',
      title: $t({ defaultMessage: 'Entity Name' }),
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
  const handlePaginationChange = (current: number, pageSize: number) =>
    applyPagination({ current, pageSize })

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
        pagination={{
          ...pagination,
          onChange: handlePaginationChange
        }}
        key={dotSelect}
        iconButton={{
          icon: <DownloadOutlined />,
          disabled: !Boolean(queryResults.data?.length),
          tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
          onClick: () => {
            downloadConfigChangeList(
              queryResults.data,
              ColumnHeaders,
              entityTypeMapping,
              basicQueryPayload
            )}
        }}
      />
    </Loader>
  </>
}
