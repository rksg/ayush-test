import { useMemo, useState, useEffect } from 'react'

import { Checkbox, Switch }       from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import {
  isSwitchPath,
  defaultSort,
  dateSort,
  sortProp
} from '@acx-ui/analytics/utils'
import { Loader, TableProps, Tooltip } from '@acx-ui/components'
import { get }                         from '@acx-ui/config'
import { Features, useIsSplitOn }      from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }   from '@acx-ui/formatter'
import { TenantLink, useParams }       from '@acx-ui/react-router-dom'
import { noDataDisplay, PathFilter }   from '@acx-ui/utils'

import { getParamString } from '../AIDrivenRRM/extra'

import { RecommendationActions } from './RecommendationActions'
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

const DateLink = ({ value }: { value: RecommendationListItem }) => {
  const { activeTab } = useParams()
  return <TenantLink to={`analytics/recommendations/${activeTab}/${value.id}`}>
    {formatter(DateFormatEnum.DateTimeFormat)(value.updatedAt)}
  </TenantLink>
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

  const switchPath = isSwitchPath(pathFilters.path)
  const queryResults =
    useRecommendationListQuery({ ...pathFilters, crrm: showCrrm }, { skip: switchPath })
  const data = switchPath ? [] : queryResults?.data?.filter((row) => (showMuted || !row.isMuted))
  const noCrrmData = data?.filter(recommendation => recommendation.code !== 'unknown')

  useEffect(() => {
    setSelectedRowData([])
  }, [queryResults.data])

  const isRACrrmPartialEnabled = useIsSplitOn(Features.RUCKUS_AI_CRRM_PARTIAL) && get('IS_MLISA_SA')
  const isR1CrrmPartialEnabled = useIsSplitOn(Features.CRRM_PARTIAL) && !get('IS_MLISA_SA')

  const columns: TableProps<RecommendationListItem>['columns'] = useMemo(() => [
    ...(showCrrm ? [{
      title: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone RRM Health' })
        : $t({ defaultMessage: 'Venue RRM Health' }),
      width: 120,
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
        : <DateLink value={value}/>,
      sorter: { compare: sortProp('updatedAt', dateSort) },
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      width: 250,
      dataIndex: 'summary',
      key: 'summary',
      render: (_, value, __, highlightFn ) => highlightFn(value.summary),
      sorter: { compare: sortProp('summary', defaultSort) },
      searchable: true
    },
    ...(showCrrm ? [] : [{
      title: $t({ defaultMessage: 'Category' }),
      width: 130,
      dataIndex: 'category',
      key: 'category',
      sorter: { compare: sortProp('category', defaultSort) },
      fixed: 'left',
      filterable: true
    }]) as TableProps<RecommendationListItem>['columns'],
    {
      title: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone' })
        : $t({ defaultMessage: 'Venue' }),
      width: 150,
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
      width: 80,
      align: 'left',
      className: 'actions-column',
      render: (_, value) => <RecommendationActions recommendation={value} />
    },
    ...(showCrrm && (isRACrrmPartialEnabled || isR1CrrmPartialEnabled) ? [{
      title: $t({ defaultMessage: 'Full Optimization' }),
      key: 'preferences',
      dataIndex: 'preferences',
      width: 140,
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
        settingsId={`recommendation-table-${showCrrm}`}
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
        rowClassName={(record) => record.isMuted ? 'table-row-muted' : 'table-row-normal'}
        filterableWidth={155}
        searchableWidth={240}
      />
    </Loader>
  )
}
