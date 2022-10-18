import { Tooltip }            from 'antd'
import { useIntl, IntlShape } from 'react-intl'

import { AnalyticsFilter }                          from '@acx-ui/analytics/utils'
import { GridRow, GridCol, SparklineChart, Loader } from '@acx-ui/components'
import { kpiDefaultThresholds }                     from '@acx-ui/config'
import { intlFormats, formatter }                   from '@acx-ui/utils'

import { useKpiTimeseriesQuery, TimeseriesData } from './services'
import * as UI                                   from './styledComponents'

export interface KpiList<T> {
  connectionSuccess: T
  timeToConnect: T
  clientThroughput: T
}

export type KpiNames = keyof KpiList<void>

const getSparklineData = (data:TimeseriesData) =>{
  const sparkLineData = data.map(item=>
    item && item[1]!==0 ? item[0]/item[1] : 0 )
  return sparkLineData
}

interface KpiInfoText {
  title: string;
  shortText: string;
  tooltip: string;
}

export const getKpiInfoText = (numerator:number,
  denominator:number,
  threshold:number|null|undefined,
  { $t }: IntlShape):KpiList<KpiInfoText> => {
  const n = $t(intlFormats.countFormat, { value: numerator })
  const d = $t(intlFormats.countFormat, { value: denominator })
  return {
    connectionSuccess: {
      title: $t({ defaultMessage: 'Connection Success' }),
      shortText: '',
      tooltip: $t({ defaultMessage: '{n} of {d} attempts' }, { n, d })
    },
    timeToConnect: {
      title: $t({ defaultMessage: 'Time To Connect' }),
      shortText: $t({ defaultMessage: 'Under {threshold}' },
        { threshold: formatter('durationFormat')(threshold ??
           kpiDefaultThresholds.timeToConnect) }),
      tooltip: $t({ defaultMessage: '{n} of {d} connections under {threshold}' },
        { n,d, threshold: formatter('longDurationFormat')(threshold ??
           kpiDefaultThresholds.timeToConnect) })
    },
    clientThroughput: {
      title: $t({ defaultMessage: 'Client Throughput' }),
      shortText: $t({ defaultMessage: 'Above {threshold}' },
        { threshold: formatter('networkSpeedFormat')(threshold ??
           kpiDefaultThresholds.clientThroughput) }),
      tooltip: $t({ defaultMessage: '{n} of {d} sessions above {threshold}' },
        { n,d, threshold: formatter('networkSpeedFormat')(threshold ??
           kpiDefaultThresholds.clientThroughput) })
    }
  }
}

export function KpiWidget ({
  name,
  threshold,
  filters
}: {
  name: KpiNames;
  threshold?: number | null;
  filters: AnalyticsFilter;
}){
  const sparklineChartStyle = { height: 50, width: 130, display: 'inline' }
  const queryResults= useKpiTimeseriesQuery({
    name,
    threshold,
    filters
  })
  const intl = useIntl()
  const { data } = queryResults

  const numerator = data ? data.map(item=>item !== null?item:[0,0])
    .reduce((pv,cv)=>pv + cv[0], 0) : 0
  const denominator = data ? data.map(item=>item !== null?item:[0,0])
    .reduce((pv,cv)=>pv + cv[1], 0) : 0

  const kpiInfoText=getKpiInfoText(numerator, denominator, threshold, intl)

  const sparklineData:number[] = data ? getSparklineData(data) : []

  const percent = numerator && denominator ? numerator / denominator : 0

  let percentIcon = <UI.CriticalIcon/>

  if(percent > 0.6){
    percentIcon = <UI.HealthyIcon/>
  }else if(percent > 0.2){
    percentIcon = <UI.MajorIcon/>
  }

  return(
    <Loader states={[queryResults]}>
      <GridRow>
        <GridCol col={{ span: 7 }}>
          <UI.Wrapper>
            <UI.KpiTitle>
              {kpiInfoText[name].title}
            </UI.KpiTitle>
          </UI.Wrapper>
          <UI.KpiShortText>
            {kpiInfoText[name].shortText}
          </UI.KpiShortText>
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <Tooltip title={kpiInfoText[name].tooltip}>
            <UI.Wrapper>
              {percentIcon}
              <UI.Percent>
                {intl.$t(intlFormats.percentFormatRound, { value: percent })}
              </UI.Percent>
            </UI.Wrapper>
          </Tooltip>
        </GridCol>
        <GridCol col={{ span: 11 }}>
          {data && <SparklineChart data={sparklineData}
            style={sparklineChartStyle}
            isTrendLine={true} />}
        </GridCol>
      </GridRow>
    </Loader>
  )
}
