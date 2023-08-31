import { useMemo, useState, useEffect } from 'react'

import { Checkbox }               from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import {
  defaultSort,
  dateSort,
  sortProp,
  IncidentFilter
} from '@acx-ui/analytics/utils'
import { Loader, TableProps, Tooltip } from '@acx-ui/components'
import { get }                         from '@acx-ui/config'
import { DateFormatEnum, formatter }   from '@acx-ui/formatter'
import { TenantLink, useParams }       from '@acx-ui/react-router-dom'
import { noDataDisplay }               from '@acx-ui/utils'

import { RecommendationActions }  from './RecommendationActions'
import {
  useRecommendationListQuery,
  RecommendationListItem,
  useMuteRecommendationMutation
} from './services'
import * as UI               from './styledComponents'
import { getOptimizedState } from './utils'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'


const DateLink = ({ value }: { value: RecommendationListItem }) => {
  const { activeTab } = useParams()
  return <TenantLink to={`analytics/recommendations/${activeTab}/${value.id}`}>
    {formatter(DateFormatEnum.DateTimeFormat)(value.updatedAt)}
  </TenantLink>
}

const disableMuteStatus: Array<RecommendationListItem['statusEnum']> = [
  'applyscheduled',
  'applyscheduleinprogress',
  'revertscheduled',
  'revertscheduleinprogress'
]

export const rrmStateSort = (itemA: RecommendationListItem, itemB: RecommendationListItem) => {
  const stateA = getOptimizedState(itemA.statusEnum)
  const stateB = getOptimizedState(itemB.statusEnum)
  return defaultSort(stateA.order, stateB.order)
}

export function RecommendationTable ({ filters, showCrrm }:
  { filters: IncidentFilter, showCrrm?: boolean }) {
  const intl = useIntl()
  const { $t } = intl

  const queryResults = useRecommendationListQuery({ ...filters, crrm: showCrrm })

  const [ showMuted, setShowMuted ] = useState<boolean>(false)

  const [muteRecommendation] = useMuteRecommendationMutation()
  const [selectedRowData, setSelectedRowData] = useState<{
    id: string,
    isMuted: boolean,
    statusEnum: RecommendationListItem['statusEnum']
  }[]>([])

  const selectedRecommendation = selectedRowData[0]

  const data = queryResults?.data?.filter((row) => (showMuted || !row.isMuted))

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

  useEffect(() => {
    setSelectedRowData([])
  }, [queryResults.data])

  const columns: TableProps<RecommendationListItem>['columns'] = useMemo(() => [
    ...(showCrrm ? [{
      title: get('IS_MLISA_SA')
        ? $t({ defaultMessage: 'Zone RRM' })
        : $t({ defaultMessage: 'Venue RRM' }),
      width: 90,
      dataIndex: 'optimizedState',
      key: 'optimizedState',
      render: (_, value) => {
        const optimizedState = getOptimizedState(value.statusEnum)
        return <UI.OptimizedIcon
          value={optimizedState.order}
          text={$t(optimizedState.label)}
        />
      },
      sorter: { compare: rrmStateSort },
      fixed: 'left',
      filterable: true
    }] : [{
      title: $t({ defaultMessage: 'Priority' }),
      width: 90,
      dataIndex: ['priority', 'order'],
      key: 'priorityOrder',
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
      render: (_, value) => {
        return <DateLink value={value}/>
      },
      sorter: { compare: sortProp('updatedAt', dateSort) },
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      width: 250,
      dataIndex: 'summary',
      key: 'summary',
      render: (_, value, __, highlightFn ) => <>{highlightFn(value.summary)}</>,
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
          <UI.UnderlinedSpan>{highlightFn(value.sliceValue)}</UI.UnderlinedSpan>
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
      render: (_, value ) => {
        return <Tooltip placement='top' title={value.statusTooltip}>
          <UI.UnderlinedSpan $statusEnum={value.statusEnum}>{value.status}</UI.UnderlinedSpan>
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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [showCrrm]) // '$t' 'basePath' 'intl' are not changing

  return (
    <Loader states={[queryResults]}>
      <UI.RecommendationTableWrapper
        settingsId={`recommendation-table-${showCrrm}`}
        type='tall'
        dataSource={data}
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
