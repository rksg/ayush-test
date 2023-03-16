import { useEffect, useState } from 'react'

import moment from 'moment-timezone'

import { NetworkFilter, FilterMode } from '@acx-ui/analytics/components'
import { RangePicker, PageHeader }   from '@acx-ui/components'
import { useReportsFilter }          from '@acx-ui/reports/utils'
import { useDateFilter }             from '@acx-ui/utils'

export function ReportHeader (props: {
  name: string,
  mode?:FilterMode,
  showFilter?: boolean
  isRadioBandDisabled?: boolean,
  radioBandDisabledReason?: string,
  footer?: React.ReactNode }) {
  const {
    name,
    mode = 'both',
    isRadioBandDisabled=false,
    radioBandDisabledReason,
    showFilter=true
  } = props
  const [isLoaded, setIsLoaded] = useState(false)
  const shouldQuerySwitch = ['switch','both'].includes(mode)
  const showRadioBand = ['ap','both'].includes(mode)
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { setNetworkPath: setReportsNetworkPath } = useReportsFilter()

  useEffect(()=>{
    if(isLoaded || mode === 'none'){
      // Reset when filter mode changes
      setReportsNetworkPath([],[],[])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[mode])

  useEffect(()=>{
    setIsLoaded(true)
  },[])

  return (
    <PageHeader
      title={name}
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
