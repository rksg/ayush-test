import { useMemo, useState, useEffect, Children } from 'react'

import { Checkbox, Typography, Switch }             from 'antd'
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

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> { 'data-row-key': string }

function RowTooltip (props: RowProps) {
  const { $t } = getIntl()
  const row = Children.toArray(props.children).filter(
    (child) => _.get(child, 'props.record.id') === props['data-row-key'])[0]
  const showToolTip = String(props.className).includes('crrm-optimization-mismatch')
  const isFullOptimization = _.get(
    row, 'props.record.preferences.crrmFullOptimization', true)
  const fullOptimizationText = get('IS_MLISA_SA')
    ? defineMessage({ defaultMessage: `
      RUCKUS AI is currently working on optimizing this zone, with the full
      optimization criteria, where the channel bandwidth and AP Tx
      power will be included in the optimization plan. A new
      recommendation for this zone will be generated only if a better
      channel plan can be found within the next 24 hours.
    ` })
    : defineMessage({ defaultMessage: `
      RUCKUS AI is currently working on optimizing this venue, with the full
      optimization criteria, where the channel bandwidth and AP Tx
      power will be included in the optimization plan. A new
      recommendation for this venue will be generated only if a better
      channel plan can be found within the next 24 hours.
    ` })
  const partialOptimizationText = get('IS_MLISA_SA')
    ? defineMessage({ defaultMessage: `
      RUCKUS AI is currently working on optimizing this zone, without the
      full optimization criteria, where the channel bandwidth and AP Tx
      power will not be included in the optimization plan. A new
      recommendation for this zone will be generated only if a better
      channel plan can be found within the next 24 hours.
    ` })
    : defineMessage({ defaultMessage: `
      RUCKUS AI is currently working on optimizing this venue, without the
      full optimization criteria, where the channel bandwidth and AP Tx
      power will not be included in the optimization plan. A new
      recommendation for this venue will be generated only if a better
      channel plan can be found within the next 24 hours.
    ` })
  return (
    showToolTip
      ? <Tooltip title={$t(isFullOptimization ? fullOptimizationText : partialOptimizationText)}>
        <tr {...props} />
      </Tooltip>
      : <tr {...props} />
  )
}

const Link = (
  { text, to, disabled }: { text: string, to: string, disabled: boolean }
) => {
  return disabled
    ? <Tooltip
      title={<FormattedMessage defaultMessage='Not available' />}
      children={<Typography.Text disabled children={text} />}
    />
    : <TenantLink to={to} children={text} />
}

const DateLink = (
  { value, disabled }: { value: RecommendationListItem, disabled: boolean }
) => {
  const { updatedAt, id } = value
  const { activeTab } = useParams()
  const text = formatter(DateFormatEnum.DateTimeFormat)(updatedAt)
  return <Link
    disabled={disabled}
    text={text}
    to={`analytics/recommendations/${activeTab}/${id}`}
  />
}

export const UnknownLink = (
  { value, disabled }: { value: RecommendationWithUpdatedMetadata, disabled: boolean }
) => {
  const { metadata, statusEnum, updatedAt, sliceValue } = value
  const paramString = getParamString(metadata, statusEnum, updatedAt, sliceValue)
  const text = formatter(DateFormatEnum.DateTimeFormat)(updatedAt)
  return <Link
    disabled={disabled}
    text={text}
    to={`analytics/recommendations/crrm/unknown?${paramString}`}
  />
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

  const optimizationTooltipText = get('IS_MLISA_SA')
    ? $t({ defaultMessage: `
      When Full Optimization is enabled, AI-Driven RRM will comprehensively optimize the channel
      plan, channel bandwidth and Tx power with the objective of minimizing co-channel interference.
      When it is disabled, only the channel plan will be optimized, using the currently configured
      zone channel bandwidth and Tx power.
    ` })
    : $t({ defaultMessage: `
      When Full Optimization is enabled, AI-Driven RRM will comprehensively optimize the channel
      plan, channel bandwidth and Tx power with the objective of minimizing co-channel interference.
      When it is disabled, only the channel plan will be optimized, using the currently configured
      venue channel bandwidth and Tx power.
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
        ? <UnknownLink
          value={value as RecommendationWithUpdatedMetadata}
          disabled={value.statusEnum === 'unknown'}
        />
        : <DateLink
          value={value}
          disabled={!isCrrmOptimizationMatched(value.code, value.metadata, value.preferences)}
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
        return <Tooltip
          placement='top'
          title={value.scope}
          dottedUnderline={true}
        >
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
        return <Tooltip
          placement='top'
          title={code === 'unknown' ? '' : statusTooltip}
          dottedUnderline={true}
        >
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
      render: (_value, record) => {
        const preferences = _.get(record, 'preferences') || { crrmFullOptimization: true }
        const canToggle = record.toggles?.crrmFullOptimization === true
        const tooltipText = !canToggle && !record.isMuted
          ? get('IS_MLISA_SA')
            ? $t({ defaultMessage: `
              Optimization option cannot be modified when RRM recommendations are applied across any
              of the radios of the same zone. Please revert them in case you still prefer to change
              the optimization option for current recommendation.
            ` })
            : $t({ defaultMessage: `
              Optimization option cannot be modified when RRM recommendations are applied across any
              of the radios of the same venue. Please revert them in case you still prefer to change
              the optimization option for current recommendation.
            ` })
          : ''
        return <Tooltip placement='top' title={tooltipText}>
          <Switch
            defaultChecked
            checked={preferences.crrmFullOptimization}
            disabled={!canToggle || record.isMuted}
            onChange={() => {
              const updatedPreference = {
                ...preferences,
                crrmFullOptimization: !preferences.crrmFullOptimization
              }
              setPreference({ path: record.idPath, preferences: updatedPreference })
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
        rowClassName={(record) => {
          const classNames = []
          if (record.isMuted)
            classNames.push('table-row-disabled')
          if (!isCrrmOptimizationMatched(record.code, record.metadata, record.preferences))
            classNames.push('table-row-disabled', 'crrm-optimization-mismatch')
          return classNames.length > 0
            ? Array.from(new Set(classNames)).join(' ')
            : 'table-row-normal'
        }}
        filterableWidth={155}
        searchableWidth={240}
        components={{ body: { row: RowTooltip } }}
      />
    </Loader>
  )
}
