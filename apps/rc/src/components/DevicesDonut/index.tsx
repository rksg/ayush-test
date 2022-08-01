import { find }  from 'lodash'
import AutoSizer from 'react-virtualized-auto-sizer'

import { cssStr, Loader }                              from '@acx-ui/components'
import { Card }                                        from '@acx-ui/components'
import { DonutChart }                                  from '@acx-ui/components'
import type { DonutChartData }                         from '@acx-ui/components'
import { SwitchStatusEnum, useDashboardOverviewQuery } from '@acx-ui/rc/services'
import {
  Dashboard,
  ApVenueStatusEnum
} from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { getAPStatusDisplayName, getSwitchStatusDisplayName } from '../Map/VenuesMap/helper'
import { useIntl } from 'react-intl'

const seriesMappingAP = [
  { key: ApVenueStatusEnum.REQUIRES_ATTENTION,
    name: getAPStatusDisplayName(ApVenueStatusEnum.REQUIRES_ATTENTION, false),
    color: cssStr('--acx-semantics-red-50') },
  { key: ApVenueStatusEnum.TRANSIENT_ISSUE,
    name: getAPStatusDisplayName(ApVenueStatusEnum.TRANSIENT_ISSUE, false),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: ApVenueStatusEnum.IN_SETUP_PHASE,
    name: getAPStatusDisplayName(ApVenueStatusEnum.IN_SETUP_PHASE, false),
    color: cssStr('--acx-neutrals-50') },
  { key: ApVenueStatusEnum.OFFLINE,
    name: getAPStatusDisplayName(ApVenueStatusEnum.OFFLINE, false),
    color: cssStr('--acx-neutrals-50') },
  { key: ApVenueStatusEnum.OPERATIONAL,
    name: getAPStatusDisplayName(ApVenueStatusEnum.OPERATIONAL, false),
    color: cssStr('--acx-semantics-green-60') }
] as Array<{ key: string, name: string, color: string }>

export const getApDonutChartData = (overviewData?: Dashboard): DonutChartData[] => {
  const { $t } = useIntl()
  const chartData: DonutChartData[] = []
  const apsSummary = overviewData?.summary?.aps?.summary
  if (apsSummary) {
    seriesMappingAP.forEach(({ key, name, color }) => {
      if (key === ApVenueStatusEnum.OFFLINE && apsSummary[key]) {
        const setupPhase = find(chartData, { name: $t({ defaultMessage: 'In Setup Phase'}) })
        if (setupPhase) {
          setupPhase.name = `${setupPhase.name}: ${setupPhase.value}, ${name}: ${apsSummary[key]}`
          setupPhase.value = setupPhase.value + apsSummary[key]
        } else {
          chartData.push({
            name,
            value: apsSummary[key],
            color
          })
        }
      }
      else if (apsSummary[key]) {
        chartData.push({
          name,
          value: apsSummary[key],
          color
        })
      }
    })
  }
  return chartData
}

const seriesMappingSwitch = [
  { key: SwitchStatusEnum.DISCONNECTED,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.DISCONNECTED),
    color: cssStr('--acx-semantics-red-50') },
  { key: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.NEVER_CONTACTED_CLOUD),
    color: cssStr('--acx-neutrals-50') },
  { key: SwitchStatusEnum.INITIALIZING,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.INITIALIZING),
    color: cssStr('--acx-neutrals-50') },
  { key: SwitchStatusEnum.OPERATIONAL,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.OPERATIONAL),
    color: cssStr('--acx-semantics-green-60') }
] as Array<{ key: string, name: string, color: string }>

export const getSwitchDonutChartData = (overviewData?: Dashboard): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const switchesSummary = overviewData?.summary?.switches?.summary
  if (switchesSummary) {
    seriesMappingSwitch.forEach(({ key, name, color }) => {
      if(key === SwitchStatusEnum.INITIALIZING && switchesSummary[key]) {
        const neverContactedCloud = find(chartData, {
          name: getSwitchStatusDisplayName(SwitchStatusEnum.NEVER_CONTACTED_CLOUD) })
        if (neverContactedCloud) {
          const currentValue: number = neverContactedCloud.value
          neverContactedCloud.value = currentValue + parseInt(switchesSummary[key], 10)
        } else {
          chartData.push({
            name,
            value: parseInt(switchesSummary[key], 10),
            color
          })
        }
      } else if (switchesSummary[key]) {
        chartData.push({
          name,
          value: parseInt(switchesSummary[key], 10),
          color
        })
      }
    })
  }
  return chartData
}

function DevicesDonutWidget () {
  const basePath = useTenantLink('/devices/')
  const navigate = useNavigate()
  const { $t } = useIntl()
  const onClick = (param: string) => {
    navigate({
      ...basePath,
      // TODO Actual path to be updated later
      pathname: `${basePath.pathname}/${param}`
    })
  }

  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: {
        apData: getApDonutChartData(data),
        switchData: getSwitchDonutChartData(data)
      },
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <Card title={ $t({ defaultMessage: 'Devices'}) }>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'inline-flex' }}>
              <DonutChart
                style={{ width: width/2 , height }}
                title={ $t({ defaultMessage: 'Wi-Fi'}) }
                data={queryResults.data.apData}
                onClick={() => onClick('TBD')}/>
              <DonutChart
                style={{ width: width/2, height }}
                title={ $t({ defaultMessage: 'Switch'}) }
                data={queryResults.data.switchData}
                onClick={() => onClick('TBD')}/>
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default DevicesDonutWidget
