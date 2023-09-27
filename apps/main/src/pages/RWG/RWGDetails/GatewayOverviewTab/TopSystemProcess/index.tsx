
import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { DonutChartData, Loader, NoActiveContent, qualitativeColorSet } from '@acx-ui/components'
import { useGetGatewayTopProcessQuery }                                 from '@acx-ui/rc/services'
import { GatewayTopProcess }                                            from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

export default function TopSystemProcess () {
  const { $t } = useIntl()
  const { tenantId, gatewayId } = useParams()

  const { data: topProcessData, isLoading: isTopprocessLoading, isFetching: isTopprocessFetching } =
    useGetGatewayTopProcessQuery({ params: { tenantId, gatewayId } }, { skip: !gatewayId })

  function getTopProcessDonutChartData (data: GatewayTopProcess[]): DonutChartData[] {
    const chartData: DonutChartData[] = []
    const colorMapping = qualitativeColorSet()
    if (data && data.length > 0) {
      data.forEach(({ processName, memory }, i) => {
        chartData.push({
          name: processName,
          value: Number(memory),
          color: colorMapping[i]
        })
      })
    }
    return chartData
  }

  return <UI.Wrapper style={{
    justifyContent: 'center'
  }}>
    <Loader states={[{
      isLoading: isTopprocessLoading,
      isFetching: isTopprocessFetching
    }]}>
      { topProcessData && topProcessData.length > 0
        ? <UI.DonutChartWidget
          showTotal={false}
          showLabel={true}
          size={'large'}
          style={{ width: 340, height: 220 }}
          legend={'name'}
          tooltipFormat={defineMessage({
            defaultMessage: `{name}<br></br>
            <space><b>{formattedValue}</b> MB</space>`
          })}
          data={getTopProcessDonutChartData(topProcessData)}/>
        : <NoActiveContent text={$t({ defaultMessage: 'No System Top Processes data' })} />
      }
    </Loader>
  </UI.Wrapper>
}