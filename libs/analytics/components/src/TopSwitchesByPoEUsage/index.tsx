import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useIntl, IntlShape } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import {
  getBarChartSeriesData,
  BarChartData
}                             from '@acx-ui/analytics/utils'
import {
  BarChart,
  EventParams,
  HistoricalCard,
  cssNumber,
  cssStr,
  Loader,
  NoData
} from '@acx-ui/components'
import { formatter, intlFormats }                             from '@acx-ui/formatter'
import { NavigateFunction, Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }                               from '@acx-ui/utils'

import { useTopSwitchesByPoEUsageQuery } from './services'

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
export const onClick = (navigate: NavigateFunction, basePath: Path) => {
  return (params: EventParams) => {
    const serial = params.componentType ==='series' && Array.isArray(params.value)
      && params.value[4]
    navigate({
      ...basePath,
      // TODO: Actual path to be updated later
      pathname: `${basePath.pathname}/${serial}/${serial}/details/overview`
    })
  }
}

export { TopSwitchesByPoEUsageWidget as TopSwitchesByPoEUsage }

function TopSwitchesByPoEUsageWidget ({ filters }: { filters : AnalyticsFilter }) {
  const basePath = useTenantLink('/devices/switch/')
  const navigate = useNavigate()

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
      <HistoricalCard title={intl.$t({ defaultMessage: 'Top Switches by PoE Usage' })}>
        <AutoSizer>
          {({ height, width }) => (
            data && data.source?.length > 0
              ?
              <BarChart
                data={data}
                grid={{ top: '10%',right: '17%' }}
                labelFormatter={switchUsageLabelFormatter(intl)}
                labelRichStyle={getSwitchUsageRichStyle()}
                onClick={onClick(navigate,basePath)}
                style={{ width, height: height * 0.9 }}
              />
              :
              <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
