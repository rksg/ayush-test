import { useState, useEffect } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { useGetTenantSettingsQuery }                         from '@acx-ui/analytics/services'
import type { Settings }                                     from '@acx-ui/analytics/utils'
import { PageHeader, RangePicker, GridRow, GridCol, Loader } from '@acx-ui/components'
import {
  useMspCustomerListDropdownQuery
} from '@acx-ui/msp/services'
import {
  DateFilter,
  DateRange,
  getDateRangeFilter,
  getDatePickerValues
} from '@acx-ui/utils'
import { getJwtTokenPayload } from '@acx-ui/utils'

import { useIncidentToggles } from '../useIncidentToggles'

import {
  ChartKey,
  computePastRange,
  transformLookupAndMappingData,
  transformVenuesData
} from './helpers'
import {
  Response,
  useFetchBrandTimeseriesQuery,
  useFetchBrandPropertiesQuery,
  BrandVenuesSLA
} from './services'
import { SlaSliders }   from './SlaSliders'
import { SlaTile }      from './SlaTile'
import { BrandTable }   from './Table'
import { useSliceType } from './useSliceType'

const rcApiPayload = {
  searchString: '',
  filters: {
    tenantType: ['MSP_INTEGRATOR', 'MSP_REC'],
    status: ['Active']
  },
  fields: ['id', 'name', 'tenantType', 'status'],
  page: 1,
  pageSize: 10000,
  defaultPageSize: 10000,
  total: 0,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function Brand360 () {
  const settingsQuery = useGetTenantSettingsQuery()
  const { $t } = useIntl()
  const isLSP = getJwtTokenPayload().tenantType === 'MSP_INTEGRATOR'
  || getJwtTokenPayload().tenantType === 'MSP_INSTALLER'
  const { sliceType, SliceTypeDropdown } = useSliceType({ isLSP })
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last24Hours)
  )
  const { data } = settingsQuery
  useEffect(() => { data && setSettings(data) }, [data])
  const { startDate, endDate, range } = getDatePickerValues(dateFilterState)
  const ssid = data?.['brand-ssid-compliance-matcher']!
  const ssidSkip = !Boolean(ssid)
  const chartPayload = {
    start: startDate,
    end: endDate,
    ssidRegex: ssid,
    toggles: useIncidentToggles()
  }
  const mspPropertiesData = useMspCustomerListDropdownQuery(
    { params: { tenantId: getJwtTokenPayload().tenantId },payload: rcApiPayload })
  const lookupAndMappingData = mspPropertiesData?.data
    ? transformLookupAndMappingData(mspPropertiesData.data)
    : {}
  const venuesData = useFetchBrandPropertiesQuery(chartPayload, { skip: ssidSkip })
  const tableResults = venuesData.data && lookupAndMappingData
    ? transformVenuesData(venuesData as { data : BrandVenuesSLA[] }, lookupAndMappingData)
    : []
  const {
    data: chartData,
    ...chartResults
  } = useFetchBrandTimeseriesQuery(chartPayload, { skip: ssidSkip })
  const [pastStart, pastEnd] = computePastRange(startDate, endDate)
  const {
    data: prevData,
    ...prevResults
  } = useFetchBrandTimeseriesQuery({
    ...chartPayload,
    start: pastStart,
    end: pastEnd,
    granularity: 'all' },
  { skip: ssidSkip })
  const {
    data: currData,
    ...currResults
  } = useFetchBrandTimeseriesQuery({ ...chartPayload, granularity: 'all' }, { skip: ssidSkip })
  const chartMap: ChartKey[] = ['incident', 'experience', 'compliance']
  return <Loader states={[settingsQuery, mspPropertiesData, venuesData]}>
    <PageHeader
      title={$t({ defaultMessage: 'Brand 360' })}
      extra={[
        <>
          { !isLSP ? <SliceTypeDropdown /> : null }
          <RangePicker
            key='range-picker'
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilterState as CallableFunction}
            showTimePicker
            selectionType={range}
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
            tableData={tableResults as Response[]}
            chartData={chartData}
            prevData={prevData}
            currData={currData}
            settings={settings as Settings}
          />
        </Loader>
      </GridCol>)}
      <GridCol col={{ span: 6 }}>
        <SlaSliders initialSlas={data || {}} currentSlas={settings} setCurrentSlas={setSettings} />
      </GridCol>
      <GridCol col={{ span: 24 }}>
        <BrandTable
          key={`${ssid}`}
          sliceType={sliceType}
          slaThreshold={settings}
          data={tableResults as Response[]}
          isLSP={isLSP}
        />
      </GridCol>
    </GridRow>
  </Loader>
}
