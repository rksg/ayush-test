import { Typography }         from 'antd'
import { useIntl, IntlShape } from 'react-intl'

import { healthApi }                                           from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig, getSparklineGranularity } from '@acx-ui/analytics/utils'
import { GridRow, GridCol, SparklineChart, Loader, Tooltip }   from '@acx-ui/components'
import { intlFormats, formatter }                              from '@acx-ui/utils'

import { tranformHistResponse, transformTSResponse } from '../Health/Kpi/Pill'

import * as UI from './styledComponents'

const { useKpiTimeseriesQuery, useKpiHistogramQuery } = healthApi

export interface KpiList<T> {
  connectionSuccess: T
  timeToConnect: T
  clientThroughput: T
}

type TimeseriesData = Array<[number, number] | null>

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
           kpiConfig.timeToConnect.histogram.initialThreshold) }),
      tooltip: $t({ defaultMessage: '{n} of {d} connections under {threshold}' },
        { n,d, threshold: formatter('longDurationFormat')(threshold ??
          kpiConfig.timeToConnect.histogram.initialThreshold) })
    },
    clientThroughput: {
      title: $t({ defaultMessage: 'Client Throughput' }),
      shortText: $t({ defaultMessage: 'Above {threshold}' },
        { threshold: formatter('networkSpeedFormat')(threshold ??
           kpiConfig.clientThroughput.histogram.initialThreshold) }),
      tooltip: $t({ defaultMessage: '{n} of {d} sessions above {threshold}' },
        { n,d, threshold: formatter('networkSpeedFormat')(threshold ??
          kpiConfig.clientThroughput.histogram.initialThreshold) })
    }
  }
}

export function KpiWidget ({
  name,
  threshold,
  filters,
  type
}: {
  name: KpiNames;
  threshold?: number | null;
  filters: AnalyticsFilter;
  type?: 'no-chart-style' | 'with-chart-style'
}){
  const { histogram } = Object(kpiConfig[name as keyof typeof kpiConfig])
  const sparklineChartStyle = { height: 50, width: 130, display: 'inline' }
  const { startDate , endDate } = filters
  const venueFilter = filters.filter?.networkNodes?.at(0)?.at(0)
  const intl = useIntl()
  let numerator=0, denominator=0
  if(histogram){
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const histQueryResults = useKpiHistogramQuery(
      { ...filters,
        path: venueFilter ? [...filters.path, venueFilter] : filters.path,
        startDate,
        endDate,
        kpi: name })
    const { success, total } = histQueryResults.data ?
      tranformHistResponse({ ...histQueryResults.data!,
        kpi: name, threshold: threshold as number }) : { success: 0, total: 0 }
    numerator = success
    denominator = total
  }
  const queryResults= useKpiTimeseriesQuery({
    ...filters,
    path: venueFilter ? [...filters.path, venueFilter] : filters.path,
    kpi: name,
    threshold: (threshold ?? '') as string,
    granularity: getSparklineGranularity(startDate,endDate)
  })
  const { data: results } = queryResults

  if(!histogram){
    const { success, total } = results ? transformTSResponse(results!,
      { startDate, endDate }) : { success: 0, total: 0 }
    numerator = success
    denominator = total
  }


  const kpiInfoText=getKpiInfoText(numerator, denominator, threshold, intl)

  const sparklineData:number[] = results?.data ?
    getSparklineData(results.data as TimeseriesData) : []

  const percent = numerator && denominator ? numerator / denominator : 0

  let percentIcon = <UI.CriticalIcon/>

  if(percent > 0.6){
    percentIcon = <UI.HealthyIcon/>
  }else if(percent > 0.2){
    percentIcon = <UI.MajorIcon/>
  }

  return(
    <Loader states={[queryResults]}>
      {type === 'no-chart-style' ?
        <GridRow>
          <GridCol col={{ span: 24 }} >
            <UI.Wrapper>
              <UI.KpiTopTitle>
                {kpiInfoText[name].title}
              </UI.KpiTopTitle>
            </UI.Wrapper>
            <Tooltip title={kpiInfoText[name].tooltip}>
              <UI.Wrapper>
                <UI.LargePercent>
                  {intl.$t(intlFormats.scaleFormatRound, { value: percent })}
                  <Typography.Title level={3}>
                  %
                  </Typography.Title>
                </UI.LargePercent>
              </UI.Wrapper>
            </Tooltip>
          </GridCol>
        </GridRow>
        :
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
            {results?.data && <SparklineChart data={sparklineData}
              style={sparklineChartStyle}
              isTrendLine={true} />}
          </GridCol>
        </GridRow>
      }
    </Loader>
  )
}
