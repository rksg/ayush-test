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
import { useDashboardFilter, DateFilter,DateRange, getDateRangeFilter } from '@acx-ui/utils'

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

export default function Dashboard () {
  const { $t } = useIntl()
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
  )
  const { startDate, endDate, range } = dateFilterState.range !== DateRange.custom
    ? getDateRangeFilter(dateFilterState.range)
    : dateFilterState

  const { filters } = useDashboardFilter()
  const { filters: analyticsFilter, path } = useAnalyticsFilter()
  const height = useMonitorHeight(536)
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'How is my network doing?' })}
        extra={[
          <>
            <SANetworkFilter />
            <RangePicker
              key='range-picker'
              selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
              onDateApply={setDateFilterState as CallableFunction}
              showTimePicker
              selectionType={range}
              isDashBoard
            />
          </>
        ]}
      />
      <UI.Grid style={{ height }}>
        <div style={{ gridArea: 'a1' }}>
          <ReportTile path={path} />
        </div>
        <div style={{ gridArea: 'a2' }}>
          <NetworkHistory
            hideLegend
            historicalIcon={false}
            filters={{ ...analyticsFilter, startDate, endDate, range }}
          />
        </div>
        <div style={{ gridArea: 'a3' }}>
          <SLA filters={{ ...analyticsFilter, startDate, endDate, range }} />
        </div>
        <div style={{ gridArea: 'b1' }}>
          <IncidentsCountBySeverities filters={{ ...filters, startDate, endDate, range }} />
        </div>
        <div style={{ gridArea: 'b2' }}>
          <AIDrivenRRM filters={{ ...filters, startDate, endDate, range }} />
        </div>
        <div style={{ gridArea: 'c2' }}>
          <AIOperations filters={{ ...filters, startDate, endDate, range }} />
        </div>
        <div style={{ gridArea: 'd1' }}>
          <DidYouKnow
            filters={{ ...filters, startDate, endDate, range }}
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
