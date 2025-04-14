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
  ChatWithMelissa,
  AppInsights,
  IntentAIWidget
} from '@acx-ui/analytics/components'
import {
  useAnalyticsFilter
} from '@acx-ui/analytics/utils'
import {
  PageHeader,
  RangePicker,
  cssNumber,
  useLayoutContext
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { hasPermission }                                                                               from '@acx-ui/user'
import { AnalyticsFilter, DateFilter, DateRange, getDatePickerValues, getDateRangeFilter, PathFilter } from '@acx-ui/utils'

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
  const { startDate, endDate, range } = getDatePickerValues(dateFilterState)
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

export const getFiltersForRecommendationWidgets = (pathFilters: PathFilter) => {
  if (![DateRange.last8Hours, DateRange.last24Hours].includes(pathFilters.range))
    return pathFilters
  return { ...pathFilters, ...getDateRangeFilter(DateRange.last7Days) }
}

type DashboardViewProps = {
  filters: AnalyticsFilter & Omit<DateFilter, 'setDateFilterState'>
  pathFilters: PathFilter & Omit<DateFilter, 'setDateFilterState'>
}

const DashboardView = ({ filters, pathFilters }: DashboardViewProps) => {
  const height = useMonitorHeight(536)
  const enableAppInsights = useIsSplitOn(Features.APP_INSIGHTS)
  if (!hasPermission({ permission: 'READ_INTENT_AI' })) {
    return (
      <UI.NetworkAdminGrid style={{ height }}>
        <div style={{ gridArea: 'a1' }}>
          <ReportTile pathFilters={pathFilters} />
        </div>
        <div style={{ gridArea: 'a2' }}>
          <NetworkHistory hideLegend historicalIcon={false} filters={filters} />
        </div>
        <div style={{ gridArea: 'b1' }}>
          <IncidentsCountBySeverities filters={filters} />
        </div>
        <div style={{ gridArea: 'c2' }}>
          <SLA pathFilters={pathFilters} />
        </div>
        <div style={{ gridArea: 'd1' }}>
          <DidYouKnow filters={pathFilters} />
        </div>
        <div style={{ gridArea: 'd2' }}>
          <ChatWithMelissa/>
        </div>
      </UI.NetworkAdminGrid>
    )
  }

  return (
    <UI.AdminGrid style={{ height }}>
      <div style={{ gridArea: 'a1' }}>
        <ReportTile pathFilters={pathFilters} />
      </div>
      { enableAppInsights
        ? [<div key='1' style={{ gridArea: 'a2-start/ a2-start/ a3-end / a3-end' }}>
          <AppInsights />
        </div>]
        : [
          <div key='1' style={{ gridArea: 'a2' }}>
            <NetworkHistory hideLegend historicalIcon={false} filters={filters} />
          </div>,
          <div key='2' style={{ gridArea: 'a3' }}>
            <SLA pathFilters={pathFilters} />
          </div>]
      }
      <div style={{ gridArea: 'b1' }}>
        <IncidentsCountBySeverities filters={filters} />
      </div>
      <div style={{ gridArea: 'b2-start/ b2-start/ c2-end / c2-end' }}>
        <IntentAIWidget
          pathFilters={getFiltersForRecommendationWidgets(pathFilters)}
        />
      </div>
      <div style={{ gridArea: 'd1' }}>
        <DidYouKnow filters={pathFilters} />
      </div>
      { enableAppInsights
        ? <div style={{ gridArea: 'd2' }}>
          <SLA pathFilters={pathFilters} />
        </div>
        : <div style={{ gridArea: 'd2' }}>
          <ChatWithMelissa/>
        </div> }
    </UI.AdminGrid>
  )
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
  } = useDashBoardUpdatedFilters()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'How is my network doing?' })}
        extra={[
          <>
            <SANetworkFilter overrideFilters={filters} />
            <RangePicker
              key='range-picker'
              selectedRange={{
                startDate: moment(startDate),
                endDate: moment(endDate)
              }}
              onDateApply={setDateFilterState as CallableFunction}
              showTimePicker
              selectionType={range}
              showLast8hours
            />
          </>
        ]}
      />
      <DashboardView filters={filters} pathFilters={pathFilters} />
    </>
  )
}
