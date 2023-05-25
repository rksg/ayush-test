import { useEffect, useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'


import { NetworkFilter }           from '@acx-ui/analytics/components'
import { RangePicker, PageHeader } from '@acx-ui/components'
import { useReportsFilter }        from '@acx-ui/reports/utils'
import { useDateFilter }           from '@acx-ui/utils'

import { ReportType, reportTypeModeMapping } from '../mapping/reportsMapping'

export function ReportHeader (props: {
  type: ReportType,
  showFilter?: boolean
  footer?: React.ReactNode }) {
  const {
    type,
    showFilter=true
  } = props
  const { $t } = useIntl()

  const mode = reportTypeModeMapping[type] || 'both'
  const isRadioBandDisabled = [
    ReportType.APPLICATION,
    ReportType.ACCESS_POINT,
    ReportType.AIRTIME_UTILIZATION
  ].includes(type) || false
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

  return (
    <PageHeader
      title
      extra={[
        showFilter && <NetworkFilter
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
      ]}
      footer={props.footer && props.footer}
      footerSpacer={false}
    />
  )
}
