import { useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { PageHeader, RangePicker, GridRow, GridCol }                      from '@acx-ui/components'
import { DateFilter, DateRange, getDateRangeFilter, getDatePickerValues } from '@acx-ui/utils'

export function Brand360 () {
  const { $t } = useIntl()
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
  )
  const { startDate, endDate, range } = getDatePickerValues(dateFilterState)
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Brand 360' })}
      extra={[
        <>
          <div>lsp/properly</div>
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
      <GridCol col={{ span: 6 }}>sla</GridCol>
    </GridRow>
    table
  </>
}
