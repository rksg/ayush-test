import { useCallback, useEffect, useRef, useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { DidYouKnow, IncidentsCountBySeverities } from '@acx-ui/analytics/components'
import { Card, PageHeader, RangePicker }          from '@acx-ui/components'
import { useDashboardFilter, useDateFilter }      from '@acx-ui/utils'

import * as UI from './styledComponents'

export const useMonitorHeight = (minHeight: number): [number, React.RefObject<HTMLDivElement>] => {
  const [height, setHeight] = useState(minHeight)
  const ref = useRef<HTMLDivElement>(null)

  const updateScreenWidth = useCallback(() => {
    const box = ref.current?.getBoundingClientRect()

    const bottomSpace = 20
    const nextHeight = window.innerHeight - Number(box?.top) - bottomSpace
    setHeight(nextHeight < minHeight ? minHeight : nextHeight)
  }, [minHeight])

  useEffect(() => {
    updateScreenWidth()

    window.addEventListener('resize', updateScreenWidth)
    return () => window.removeEventListener('resize', updateScreenWidth)
  })

  return [height, ref]
}

export default function Dashboard () {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { filters } = useDashboardFilter()

  const [height, elementRef] = useMonitorHeight(536)

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
    <UI.Grid ref={elementRef} style={{ height }}>
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
        <Card title={$t({ defaultMessage: 'AI-Driven RRM' })} />
      </div>
      <div style={{ gridArea: 'd1' }}>
        <DidYouKnow filters={filters} maxFactPerSlide={2} maxSlideChar={180} />
      </div>
      <div style={{ gridArea: 'd2' }}>
        <Card title={$t({ defaultMessage: 'AI Operations' })} />
      </div>
    </UI.Grid>
  </>
}
