import { useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import type { Settings }                                                  from '@acx-ui/analytics/utils'
import { PageHeader, RangePicker, GridRow, GridCol }                      from '@acx-ui/components'
import { DateFilter, DateRange, getDateRangeFilter, getDatePickerValues } from '@acx-ui/utils'

export type SliceType = 'property' | 'lsp'

export function Brand360 () {
  const { $t } = useIntl()
  const [sliceType/*, setSliceType*/] = useState<SliceType>('property')
  const [settings/*, setSettings*/] = useState<Partial<Settings>>({
    'sla-p1-incidents-count': '10',
    'sla-guest-experience': '20',
    'sla-brand-ssid-compliance': '30',
    'brand-ssid-compliance-matcher': '/a/'
  })
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
  )
  const { startDate, endDate, range } = getDatePickerValues(dateFilterState)
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Brand 360' })}
      extra={[
        <>
          <div>{sliceType}</div>
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
    <GridRow>
      <GridCol col={{ span: 6 }}>incident</GridCol>
      <GridCol col={{ span: 6 }}>guest experience</GridCol>
      <GridCol col={{ span: 6 }}>brand ssid compliance</GridCol>
      <GridCol col={{ span: 6 }}>{JSON.stringify(settings)}</GridCol>
    </GridRow>
    table
  </>
}
