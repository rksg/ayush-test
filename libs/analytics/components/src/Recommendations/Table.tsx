import { useMemo, useState, useEffect } from 'react'

import { Checkbox, Switch }                         from 'antd'
import _                                            from 'lodash'
import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import {
  isSwitchPath,
  defaultSort,
  dateSort,
  sortProp
} from '@acx-ui/analytics/utils'
import { Loader, TableProps, Tooltip }        from '@acx-ui/components'
import { get }                                from '@acx-ui/config'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }          from '@acx-ui/formatter'
import { TenantLink, useParams }              from '@acx-ui/react-router-dom'
import { getIntl, noDataDisplay, PathFilter } from '@acx-ui/utils'

import { getParamString } from '../AIDrivenRRM/extra'

import { RecommendationActions, isCrrmOptimizationMatched } from './RecommendationActions'
import {
  useRecommendationListQuery,
  RecommendationListItem,
  useMuteRecommendationMutation,
  useSetPreferenceMutation
} from './services'
import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

type Metadata = { audit?: [{ failure: string }] | undefined }

type RecommendationWithUpdatedMetadata = RecommendationListItem & {
  metadata: Metadata;
}

const DateLink = ({ value, disabled }: { value: RecommendationListItem, disabled: boolean }) => {
  const { activeTab } = useParams()
  return disabled
    ? <Tooltip
      disabled
      title={<FormattedMessage defaultMessage='Not available' />}
      children={formatter(DateFormatEnum.DateTimeFormat)(value.updatedAt)}
    />
    : <TenantLink to={`analytics/recommendations/${activeTab}/${value.id}`}>
      {formatter(DateFormatEnum.DateTimeFormat)(value.updatedAt)}
    </TenantLink>
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> { 'data-row-key': string }

function RowTooltip (props: RowProps) {
  const { $t } = getIntl()
  const row = (props.children as React.ReactNode[])?.filter(
    (child) => _.get(child, 'props.record.id') === props['data-row-key'])[0]
  const showToolTip = String(props.className).includes('table-row-muted')
  const isFullOptimization = _.get(
    row, 'props.record.preferences.fullOptimization', true)
  const fullOptimizationText = defineMessage({ defaultMessage: `
    RUCKUS AI is currently working on optimizing this Zone, with the full
    optimization criteria, where the channel bandwidth and AP Tx
    power will be included in the optimization plan. A new
    recommendation for this zone will be generated only if a better
    channel plan can be found within the next 24 hours.
  ` })
  const partialOptimizationText = defineMessage({ defaultMessage: `
    RUCKUS AI is currently working on optimizing this Zone, without the
    full optimization criteria, where the channel bandwidth and AP Tx
    power will not be included in the optimization plan. A new
    recommendation for this zone will be generated only if a better
    channel plan can be found within the next 24 hours.
  ` })
  return (
    showToolTip
      ? <Tooltip title={$t(isFullOptimization ? fullOptimizationText : partialOptimizationText)}>
        <tr {...props} />
      </Tooltip>
      :<tr {...props} />
  )
}

export const UnknownLink = ({ value }: { value: RecommendationWithUpdatedMetadata }) => {
  const { metadata, statusEnum, updatedAt, sliceValue } = value
  const paramString = getParamString(metadata, statusEnum, updatedAt, sliceValue)
  return <TenantLink to={`analytics/recommendations/crrm/unknown?${paramString}`}>
    {formatter(DateFormatEnum.DateTimeFormat)(value.updatedAt)}
  </TenantLink>
}

const disableMuteStatus: Array<RecommendationListItem['statusEnum']> = [
  'applyscheduled',
  'applyscheduleinprogress',
  'revertscheduled',
  'revertscheduleinprogress'
]

export const crrmStateSort = (itemA: RecommendationListItem, itemB: RecommendationListItem) => {
  const stateA = itemA.crrmOptimizedState!
  const stateB = itemB.crrmOptimizedState!
  return defaultSort(stateA.order, stateB.order)
}

export function RecommendationTable (
  { pathFilters, showCrrm }: { pathFilters: PathFilter, showCrrm?: boolean }
) {
  const intl = useIntl()
  const { $t } = intl

  const [showMuted, setShowMuted] = useState<boolean>(false)

  const [setPreference] = useSetPreferenceMutation()
  const [muteRecommendation] = useMuteRecommendationMutation()
  const [selectedRowData, setSelectedRowData] = useState<{
    id: string,
    isMuted: boolean,
    statusEnum: RecommendationListItem['statusEnum']
  }[]>([])

  const selectedRecommendation = selectedRowData[0]

  const rowActions: TableProps<RecommendationListItem>['rowActions'] = [
    {
      label: $t(selectedRecommendation?.isMuted
        ? defineMessage({ defaultMessage: 'Unmute' })
        : defineMessage({ defaultMessage: 'Mute' })
      ),
      onClick: async () => {
        const { id, isMuted } = selectedRecommendation
        await muteRecommendation({ id, mute: !isMuted }).unwrap()
        setSelectedRowData([])
      },
      disabled: selectedRecommendation
        && selectedRecommendation.statusEnum
        && disableMuteStatus.includes(selectedRecommendation.statusEnum)
    }
  ]

  const optimizationTooltipText = $t({ defaultMessage: `
    When Full Optimization is enabled, AI-Driven RRM will comprehensively optimize the channel plan,
    channel bandwidth and Tx power with the objective of minimizing co-channel interference.
    When it is disabled, only the channel plan will be optimized, using the currently configured
    Zone channel bandwidth and Tx power.
  ` })

  const isCrrmPartialEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_CRRM_PARTIAL),
    useIsSplitOn(Features.CRRM_PARTIAL)
  ].some(Boolean)

  const switchPath = isSwitchPath(pathFilters.path)
  const queryResults = useRecommendationListQuery(
    { ...pathFilters, crrm: showCrrm, isCrrmPartialEnabled },
    { skip: switchPath }
  )
  const data = switchPath ? [] : queryResults?.data?.filter((row) => (showMuted || !row.isMuted))
  const noCrrmData = data?.filter(recommendation => recommendation.code !== 'unknown')

  useEffect(() => {
    setSelectedRowData([])
  }, [queryResults.data])

  const columns: TableProps<RecommendationListItem>['columns'] = useMemo(() => [
    ...(showCrrm ? [{
      title: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone RRM Health' })
        : $t({ defaultMessage: 'Venue RRM Health' }),
      width: 140,
      dataIndex: 'crrmOptimizedState',
      key: 'crrmOptimizedState',
      filterKey: 'crrmOptimizedState.text',
      render: (_, { crrmOptimizedState }) => <UI.OptimizedIcon
        value={crrmOptimizedState!.order}
        text={$t(crrmOptimizedState!.label)}
      />
      ,
      sorter: { compare: crrmStateSort },
      fixed: 'left',
      filterable: true
    }] : [{
      title: $t({ defaultMessage: 'Priority' }),
      width: 90,
      dataIndex: ['priority', 'order'],
      key: 'priorityOrder',
      filterKey: 'priority.text',
      render: (_, value) => <UI.PriorityIcon
        value={value.priority.order}
        text={$t(value.priority.label)}
      />,
      sorter: { compare: sortProp('priority.order', defaultSort) },
      fixed: 'left',
      filterable: true
    }]) as TableProps<RecommendationListItem>['columns'],
    {
      title: $t({ defaultMessage: 'Date' }),
      width: 130,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (_, value) => (value.code === 'unknown')
        ? <UnknownLink value={value as RecommendationWithUpdatedMetadata} />
        : <DateLink
          value={value}
          disabled={!isCrrmOptimizationMatched(value.metadata, value.preferences)}
        />,
      sorter: { compare: sortProp('updatedAt', dateSort) },
      fixed: 'left'
    },
    ...(showCrrm ? [] : [{
      title: $t({ defaultMessage: 'Category' }),
      width: 130,
      dataIndex: 'category',
      key: 'category',
      sorter: { compare: sortProp('category', defaultSort) },
      filterable: true
    }]) as TableProps<RecommendationListItem>['columns'],
    {
      title: $t({ defaultMessage: 'Summary' }),
      width: 250,
      dataIndex: 'summary',
      key: 'summary',
      render: (_, value, __, highlightFn ) => highlightFn(value.summary),
      sorter: { compare: sortProp('summary', defaultSort) },
      searchable: true
    },
    {
      title: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone' })
        : $t({ defaultMessage: 'Venue' }),
      width: 200,
      dataIndex: 'sliceValue',
      key: 'sliceValue',
      render: (_, value, __, highlightFn ) => {
        return <Tooltip placement='top' title={value.scope}>
          {highlightFn(value.sliceValue)}
        </Tooltip>
      },
      sorter: { compare: sortProp('sliceValue', defaultSort) },
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      width: 90,
      dataIndex: 'status',
      key: 'status',
      render: (_, value: RecommendationListItem ) => {
        const { code, statusEnum, status, statusTooltip } = value
        return <Tooltip placement='top' title={code === 'unknown' ? '' : statusTooltip}>
          <UI.Status $statusEnum={statusEnum}>{status}</UI.Status>
        </Tooltip>
      },
      sorter: { compare: sortProp('status', defaultSort) },
      filterable: true
    },
    {
      title: $t({ defaultMessage: 'Actions' }),
      key: 'id',
      dataIndex: 'id',
      width: 100,
      fixed: 'right',
      className: 'actions-column',
      render: (_, value) => <RecommendationActions recommendation={value} />
    },
    ...(showCrrm && isCrrmPartialEnabled ? [{
      title: $t({ defaultMessage: 'Full Optimization' }),
      key: 'preferences',
      dataIndex: 'preferences',
      width: 180,
      fixed: 'right',
      tooltip: optimizationTooltipText,
      render: (_, value) => {
        const { code, statusEnum, idPath } = value
        // eslint-disable-next-line max-len
        const appliedStates = ['applyscheduled', 'applyscheduleinprogress', 'applied', 'revertscheduled', 'revertscheduleinprogress', 'revertfailed', 'applywarning']
        const disabled = appliedStates.includes(statusEnum) ? true : false
        const isOptimized = value.preferences? value.preferences.fullOptimization : true
        const tooltipText = disabled
          ? $t({ defaultMessage: `
            Optimization option cannot be changed while the recommendation is in Applied status.
            Please revert the recommendation back to the New status before changing
            the optimization option.
          ` })
          : ''
        return <Tooltip placement='top' title={tooltipText}>
          <Switch
            defaultChecked
            checked={isOptimized}
            disabled={disabled}
            onChange={() => {
              const updatedPreference = { fullOptimization: !isOptimized }
              setPreference({ code, path: idPath, preferences: updatedPreference })
            }}
          />
        </Tooltip>
      }
    }] : []) as TableProps<RecommendationListItem>['columns']
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [showCrrm]) // '$t' 'basePath' 'intl' are not changing

  return (
    <Loader states={[queryResults]}>
      <UI.RecommendationTableWrapper
        settingsId={`recommendations-${showCrrm ? 'crrm' : 'aiops'}-table`}
        type='tall'
        dataSource={showCrrm ? data : noCrrmData}
        columns={columns}
        rowActions={rowActions}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedRowData.map(val => val.id),
          onChange: (_, [row]) => {
            row && setSelectedRowData([{
              id: row.id,
              isMuted: row.isMuted,
              statusEnum: row.statusEnum
            }])
          }
        }}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        indentSize={6}
        onResetState={() => {
          setShowMuted(false)
          setSelectedRowData([])
        }}
        extraSettings={[
          <Checkbox
            onChange={(e: CheckboxChangeEvent) => setShowMuted(e.target.checked)}
            checked={showMuted}
            children={$t({ defaultMessage: 'Show Muted Recommendations' })}
          />
        ]}
        rowClassName={(record) => (
          record.isMuted || !isCrrmOptimizationMatched(record.metadata, record.preferences)
        ) ? 'table-row-muted' : 'table-row-normal'}
        filterableWidth={155}
        searchableWidth={240}
        components={{ body: { row: RowTooltip } }}
      />
    </Loader>
  )
}
