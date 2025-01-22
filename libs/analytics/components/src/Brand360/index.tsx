import { useState, useEffect } from 'react'

import moment from 'moment-timezone'

import { useBrand360Config }                                 from '@acx-ui/analytics/services'
import { Settings }                                          from '@acx-ui/analytics/utils'
import { PageHeader, RangePicker, GridRow, GridCol, Loader } from '@acx-ui/components'
import { Features,
  useIsSplitOn
} from '@acx-ui/feature-toggle'
import {
  useMspECListQuery,
  useIntegratorCustomerListDropdownQuery
} from '@acx-ui/msp/services'
import {
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import {
  DateFilter,
  DateRange,
  getDateRangeFilter,
  getDatePickerValues,
  AccountType
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
import { ConfigSettings } from './Settings'
import { SlaSliders }     from './SlaSliders'
import { SlaTile }        from './SlaTile'
import { BrandTable }     from './Table'
import { useSliceType }   from './useSliceType'


const mspPayload = {
  searchString: '',
  filters: {
    tenantType: [AccountType.MSP_REC, AccountType.MSP_INTEGRATOR],
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

const getlspPayload = (parentTenantId: string | undefined) => ({
  ...mspPayload,
  filters: {
    mspTenantId: [parentTenantId],
    tenantType: [AccountType.MSP_REC],
    status: ['Active']
  }
})

export function Brand360 () {
  const isMDUEnabled = useIsSplitOn(Features.BRAND360_MDU_TOGGLE)
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const { names, settingsQuery } = useBrand360Config()
  const { brand, lsp, property } = names
  const { tenantId, tenantType } = getJwtTokenPayload()
  const isLSP = tenantType === AccountType.MSP_INTEGRATOR
    || tenantType === AccountType.MSP_INSTALLER
  const { sliceType, SliceTypeDropdown } = useSliceType({ isLSP, lsp, property })
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
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
    toggles: useIncidentToggles(),
    isMDU: isMDUEnabled
  }

  const tenantDetails = useGetTenantDetailsQuery({ tenantId })
  const parentTenantid = tenantDetails.data?.mspEc?.parentMspId

  const mspPropertiesData = useMspECListQuery(
    { params: { tenantId }, payload: mspPayload }, { skip: isLSP })
  const lspPropertiesData = useIntegratorCustomerListDropdownQuery(
    { params: { tenantId }, payload: getlspPayload(parentTenantid) }, { skip: !isLSP
      && !Boolean(parentTenantid) })
  const propertiesData = isLSP ? lspPropertiesData : mspPropertiesData
  const propertiesLoading = Boolean(propertiesData?.isLoading)
  const lookupAndMappingData = propertiesData?.data
    ? transformLookupAndMappingData(propertiesData.data)
    : {}
  const venuesData = useFetchBrandPropertiesQuery(chartPayload, { skip: ssidSkip })
  const tableResults = venuesData.data && lookupAndMappingData
    ? transformVenuesData(
      venuesData as { data : BrandVenuesSLA[] },
      lookupAndMappingData,
      isMDUEnabled
    )
    : []
  const tenantIds = tableResults?.map(({ tenantId }) => tenantId)
  /*
      skip timeseries query if
      - ssid regex still loading
      - rc api for properties still loading
      - no tenantids implies no data in table
  */
  const skipTSQuery = ssidSkip || propertiesLoading || !tenantIds.length
  const {
    data: chartData,
    ...chartResults
  } = useFetchBrandTimeseriesQuery(
    { ...chartPayload, tenantIds },
    { skip: skipTSQuery }
  )
  const [pastStart, pastEnd] = computePastRange(startDate, endDate)
  const {
    data: prevData,
    ...prevResults
  } = useFetchBrandTimeseriesQuery({
    ...chartPayload,
    tenantIds,
    start: pastStart,
    end: pastEnd,
    granularity: 'all' },
  { skip: skipTSQuery })
  const {
    data: currData,
    ...currResults
  } = useFetchBrandTimeseriesQuery({
    ...chartPayload,
    tenantIds,
    granularity: 'all'
  },
  { skip: skipTSQuery }
  )
  const chartMap: ChartKey[] = ['incident', 'experience']
  if (isMDUEnabled) {
    chartMap.push('mdu')
  } else
  // istanbul ignore next
  {
    chartMap.push('compliance')
  }
  return <Loader states={[settingsQuery, propertiesData, venuesData]}>
    <PageHeader
      title={brand}
      extra={[
        <>
          { !isLSP ? <SliceTypeDropdown /> : null }
          <RangePicker
            key='range-picker'
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilterState as CallableFunction}
            showTimePicker
            selectionType={range}
            showLast8hours
            maxMonthRange={isDateRangeLimit ? 1 : 3}
          />
          <ConfigSettings settings={settings as Settings} />
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
            lsp={lsp}
            property={property}
            isMDU={isMDUEnabled}
          />
        </Loader>
      </GridCol>)}
      <GridCol col={{ span: 6 }}>
        <SlaSliders
          initialSlas={data || {}}
          currentSlas={settings}
          setCurrentSlas={setSettings}
          isMDU={isMDUEnabled}
        />
      </GridCol>
      <GridCol col={{ span: 24 }}>
        <BrandTable
          key={`${ssid}`}
          sliceType={sliceType}
          slaThreshold={settings}
          data={tableResults as Response[]}
          isLSP={isLSP}
          lspLabel={lsp}
          propertyLabel={property}
          isMDU={isMDUEnabled}
        />
      </GridCol>
    </GridRow>
  </Loader>
}
