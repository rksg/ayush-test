import { useCallback, useEffect, useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import {
  DidYouKnow,
  IncidentsCountBySeverities,
  SLA,
  ReportTile,
  MlisaNetworkFilter,
  AIDrivenRRM,
  AIOperations
} from '@acx-ui/analytics/components'
import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  PageHeader,
  RangePicker,
  cssNumber,
  useLayoutContext
} from '@acx-ui/components'
import { useDashboardFilter, useDateFilter } from '@acx-ui/utils'

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
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { filters } = useDashboardFilter()
  const { filters: analyticsFilter, path } = useAnalyticsFilter()

  const height = useMonitorHeight(536)

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'How is my network doing?' })}
      extra={[
        <>
          <MlisaNetworkFilter />
          <RangePicker
            key='range-picker'
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
          />
        </>
      ]}
    />
    <UI.Grid style={{ height }}>
      <div style={{ gridArea: 'a1' }}>
        <ReportTile path={path} />
      </div>
      <div style={{ gridArea: 'a2' }}>
        <Card />
      </div>
      <div style={{ gridArea: 'd2' }}>
        <SLA filters={analyticsFilter}/>
      </div>
      <div style={{ gridArea: 'b1' }}>
        <IncidentsCountBySeverities filters={filters} />
      </div>
      <div style={{ gridArea: 'b2' }}>
        <AIDrivenRRM filters={filters} />
      </div>
      <div style={{ gridArea: 'd1' }}>
        <DidYouKnow filters={filters} maxFactPerSlide={4} maxSlideChar={340} />
      </div>
      <div style={{ gridArea: 'c1' }}>
        <AIOperations filters={filters} />
      </div>
    </UI.Grid>
  </>
}
