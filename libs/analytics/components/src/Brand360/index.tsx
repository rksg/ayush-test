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

import { ChartKey, computePastRange, transformLookupAndMappingData, transformVenuesData } from './helpers'
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const venuesData2 = {
  data: [
    {
      tenantId: '54f61ae80cfd4eaf86ebf922e847137e',
      zoneName: '1fc04a8562ef426a98adf2f1c2ade0fc',
      incidentCount: null,
      ssidComplianceSLA: [3, 3],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [0, 0],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '54f61ae80cfd4eaf86ebf922e847137e',
      zoneName: '36223f4bbf9b49a88cf373f4aa2372c7',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [null, null],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '54f61ae80cfd4eaf86ebf922e847137e',
      zoneName: '39b53137e4cd4dc78793d60dcc259bda',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [1167, 1198],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '54f61ae80cfd4eaf86ebf922e847137e',
      zoneName: '45814d5fb2c8462091bee432eac03e53',
      incidentCount: null,
      ssidComplianceSLA: [3, 4],
      timeToConnectSLA: [84, 84],
      clientThroughputSLA: [34, 44],
      connectionSuccessSLA: [344, 344],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: '4770d22a9ef8494ba7ed3162dd1892fa',
      incidentCount: 1,
      ssidComplianceSLA: [2, 4],
      timeToConnectSLA: [39, 42],
      clientThroughputSLA: [12, 40],
      connectionSuccessSLA: [304, 316],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: '47ee3e178f994b16b3a645f11e709478',
      incidentCount: null,
      ssidComplianceSLA: [1, 3],
      timeToConnectSLA: [11, 12],
      clientThroughputSLA: [7, 7],
      connectionSuccessSLA: [45, 56],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: '492abc2cdfb74ce39c4b62f66539ee08',
      incidentCount: 1,
      ssidComplianceSLA: [4, 5],
      timeToConnectSLA: [319, 319],
      clientThroughputSLA: [119, 199],
      connectionSuccessSLA: [2495, 2903],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: '5737f60e6ea8439db05a132a7e95c6c5',
      incidentCount: null,
      ssidComplianceSLA: [1, 1],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [0, 0],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: '5cda25a88a0641dc914c84b90f30cbd4',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [78, 79],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: '653b8993e7ef4665b2a322434324bbe7',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [553, 566],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: '733903d265b540a9bc7754b5d88159a3',
      incidentCount: null,
      ssidComplianceSLA: [0, 1],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [0, 0],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: '829c607af0d74a11ac2b69d378bd9490',
      incidentCount: null,
      ssidComplianceSLA: [0, 1],
      timeToConnectSLA: [16, 16],
      clientThroughputSLA: [4, 4],
      connectionSuccessSLA: [77, 77],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: '8b1ce4b72ad249a889714a5b1c62e43f',
      incidentCount: null,
      ssidComplianceSLA: [0, 1],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [2, 4],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '5c2109ded78e444a9b6a1bc052f5acd0',
      zoneName: 'b4ad311d92154f1f996a9aa6424ad198',
      incidentCount: null,
      ssidComplianceSLA: [2, 5],
      timeToConnectSLA: [11, 11],
      clientThroughputSLA: [9, 11],
      connectionSuccessSLA: [51, 55],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '34ae55123c1d43cfb348c738cdf124fd',
      zoneName: 'b7949334e05c4c1d861fb5c66d5cbe43',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [294, 344],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '34ae55123c1d43cfb348c738cdf124fd',
      zoneName: 'cb3032f530ae47f5b03b725c80501aef',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [1016, 1106],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '34ae55123c1d43cfb348c738cdf124fd',
      zoneName: 'cf94f018699e4ab5a9c78060d44d1fa0',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [null, null],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '34ae55123c1d43cfb348c738cdf124fd',
      zoneName: 'dcaf8848ab7449abb23d20a9072320d3',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [2749, 2819],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '34ae55123c1d43cfb348c738cdf124fd',
      zoneName: 'fbc748fe3b334181ac5cd882807f7c82',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [18, 22]
    }
  ]
}

const payload = {
  searchString: '',
  filters: { tenantType: ['MSP_INTEGRATOR', 'MSP_REC'] },
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
  const { sliceType, SliceTypeDropdown } = useSliceType()
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
  )
  const { data } = settingsQuery
  useEffect(() => { data && setSettings(data) }, [data])
  const { startDate, endDate, range } = getDatePickerValues(dateFilterState)

  const chartPayload = {
    start: startDate,
    end: endDate,
    ssidRegex: settings['brand-ssid-compliance-matcher']!
  }
  const mspPropertiesData = useMspCustomerListDropdownQuery(
    { params: { tenantId: getJwtTokenPayload().tenantId },payload } )
  const lookupAndMappingData = mspPropertiesData.data
    ? transformLookupAndMappingData(mspPropertiesData.data)
    : {}
  const venuesData = useFetchBrandPropertiesQuery(chartPayload)
  const tableResults = venuesData.data
    ? transformVenuesData(venuesData as { data : BrandVenuesSLA[] }, lookupAndMappingData)
    : []
  const {
    data: chartData,
    ...chartResults
  } = useFetchBrandTimeseriesQuery(chartPayload)
  const [pastStart, pastEnd] = computePastRange(startDate, endDate)
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
  return <Loader states={[settingsQuery, mspPropertiesData, venuesData]}>
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
            tableData={tableResults as Response[]}
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
          data={tableResults as Response[]}
        />
      </GridCol>
    </GridRow>
  </Loader>
}
