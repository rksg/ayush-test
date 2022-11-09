import { countBy, isEmpty }   from 'lodash'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { cssStr, Loader, Card , DonutChart }     from '@acx-ui/components'
import type { DonutChartData }                   from '@acx-ui/components'
import { useDashboardOverviewQuery }             from '@acx-ui/rc/services'
import { Dashboard }                             from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

export const getAPClientChartData = (
  overviewData: Dashboard | undefined,
  { $t }: IntlShape
): DonutChartData[] => {
  const seriesMapping = [
    { name: $t({ defaultMessage: 'Poor' }), color: cssStr('--acx-semantics-red-50') },
    { name: $t({ defaultMessage: 'Average' }), color: cssStr('--acx-semantics-yellow-40') },
    { name: $t({ defaultMessage: 'Good' }), color: cssStr('--acx-semantics-green-50') },
    { name: $t({ defaultMessage: 'Unknown' }), color: cssStr('--acx-neutrals-50') }
  ] as Array<{ name: string, color: string }>

  const clientDto = overviewData?.summary?.clients?.clientDto
  if (isEmpty(clientDto)) return []

  const counts = countBy(clientDto, client => client.healthCheckStatus)
  const chartData: DonutChartData[] = []
  seriesMapping.forEach(({ name, color }) => {
    if(counts[name] && counts[name] > 0) {
      chartData.push({
        name,
        value: counts[name],
        color
      })
    }
  })
  return chartData
}

export const getSwitchClientChartData = (
  overviewData: Dashboard | undefined,
  { $t }: IntlShape
): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const switchClients = overviewData?.summary?.switchClients
  if (switchClients && switchClients.totalCount > 0) {
    chartData.push({
      name: $t({ defaultMessage: 'Clients' }),
      value: switchClients.totalCount,
      color: cssStr('--acx-semantics-green-50')
    })
  }
  return chartData
}

export function ClientsWidget () {
  const basePath = useTenantLink('/users/')
  const navigate = useNavigate()
  const { $t } = useIntl()
  const onClick = (param: string) => {
    navigate({
      ...basePath,
      // TODO Actual path to be updated later
      pathname: `${basePath.pathname}/${param}`
    })
  }

  const intl = useIntl()
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: {
        apData: getAPClientChartData(data, intl),
        switchData: getSwitchClientChartData(data, intl)
      }
    })
  })
  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Clients' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'inline-flex' }}>
              <DonutChart
                style={{ width: width/2 , height }}
                title={$t({ defaultMessage: 'Wi-Fi' })}
                showLegend={false}
                data={queryResults.data.apData}
                onClick={() => onClick('TODO')}/>
              <DonutChart
                style={{ width: width/2, height }}
                title={$t({ defaultMessage: 'Switch' })}
                showLegend={false}
                data={queryResults.data.switchData}
                onClick={() => onClick('TODO')}/>
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
