import { useEffect, useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { NetworkFilter }    from '@acx-ui/analytics/components'
import { RangePicker }      from '@acx-ui/components'
import { useReportsFilter } from '@acx-ui/reports/utils'
import { useDateFilter }    from '@acx-ui/utils'

import { ReportType, reportModeMapping, bandDisabledReports } from '../mapping/reportsMapping'

export function PageHeaderExtra (type: ReportType) {
  const { $t } = useIntl()
  const mode = reportModeMapping[type] || 'both'
  const isRadioBandDisabled = bandDisabledReports.includes(type) || false
  let radioBandDisabledReason = isRadioBandDisabled ?
    $t({ defaultMessage: 'Radio Band is not available for this report.' }) : ''

  const [isLoaded, setIsLoaded] = useState(false)
  const shouldQuerySwitch = ['switch','both'].includes(mode)
  const showRadioBand = ['ap','both'].includes(mode)
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { setNetworkPath } = useReportsFilter()

  useEffect(()=>{
    if(isLoaded || mode === 'none'){
      // Reset when filter mode changes
      setNetworkPath([],[],[])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[mode])

  useEffect(()=>{
    setIsLoaded(true)
  },[])

  return <>
    [
    <NetworkFilter
      key='reports-network-filter'
      shouldQuerySwitch={shouldQuerySwitch}
      showRadioBand={showRadioBand}
      multiple={true}
      filterMode={mode}
      filterFor={'reports'}
      isRadioBandDisabled={isRadioBandDisabled}
      radioBandDisabledReason={radioBandDisabledReason}
    />,
    <RangePicker
      key='range-picker'
      selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
      onDateApply={setDateFilter as CallableFunction}
      showTimePicker
      selectionType={range}
    />
    ]
  </>
}
