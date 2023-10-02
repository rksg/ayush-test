import { useCallback, useEffect, useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import {
  DidYouKnow,
  IncidentsCountBySeverities,
  NetworkHistory,
  SLA,
  ReportTile,
  SANetworkFilter,
  AIDrivenRRM,
  AIOperations,
  ChatWithMelissa
} from '@acx-ui/analytics/components'
import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  PageHeader,
  RangePicker,
  cssNumber,
  useLayoutContext
} from '@acx-ui/components'
import { DateFilter, DateRange, getDateRangeFilter, AnalyticsFilter } from '@acx-ui/utils'

import * as UI from './styledComponents'

export const useMonitorHeight = (minHeight: number): number => {
  const [height, setHeight] = useState(minHeight)
  const { pageHeaderY } = useLayoutContext()

  const updateHeight = useCallback(() => {
    const bottomSpace = cssNumber('--acx-content-vertical-space')
    const nextHeight = window.innerHeight - pageHeaderY - bottomSpace
    setHeight(nextHeight < minHeight ? minHeight : nextHeight)
  }, [minHeight, pageHeaderY])

  useEffect(() => {
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [updateHeight])

  return height
}

export const useDashBoardUpdatedFilters = () => {
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
  )
  const { startDate, endDate, range } = dateFilterState.range !== DateRange.custom
    ? getDateRangeFilter(dateFilterState.range)
    : dateFilterState
  const { filters, pathFilters } = useAnalyticsFilter()
  return {
    filters: { ...filters, startDate, endDate, range },
    pathFilters: { ...pathFilters, startDate, endDate, range },
    startDate,
    endDate,
    range,
    setDateFilterState
  }
}

export const getFiltersForRecommendationWidgets = (filters : AnalyticsFilter) => {
  if(filters.range !== DateRange.last8Hours)
    return filters
  return { ...filters, ...getDateRangeFilter(DateRange.last24Hours) }
}

export default function Dashboard () {
  const { $t } = useIntl()
  const {
    filters,
    pathFilters,
    startDate,
    endDate,
    range,
    setDateFilterState
  }= useDashBoardUpdatedFilters()
  const height = useMonitorHeight(536)

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'How is my network doing?' })}
        extra={[
          <>
            <SANetworkFilter overrideFilters={filters}/>
            <RangePicker
              key='range-picker'
              selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
              onDateApply={setDateFilterState as CallableFunction}
              showTimePicker
              selectionType={range}
              showLast8hours
            />
          </>
        ]}
      />
      <UI.Grid style={{ height }}>
        <div style={{ gridArea: 'a1' }}>
          <ReportTile pathFilters={pathFilters} />
        </div>
        <div style={{ gridArea: 'a2' }}>
          <NetworkHistory
            hideLegend
            historicalIcon={false}
            filters={filters}
          />
        </div>
        <div style={{ gridArea: 'a3' }}>
          <SLA pathFilters={pathFilters} />
        </div>
        <div style={{ gridArea: 'b1' }}>
          <IncidentsCountBySeverities filters={filters} />
        </div>
        <div style={{ gridArea: 'b2' }}>
          <AIDrivenRRM pathFilters={pathFilters} />
        </div>
        <div style={{ gridArea: 'c2' }}>
          <AIOperations pathFilters={pathFilters} />
        </div>
        <div style={{ gridArea: 'd1' }}>
          <DidYouKnow
            filters={pathFilters}
            maxFactPerSlide={3}
            maxSlideChar={290}
          />
        </div>
        <div style={{ gridArea: 'd2' }}>
          <ChatWithMelissa />
        </div>
      </UI.Grid>
    </>
  )
}
