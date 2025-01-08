import { useContext } from 'react'

import { isEmpty } from 'lodash'
import { useIntl } from 'react-intl'

import { kpiConfig, productNames, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Button,
  Cascader,
  ConfigChange,
  getConfigChangeEntityTypeMapping,
  GridCol,
  resetZoomCallback,
  SearchInput,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { DownloadOutlined }                 from '@acx-ui/icons'
import { PathFilter, exportMessageMapping } from '@acx-ui/utils'

import { ConfigChangeContext }     from '../context'
import { hasConfigChange }         from '../KPI'
import { useColumns }              from '../PagedTable'
import { useDownloadConfigChange } from '../services'

import { handleConfigChangeDownload } from './handleConfigChangeDownload'
import { CascaderFilterWrapper }      from './styledComponents'

export const Search = () => {
  const { $t } = useIntl()
  const { entityNameSearch, setEntityNameSearch } = useContext(ConfigChangeContext)
  const placeHolderText =$t({ defaultMessage: 'Search Entity Name' })
  return <SearchInput
    onChange={e => setEntityNameSearch(e.target.value)}
    placeholder={placeHolderText}
    title={placeHolderText}
    value={entityNameSearch}
    allowClear
  />
}

export const KPIFilter = () => {
  const { $t } = useIntl()
  const { kpiFilter, applyKpiFilter } = useContext(ConfigChangeContext)
  const options = Object.keys(kpiConfig).reduce((agg, key)=> {
    const config = kpiConfig[key as keyof typeof kpiConfig]
    if(hasConfigChange(config)){
      agg.push({ value: key, label: $t(config.configChange.text || config.text, productNames) })
    }
    return agg
  }, [] as { value: string, label: string }[])
  return <CascaderFilterWrapper>
    <Cascader
      multiple
      defaultValue={kpiFilter.map(kpi => [kpi])}
      placeholder={$t({ defaultMessage: 'Add KPI filter' })}
      options={options}
      onApply={selectedOptions =>
        applyKpiFilter(selectedOptions?.length ? selectedOptions?.flat() as string[] : [])
      }
      allowClear
    />
  </CascaderFilterWrapper>
}

export const EntityTypeFilter = () => {
  const showIntentAI = [
    useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE)
  ].some(Boolean)

  const { $t } = useIntl()
  const { entityTypeFilter, setEntityTypeFilter } = useContext(ConfigChangeContext)
  const entityTypeMapping = getConfigChangeEntityTypeMapping(showIntentAI)
    .map(ele => ({ value: ele.key, label: ele.label }))
  return <CascaderFilterWrapper>
    <Cascader
      multiple
      defaultValue={entityTypeFilter.map(entity => [entity])}
      placeholder={$t({ defaultMessage: 'Entity Type' })}
      options={entityTypeMapping}
      onApply={selectedOptions =>
        setEntityTypeFilter(selectedOptions?.length ? selectedOptions?.flat() as string[] : [])
      }
      allowClear
    />
  </CascaderFilterWrapper>
}

export const Reset = () => {
  const { $t } = useIntl()
  const {
    entityTypeFilter, kpiFilter, entityNameSearch, resetFilter
  } = useContext(ConfigChangeContext)
  return (!isEmpty(entityTypeFilter) || !isEmpty(kpiFilter) || entityNameSearch !== '')
    ? <Button onClick={resetFilter}>{$t({ defaultMessage: 'Clear Filters' })}</Button>
    : null
}

export const ResetZoom = () => {
  const { $t } = useIntl()
  const {
    chartZoom, initialZoom
  } = useContext(ConfigChangeContext)
  const canResetZoom =
    (initialZoom?.start !== undefined || initialZoom?.end !== undefined) &&
    (chartZoom?.start !== initialZoom?.start || chartZoom?.end !== initialZoom?.end)
  return canResetZoom ?
    <Button onClick={resetZoomCallback}>{$t({ defaultMessage: 'Reset Zoom' })}</Button> : null
}

function useDownload () {
  const showIntentAI = [
    useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE)
  ].some(Boolean)

  const [download] = useDownloadConfigChange()

  const onDownloadClick = async (
    payload: PathFilter,
    columns: TableProps<ConfigChange>['columns']
  ) => {
    const entityTypeMapping = getConfigChangeEntityTypeMapping(showIntentAI)
    const data = await download(payload)
      .unwrap()
      .catch((error) => { console.error(error) }) // eslint-disable-line no-console
    handleConfigChangeDownload(data!, columns, entityTypeMapping, payload)
  }
  return { onDownloadClick }
}

export const Download = () => {
  const { $t } = useIntl()
  const { pathFilters } = useAnalyticsFilter()
  const { timeRanges: [startDate, endDate], pagination,
    entityList, kpiFilter, entityNameSearch, entityTypeFilter
  } = useContext(ConfigChangeContext)
  const { columnHeaders } = useColumns()
  const { onDownloadClick } = useDownload()
  const payload = {
    ...pathFilters,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    filterBy: {
      kpiFilter,
      entityName: entityNameSearch,
      entityType: entityTypeFilter.length === 0
        ? entityList.map(t => t.key) : entityTypeFilter
    }
  }
  return <Tooltip title={$t(exportMessageMapping.EXPORT_TO_CSV)}>
    <Button
      icon={<DownloadOutlined />}
      disabled={pagination.total === 0}
      onClick={async () => await onDownloadClick(payload, columnHeaders)}
    /></Tooltip>
}

export const Filter = () => {
  return <>
    <GridCol col={{ span: 7 }}><Search/></GridCol>
    <GridCol col={{ span: 6 }}><KPIFilter/></GridCol>
    <GridCol col={{ span: 4, xxl: 6 }}><EntityTypeFilter/></GridCol>
    <GridCol col={{ span: 3, xxl: 2 }}><Reset/></GridCol>
    <GridCol col={{ span: 3, xxl: 2 }}><ResetZoom/></GridCol>
    <GridCol col={{ span: 1 }}><Download/></GridCol>
  </>
}
