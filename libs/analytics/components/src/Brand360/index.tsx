import { useState, useEffect } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { useGetTenantSettingsQuery }                                      from '@acx-ui/analytics/services'
import type { Settings }                                                  from '@acx-ui/analytics/utils'
import { PageHeader, RangePicker, GridRow, GridCol, Loader }              from '@acx-ui/components'
import { DateFilter, DateRange, getDateRangeFilter, getDatePickerValues } from '@acx-ui/utils'

import { SlaSliders }   from './SlaSliders'
import { useSliceType } from './useSliceType'
import { Property, useFetchBrandPropertiesQuery } from './services'
import { BrandTable }                             from './Table'

export function Brand360 () {
  const settingsQuery = useGetTenantSettingsQuery()
  const { $t } = useIntl()
  const { sliceType, SliceTypeDropdown } = useSliceType()
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
  )
  const { startDate, endDate, range } = getDatePickerValues(dateFilterState)
  useEffect(() => {
    settingsQuery.data && setSettings(settingsQuery.data)
  }, [settingsQuery.data])
  const tableResults = useFetchBrandPropertiesQuery({})
  return <Loader states={[settingsQuery, tableResults]}>
    <PageHeader
      title={$t({ defaultMessage: 'Brand 360' })}
      extra={[
        <>
          <SliceTypeDropdown />
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
      <GridCol col={{ span: 6 }}><SlaSliders settings={settings} /></GridCol>
    </GridRow>
    <div>{sliceType} {JSON.stringify(settings)}</div>
    <BrandTable
      sliceType={sliceType}
      slaThreshold={settings}
      data={tableResults.data as Property[]}
    />
  </Loader>
}
