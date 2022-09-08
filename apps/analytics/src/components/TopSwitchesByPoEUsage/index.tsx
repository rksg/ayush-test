import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useIntl, IntlShape } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import {
  getBarChartSeriesData,
  AnalyticsFilter,
  BarChartData
}                             from '@acx-ui/analytics/utils'
import {
  BarChart,
  NoData,
  Card,
  cssNumber,
  Loader,
  cssStr
} from '@acx-ui/components'
import { formatter, intlFormats } from '@acx-ui/utils'

import { useTopSwitchesByPoEUsageQuery } from './services'

const barColors = [
  cssStr('--acx-semantics-yellow-40'),
  cssStr('--acx-accents-orange-25'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-blue-40'),
  cssStr('--acx-accents-blue-50')
]

const seriesMapping: BarChartData['seriesEncode'] = [
  { x: 'usage', y: 'name' }
]

export function switchUsageLabelFormatter (intl: IntlShape) {
  return (params: CallbackDataParams): string => {
    const { $t } = intl
    const usage = Array.isArray(params.data) && params.data[1]
    const utilisation_per = Array.isArray(params.data) && params.data[2]
    return '{poe_usage|' + formatter('milliWattsFormat')(usage) + '} {utilisation_pct|(' +
      $t(intlFormats.percentFormat, { value: utilisation_per }) + ')}'
  }
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

function TopSwitchesByPoEUsageWidget ({ filters }: { filters : AnalyticsFilter }) {
  const intl = useIntl()
  const queryResults = useTopSwitchesByPoEUsageQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getBarChartSeriesData(data!,seriesMapping),
        ...rest
      })
    })

  const { data } = queryResults
  return (
    <Loader states={[queryResults]}>
      <Card title={intl.$t({ defaultMessage: 'Top 5 Switches by PoE Usage' })} >
        <AutoSizer>
          {({ height, width }) => (
            data && data.source?.length > 0
              ?
              <BarChart
                barColors={barColors}
                data={data}
                grid={{ top: '10%',right: '17%' }}
                labelFormatter={switchUsageLabelFormatter(intl)}
                labelRichStyle={getSwitchUsageRichStyle()}
                style={{ width, height: height * 0.9 }}
              />
              :
              <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default TopSwitchesByPoEUsageWidget
