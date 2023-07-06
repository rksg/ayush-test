import { ReactNode } from 'react'

import { get, pick, snakeCase, isNumber } from 'lodash'
import { useIntl }                        from 'react-intl'

import { Card, Tooltip, TrendPill, TrendType } from '@acx-ui/components'
import { DateFormatEnum, formatter }           from '@acx-ui/formatter'
import { noDataDisplay }                       from '@acx-ui/utils'

import { codes } from '../config'

import { EnhancedRecommendation } from './services'
import { StatusTrail }            from './statusTrail'
import {
  DetailsHeader,
  DetailsWrapper,
  RecommendationCardWrapper,
  KpiTitle,
  RecommendationInfoIcon,
  KpiLabelWrapper,
  KpiContentWrapper,
  KpiLabelValue,
  KpiLabelExtra
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
  const configs = codes[code].kpis
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
        valueAccessor && typeof current !== 'number' ? valueAccessor(current) : current as number,
        deltaSign,
        valueFormatter || format
      )
      : null

    return {
      ...pick(config, ['key', 'label', 'tooltipContent', 'showAps']),
      delta,
      deltaSign: deltaSign === '+'
        ? 'positive'
        : deltaSign === '-'
          ? 'negative'
          : 'none',
      value: current !== null ? format(current) : noDataDisplay
    }
  })

  const monitoring = details.monitoring && kpis.length
    ? details.monitoring
    : null

  return { monitoring, kpis }
}

const KpiCard = ({ children }: { children: ReactNode }) => <RecommendationCardWrapper>
  <DetailsWrapper>
    <Card type='solid-bg'>
      <KpiContentWrapper>
        {children}
      </KpiContentWrapper>
    </Card>
  </DetailsWrapper>
</RecommendationCardWrapper>

const Kpi = ({ kpi }: { kpi: ReturnType<typeof getKpis>['kpis'][0] }) => {
  const { $t } = useIntl()
  const { tooltipContent, label, value, delta, deltaSign } = kpi
  const infoIcon = tooltipContent
    ? <Tooltip title={$t(tooltipContent, { br: <br /> })}>
      <RecommendationInfoIcon />
    </Tooltip>
    : null

  return <KpiCard>
    <KpiTitle>{$t(label)}{infoIcon}</KpiTitle>
    <KpiLabelWrapper>
      <KpiLabelValue>
        {value}
      </KpiLabelValue>
      {delta ?
        <KpiLabelExtra>
          <TrendPill value={delta.label} trend={deltaSign as TrendType} />
        </KpiLabelExtra>
        : null}
    </KpiLabelWrapper>
  </KpiCard>
}

export const Kpis = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const { kpis } = getKpis(details)
  const { monitoring } = details

  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Key Performance Indicators' })}</DetailsHeader>
    {!monitoring && kpis.map((kpi, ind) => <Kpi kpi={kpi} key={ind} />)}
    {monitoring && <KpiCard>
      {$t({ defaultMessage: 'Monitoring performance indicators' })}
      <br />
      {$t({ defaultMessage: 'until {datetime}' },
        { datetime: formatter(DateFormatEnum.DateTimeFormat)(monitoring.until) })}
    </KpiCard>}
    {(!monitoring && !kpis.length) && <KpiCard>
      {$t({ defaultMessage: 'No performance indicators' })}
    </KpiCard>}
    <StatusTrail details={details}/>
  </>
}