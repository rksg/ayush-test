import React from 'react'

import { TooltipComponentFormatterCallbackParams } from 'echarts'
import { CallbackDataParams }                      from 'echarts/types/dist/shared'
import { renderToString }                          from 'react-dom/server'
import { useIntl }                                 from 'react-intl'
import AutoSizer                                   from 'react-virtualized-auto-sizer'


import {
  getBarChartSeriesData,
  BarChartData
}                                     from '@acx-ui/analytics/utils'
import {
  BarChart,
  HistoricalCard,
  cssNumber,
  Loader,
  cssStr,
  NoData,
  TooltipWrapper,
  EventParams
}                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { formatter }                                          from '@acx-ui/formatter'
import { NavigateFunction, Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { useTrackLoadTime, widgetsMapping }                   from '@acx-ui/utils'
import type { AnalyticsFilter }                               from '@acx-ui/utils'

import { useTopSwitchesByTrafficQuery } from './services'

const seriesMapping: BarChartData['seriesEncode'] = [
  { x: 'Transmitted', y: 'name', seriesName: 'Transmitted' },
  { x: 'Received', y: 'name', seriesName: 'Received' }
]

function switchTrafficLabelFormatter (params: CallbackDataParams): string {
  const usage = Array.isArray(params.data) && params.data[params?.encode?.['x'][0]!]
  return '{traffic|' +formatter('bytesFormat')(usage) + '}'
}

const getSwitchTrafficRichStyle = () => ({
  traffic: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-5-font-weight')
  }
})

export const tooltipFormatter = (callbackParams: TooltipComponentFormatterCallbackParams) => {
  const params = Array.isArray(callbackParams)
    ? callbackParams : (callbackParams ? [callbackParams] : null)
  const name = Array.isArray(params) && Array.isArray(params[0].data) ? params[0].data[0] : ''
  const mac = Array.isArray(params) && Array.isArray(params[0].data) ? params[0].data[1] : ''
  return renderToString(
    <TooltipWrapper>
      <div>
        {name as string}
        <b> ({mac as string})</b>
      </div>
    </TooltipWrapper>
  )
}

export const onClick = (navigate: NavigateFunction, basePath: Path) => {
  return (params: EventParams) => {
    const serial = params.componentType ==='series' && Array.isArray(params.value)
      && params.value[4]
    const mac = params.componentType === 'series' && Array.isArray(params.value)
      && params.value[1]
    if (serial && mac) {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${mac.toString().toLowerCase()}/${serial}/details/overview`
      })
    }
  }
}

export { TopSwitchesByTrafficWidget as TopSwitchesByTraffic }

function TopSwitchesByTrafficWidget ({ filters }: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const basePath = useTenantLink('/devices/switch/')
  const navigate = useNavigate()
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const queryResults = useTopSwitchesByTrafficQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getBarChartSeriesData(data!,seriesMapping, 'name'),
        ...rest
      })
    })

  const { data } = queryResults

  useTrackLoadTime({
    itemName: widgetsMapping.TOP_SWITCHES_BY_TRAFFIC,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Switches by Traffic' })}>
        <AutoSizer>
          {({ height, width }) => (
            data && data.source?.length
              ?
              <BarChart
                barWidth={8}
                data={data}
                grid={{ right: '7%' }}
                labelFormatter={switchTrafficLabelFormatter}
                labelRichStyle={getSwitchTrafficRichStyle()}
                onClick={onClick(navigate,basePath)}
                tooltipFormatter={tooltipFormatter}
                style={{ width, height }}
                silent={false}
                tooltip={{
                  trigger: 'item'
                }}
              />:
              <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
