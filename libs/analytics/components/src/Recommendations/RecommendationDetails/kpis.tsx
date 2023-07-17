import { ReactNode } from 'react'

import { get, pick, snakeCase } from 'lodash'
import { useIntl }              from 'react-intl'

import { TrendTypeEnum, kpiDelta }   from '@acx-ui/analytics/utils'
import { Card, Tooltip, TrendPill }  from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { noDataDisplay }             from '@acx-ui/utils'

import { codes } from '../config'

import { EnhancedRecommendation } from './services'
import { StatusTrail }            from './statusTrail'
import {
  DetailsHeader,
  DetailsWrapper,
  KpiTitle,
  InfoIcon,
  KpiLabelWrapper,
  KpiContentWrapper,
  KpiLabelValue,
  KpiLabelExtra,
  KpiWrapper
} from './styledComponents'

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
      deltaSign: delta?.trend === 'transparent'
        ? TrendTypeEnum.None
        : delta?.trend,
      value: current !== null ? format(current) : noDataDisplay
    }
  })

  const monitoring = details.monitoring && kpis.length
    ? details.monitoring
    : null

  return { monitoring, kpis }
}

const KpiCard = ({ children }: { children: ReactNode }) => <KpiWrapper>
  <DetailsWrapper>
    <Card type='solid-bg'>
      <KpiContentWrapper>
        {children}
      </KpiContentWrapper>
    </Card>
  </DetailsWrapper>
</KpiWrapper>

const Kpi = ({ kpi }: { kpi: ReturnType<typeof getKpis>['kpis'][0] }) => {
  const { $t } = useIntl()
  const { tooltipContent, label, value, delta, deltaSign } = kpi
  const infoIcon = tooltipContent
    ? <Tooltip title={$t(tooltipContent, { br: <br /> })}>
      <InfoIcon />
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
          <TrendPill value={delta.value} trend={deltaSign as TrendTypeEnum} />
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