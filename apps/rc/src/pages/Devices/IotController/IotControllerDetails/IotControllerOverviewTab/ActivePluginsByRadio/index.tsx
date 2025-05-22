import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  Loader,
  Card,
  DonutChart,
  NoActiveData,
  qualitativeColorSet
} from '@acx-ui/components'
import type { DonutChartData }          from '@acx-ui/components'
import { useIotControllerPluginsQuery } from '@acx-ui/rc/services'
import { ActivePluginsData }            from '@acx-ui/rc/utils'
import { useParams }                    from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

// eslint-disable-next-line max-len
export const getActivePluginsByRadioDonutChartData = (overviewData?: ActivePluginsData): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const colorMapping = qualitativeColorSet()
  // eslint-disable-next-line max-len
  if (overviewData && overviewData.pluginStatus && overviewData.pluginStatus.length > 0) {
    overviewData.pluginStatus.forEach(({ name }, index) => {
      chartData.push({
        name,
        value: 1,
        color: colorMapping[index]
      })
    })
  }
  return chartData
}

export function ActivePluginsByRadio () {
  const { $t } = useIntl()

  const overviewQuery = useIotControllerPluginsQuery({
    params: useParams()
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getActivePluginsByRadioDonutChartData(data),
      ...rest
    })
  })

  const { data } = overviewQuery

  return (
    <Loader states={[overviewQuery]}>
      <Card title={$t({ defaultMessage: 'Active Plugins by Radio' })}>
        <AutoSizer>
          {({ height, width }) => (
            (data && data.length > 0 && false)
              ? <UI.Container>
                <DonutChart
                  style={{ width, height }}
                  data={data}
                  showLegend={true}
                  showTotal={false}
                  legend='name'
                  size={'x-large'}
                />
              </UI.Container>
              : <NoActiveData text={$t({ defaultMessage: 'No Active Plugins by Radio' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
