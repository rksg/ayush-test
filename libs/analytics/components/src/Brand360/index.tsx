import { useState, useEffect } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { useGetTenantSettingsQuery }                         from '@acx-ui/analytics/services'
import type { Settings }                                     from '@acx-ui/analytics/utils'
import { PageHeader, RangePicker, GridRow, GridCol, Loader } from '@acx-ui/components'
import {
  DateFilter,
  DateRange,
  getDateRangeFilter,
  getDatePickerValues
} from '@acx-ui/utils'

import { ChartKey, computePastRange } from './helpers'
import {
  Response,
  useFetchBrandPropertiesQuery,
  useFetchBrandTimeseriesQuery
} from './services'
import { SlaSliders }   from './SlaSliders'
import { SlaTile }      from './SlaTile'
import { BrandTable }   from './Table'
import { useSliceType } from './useSliceType'


export function Brand360 () {
  const settingsQuery = useGetTenantSettingsQuery()
  const { $t } = useIntl()
  const { sliceType, SliceTypeDropdown } = useSliceType()
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
  )
  const { data } = settingsQuery
  useEffect(() => { data && setSettings(data) }, [data])
  const { startDate, endDate, range } = getDatePickerValues(dateFilterState)
  const tableResults = useFetchBrandPropertiesQuery({})
  const chartPayload = {
    start: startDate,
    end: endDate,
    ssidRegex: settings['brand-ssid-compliance-matcher']!
  }
  const {
    data: chartData,
    ...chartResults
  } = useFetchBrandTimeseriesQuery(chartPayload)
  const [pastStart, pastEnd] = computePastRange(
    startDate,
    dateFilterState.range,
    endDate
  )
  const {
    data: prevData,
    ...prevResults
  } = useFetchBrandTimeseriesQuery({
    ...chartPayload,
    start: pastStart,
    end: pastEnd,
    granularity: 'all' })
  const {
    data: currData,
    ...currResults
  } = useFetchBrandTimeseriesQuery({ ...chartPayload, granularity: 'all' })
  const chartMap: ChartKey[] = ['incident', 'experience', 'compliance']
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
      {chartMap.map((val) => <GridCol col={{ span: 6 }} key={val}>
        <Loader
          states={[chartResults, prevResults, currResults]}>
          <SlaTile
            chartKey={val}
            sliceType={sliceType}
            tableData={tableResults.data as Response[]}
            chartData={chartData}
            prevData={prevData}
            currData={currData}
          />
        </Loader>
      </GridCol>)}
      <GridCol col={{ span: 6 }}>
        <SlaSliders initialSlas={data || {}} currentSlas={settings} setCurrentSlas={setSettings} />
      </GridCol>
      <GridCol col={{ span: 24 }}>
        <BrandTable
          sliceType={sliceType}
          slaThreshold={settings}
          data={tableResults.data as Response[]}
        />
      </GridCol>
    </GridRow>
  </Loader>
}
