import React from 'react'

import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useIntl }            from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { 
  getBarChartSeriesData, 
  AnalyticsFilter, 
  BarChartData 
}                                    from '@acx-ui/analytics/utils'
import { BarChart, Card, cssNumber } from '@acx-ui/components'
import { Loader }                    from '@acx-ui/components'
import { cssStr }                    from '@acx-ui/components'
import { formatter }                 from '@acx-ui/utils'

import { useSwitchesByPoEUsageQuery } from './services'

const barColors = [
  cssStr('--acx-semantics-yellow-40'),
  cssStr('--acx-accents-orange-25'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-blue-40'),
  cssStr('--acx-accents-blue-50')
]

const seriesMapping: BarChartData['seriesEncode'] = [
  { x: 'poeUtilization', y: 'name' }
] 

export function switchUsageLabelFormatter (params: CallbackDataParams): string {
  const usage = Array.isArray(params.data) && params.data[1] 
  const utilisation_per = Array.isArray(params.data) && params.data[2]
  return '{poe_usage|' + formatter('milliWattsFormat')(usage) + '} {utilisation_pct|(' +
    formatter('percentFormat')(utilisation_per) + ')}'
}

const getSwitchUsageRichStyle = () => ({
  poe_usage: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-4-font-size'),
    lineHeight: cssNumber('--acx-body-4-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight-bold')
  },
  utilisation_pct: {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-4-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight')
  }
})

function SwitchesByPoEUsageWidget ({ filters }: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const queryResults = useSwitchesByPoEUsageQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getBarChartSeriesData(data!,seriesMapping),
        ...rest
      })
    })

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 Switches by PoE Usage' })} >
        <AutoSizer>
          {({ height, width }) => (
            <BarChart
              barColors={barColors}
              data={queryResults.data}
              grid={{ top: '2%',right: '17%' }}
              labelFormatter={switchUsageLabelFormatter}
              labelRichStyle={getSwitchUsageRichStyle()}
              style={{ width, height }}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default SwitchesByPoEUsageWidget
