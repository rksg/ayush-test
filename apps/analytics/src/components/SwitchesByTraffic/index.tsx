import React from 'react'

import { TooltipComponentFormatterCallbackParams } from 'echarts'
import { CallbackDataParams }                      from 'echarts/types/dist/shared'
import { renderToString }                          from 'react-dom/server'
import { useIntl }                                 from 'react-intl'
import AutoSizer                                   from 'react-virtualized-auto-sizer'


import { 
  getBarChartSeriesData, 
  AnalyticsFilter, 
  BarChartData 
}                             from '@acx-ui/analytics/utils'
import { BarChart, Card, cssNumber, Loader, cssStr, NoData, TooltipWrapper } from '@acx-ui/components'
import { formatter }                                                         from '@acx-ui/utils'

import { useSwitchesByTrafficQuery } from './services'

export const barColors = [
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-30')
]

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

export const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
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

function SwitchesByTrafficWidget ({ filters }: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const queryResults = useSwitchesByTrafficQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getBarChartSeriesData(data!,seriesMapping, 'name'),
        ...rest
      })
    })

  const { data } = queryResults
  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 Switches by Traffic' })} >
        <AutoSizer>
          {({ height, width }) => (
            data && data.source?.length
              ?
              <BarChart
                barColors={barColors}
                barWidth={8}
                data={data}
                grid={{ right: '7%' }}
                labelFormatter={switchTrafficLabelFormatter}
                labelRichStyle={getSwitchTrafficRichStyle()}
                tooltipFormatter={tooltipFormatter}
                style={{ width, height }}
              />:
              <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default SwitchesByTrafficWidget
