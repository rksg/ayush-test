import React, { useState, useMemo } from 'react'

import { Checkbox }                                 from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import {
  defaultSort,
  dateSort,
  severitySort,
  sortProp,
  IncidentFilter,
} from '@acx-ui/analytics/utils'
import { Loader, TableProps, Tooltip }    from '@acx-ui/components'
import { DateFormatEnum, formatter }                   from '@acx-ui/formatter'
import { TenantLink }               from '@acx-ui/react-router-dom'
import { noDataDisplay }                               from '@acx-ui/utils'

import * as UI           from './styledComponents'

import { useRecommendationListQuery, Recommendation } from './services'
import { SCOPE_TYPE } from './config'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'


interface RecommendationRow extends Recommendation  {
  priority: number
  priorityLabel: string
  category: string
  summary: string
  type: string
  scope: string
  statusTooltip: string
}

const DateLink = ({ value }: { value: RecommendationRow }) => {
  return <TenantLink to={`/recommendations/${value.id}`}>
    {formatter(DateFormatEnum.DateTimeFormat)(value.updatedAt)}
  </TenantLink>
}

export function RecommendationTable ({ filters }: { filters: IncidentFilter }) {
  const intl = useIntl()
  const { $t } = intl
 
  const queryResults = useRecommendationListQuery(filters)
  
  const [ showMuted, setShowMuted ] = useState<boolean>(false)
  
  // const [muteIncident] = useMuteIncidentsMutation()
  const [selectedRowData, setSelectedRowData] = useState<{
    id: string,
    code: string,
    severityLabel: string,
    isMuted: boolean
  }[]>([])

  const selectedIncident = selectedRowData[0]
  const data = (showMuted)
    ? queryResults.data
    : queryResults.data //filterMutedIncidents(queryResults.data)

  const rowActions: TableProps<Recommendation>['rowActions'] = [
    {
      label: $t(selectedIncident?.isMuted
        ? defineMessage({ defaultMessage: 'Unmute' })
        : defineMessage({ defaultMessage: 'Mute' })
      ),
      onClick: async () => {
        // const { id, code, severityLabel, isMuted } = selectedIncident
        // await muteIncident({ id, code, priority: severityLabel, mute: !isMuted }).unwrap()
        // setSelectedRowData([])
      }
    }
  ]

  const ColumnHeaders: TableProps<RecommendationRow>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'Priority' })),
      width: 90,
      dataIndex: 'priorityLabel',
      key: 'priorityLabel',
      render: (_, value) => {
        return <UI.Priority>
          <UI.PriorityIcon value={value.priorityLabel} />
          <span>{value.priorityLabel}</span>
        </UI.Priority>
      },
      sorter: { compare: sortProp('priority', severitySort) },
      fixed: 'left',
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Date' })),
      width: 130,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (_, value) => {
        return <DateLink value={value}/>
      },
      sorter: { compare: sortProp('endTime', dateSort) },
      fixed: 'left'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Summary' })),
      width: 250,
      dataIndex: 'summary',
      key: 'summary',
      render: (_, value, __, highlightFn ) => <>{highlightFn(value.summary)}</>,
      sorter: { compare: sortProp('description', defaultSort) },
      ellipsis: true,
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Category' })),
      width: 130,
      dataIndex: 'category',
      key: 'category',
      sorter: { compare: sortProp('category', defaultSort) },
      fixed: 'left',
      filterable: true
    },
    {
      title: $t(SCOPE_TYPE),
      width: 150,
      dataIndex: 'scope',
      key: 'scope',
      render: (_, value, __, highlightFn ) => {
        return <Tooltip placement='top' title={value.scope}>
          <UI.UnderlinedSpan>{highlightFn(value.sliceValue)}</UI.UnderlinedSpan>
        </Tooltip>
      },
      sorter: { compare: sortProp('scope', defaultSort) },
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Status' })),
      width: 90,
      dataIndex: 'status',
      key: 'status',
      render: (_, value ) => {
        return <Tooltip placement='top' title={value.statusTooltip}>
          <UI.UnderlinedSpan>{value.status}</UI.UnderlinedSpan>
        </Tooltip>
      },
      sorter: { compare: sortProp('status', defaultSort) },
      filterable: true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' 'basePath' 'intl' are not changing

  return (
    <Loader states={[queryResults]}>
      <UI.RecommendationTableWrapper
        settingsId='incident-table'
        type='tall'
        dataSource={data}
        columns={ColumnHeaders}
        rowActions={rowActions}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedRowData.map(val => val.id),
          // onChange: (_, [row]) => {
          //   // row && setSelectedRowData([{
          //   //   id: row.id,
          //   //   code: row.code,
          //   //   severityLabel: row?.priority,
          //   //   isMuted: row.isMuted
          //   // }])
          // }
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
        //rowClassName={(record) => record.isMuted ? 'table-row-muted' : 'table-row-normal'}
        filterableWidth={155}
        searchableWidth={240}
      />
    </Loader>
  )
}
