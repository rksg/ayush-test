import { useCallback, useEffect, useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { AIDrivenRRM, AIOperations, DidYouKnow, IncidentsCountBySeverities } from '@acx-ui/analytics/components'
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

  const height = useMonitorHeight(536)

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'How is my network doing?' })}
      extra={[
        <RangePicker
          key='range-picker'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />
      ]}
    />
    <UI.Grid style={{ height }}>
      <div style={{ gridArea: 'a1' }}>
        <Card title={$t({ defaultMessage: 'Network Filter' })} />
      </div>
      <div style={{ gridArea: 'b1' }}>
        <Card title={$t({ defaultMessage: 'Stats' })} />
      </div>
      <div style={{ gridArea: 'b2' }}>
        <Card title={$t({ defaultMessage: 'Network History' })} />
      </div>
      <div style={{ gridArea: 'b3' }}>
        <Card title={$t({ defaultMessage: 'SLA' })} />
      </div>
      <div style={{ gridArea: 'c1' }}>
        <IncidentsCountBySeverities filters={filters} />
      </div>
      <div style={{ gridArea: 'c2' }}>
        <AIDrivenRRM filters={filters} />
      </div>
      <div style={{ gridArea: 'd1' }}>
        <DidYouKnow filters={filters} maxFactPerSlide={2} maxSlideChar={180} />
      </div>
      <div style={{ gridArea: 'd2' }}>
        <AIOperations filters={filters} />
      </div>
    </UI.Grid>
  </>
}
