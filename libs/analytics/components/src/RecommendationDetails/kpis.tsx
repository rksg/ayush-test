import { get, pick, snakeCase, isNumber } from 'lodash'
import { useIntl }                        from 'react-intl'

import { Card, Tooltip } from '@acx-ui/components'
import { formatter }     from '@acx-ui/formatter'
import { noDataDisplay } from '@acx-ui/utils'

import recommendationConfigs      from './configRecommendations'
import { EnhancedRecommendation } from './services'
import { StatusTrail }            from './statusTrail'
import {
  DetailsHeader,
  DetailsWrapper,
  RecommendationCardWrapper,
  KpiTitle,
  RecommendationInfoIcon,
  KpiLabel,
  KpiContentWrapper
} from './styledComponents'

const kpiDelta = (
  before: number,
  after: number,
  sign: string,
  format: ReturnType<typeof formatter>) => {
  const tolerance = 5 / 100 // 5%

  let value = null
  let label: string = noDataDisplay
  if (!isNumber(before) || !isNumber(after)) return { value, label }
  let d = after - before
  const isPercent = format(d).includes('%')
  if (isPercent) {
    d = parseFloat(d.toFixed(4))
  }
  const percentChange = isPercent || before === 0 ? d : (d / before)
  const formatted = formatter('percentFormat')(Math.abs(percentChange))

  label = d > 0
    ? `+${formatted}`
    : d < 0
      ? `-${formatted}`
      : '='

  switch (true) {
    case percentChange >= tolerance:
      value = sign === '+' ? '1' : '-1'
      break
    case percentChange <= -tolerance:
      value = sign === '+' ? '-1' : '1'
      break
    default:
      value = '0'
  }

  return { value, label }
}

const getKpis = (details: EnhancedRecommendation) => {
  const { code } = details
  const configs = recommendationConfigs[code].kpis
  const kpis = configs.map((config) => {
    const { current, previous } = get(
      details,
      `kpi_${snakeCase(config.key)}`,
      { current: null, previous: null }
    )
    const { valueAccessor, deltaSign, valueFormatter, format } = config
    const delta = previous !== null && config.deltaSign !== 'none'
      ? kpiDelta(
        valueAccessor ? valueAccessor([previous]) : previous,
        valueAccessor ? valueAccessor([current]) : current,
        deltaSign,
        valueFormatter || format
      )
      : null

    return {
      ...pick(config, ['key', 'label', 'tooltipContent', 'showAps']),
      delta,
      value: current !== null ? format(current) : noDataDisplay
    }
  })

  const monitoring = details.monitoring && kpis.length
    ? details.monitoring
    : null

  return { monitoring, kpis }
}

const Kpi = ({ kpi }: { kpi: ReturnType<typeof getKpis>['kpis'][0] }) => {
  const { $t } = useIntl()
  const { tooltipContent, label, value } = kpi
  const infoIcon = tooltipContent
    ? <Tooltip title={$t(tooltipContent, { br: <br /> })}>
      <RecommendationInfoIcon />
    </Tooltip>
    : null

  return <RecommendationCardWrapper>
    <DetailsWrapper>
      <Card type='solid-bg'>
        <KpiContentWrapper>
          <KpiTitle>{$t(label)}{infoIcon}</KpiTitle>
          <KpiLabel>{value}</KpiLabel>
        </KpiContentWrapper>
      </Card>
    </DetailsWrapper>
  </RecommendationCardWrapper>
}

export const Kpis = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const { kpis } = getKpis(details)
  const { monitoring } = details

  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Key Performance Indicators' })}</DetailsHeader>
    {kpis.map((kpi, ind) => <Kpi kpi={kpi} key={ind} />)}
    {monitoring && <RecommendationCardWrapper>
      <DetailsWrapper>
        <Card type='solid-bg'>
          <KpiContentWrapper>
            {$t({ defaultMessage: 'Monitoring performance indicators' })}
            <br />
            {$t({ defaultMessage: 'until {datetime}' },
              { datetime: formatter('calendarFormat')(monitoring.until) })}
          </KpiContentWrapper>
        </Card>
      </DetailsWrapper>
    </RecommendationCardWrapper>}
    {!kpis.length && <RecommendationCardWrapper>
      <DetailsWrapper>
        <Card type='solid-bg'>
          <KpiContentWrapper>
            {$t({ defaultMessage: 'No performance indicators' })}
          </KpiContentWrapper>
        </Card>
      </DetailsWrapper>
    </RecommendationCardWrapper>}
    <StatusTrail details={details}/>
  </>
}