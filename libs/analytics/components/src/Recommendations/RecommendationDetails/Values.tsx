import { Fragment } from 'react'

import { chain, snakeCase } from 'lodash'
import { useIntl }          from 'react-intl'

import { impactedArea, nodeTypes }          from '@acx-ui/analytics/utils'
import { Card, GridCol, GridRow, Tooltip }  from '@acx-ui/components'
import { DateFormatEnum, formatter }        from '@acx-ui/formatter'
import { NodeType, getIntl, noDataDisplay } from '@acx-ui/utils'

import { codes }              from '../config'
import { extractBeforeAfter } from '../services'
import { isDataRetained }     from '../utils'

import { EnhancedRecommendation } from './services'
import {
  DetailsHeader,
  ValueDetails,
  DetailsWrapper,
  Title,
  InfoIcon,
  ValueDetailsWithIcon
} from './styledComponents'


export const getValues = (details: EnhancedRecommendation) => {
  const {
    status,
    originalValue,
    currentValue,
    recommendedValue,
    code,
    appliedOnce,
    firstAppliedAt,
    preferences
  } = details
  const { valueFormatter, recommendedValueTooltipContent } = codes[code]
  return {
    status,
    code,
    appliedOnce,
    firstAppliedAt,
    preferences,
    heading: codes[code].valueText,
    original: valueFormatter(originalValue),
    current: valueFormatter(currentValue),
    recommended: valueFormatter(recommendedValue),
    tooltipContent: typeof recommendedValueTooltipContent === 'function'
      ? recommendedValueTooltipContent(status, currentValue, recommendedValue)
      : recommendedValueTooltipContent
  }
}

export const getKpiConfig = (recommendation: EnhancedRecommendation, key: string) => {
  return codes[recommendation.code]
    .kpis
    .find(kpi => kpi.key === key)
}

export const kpiBeforeAfter = (recommendation: EnhancedRecommendation, key: string) => {
  const config = getKpiConfig(recommendation, key)
  const prop = `kpi_${snakeCase(key)}`
  const [before, after] = extractBeforeAfter(recommendation[prop])
    .map(value => config!.format(value))
  return { before, after }
}

export const translateMetadataValue = (value: string) => {
  switch (value) {
    case 'BACKGROUND_SCANNING': return 'Background Scanning'
    case 'CHANNEL_FLY': return 'ChannelFly'
    default: return value
  }
}

export const getRecommendationsText = (
  details: EnhancedRecommendation,
  isFullOptimization = true
) => {
  const { $t } = getIntl()
  const {
    path,
    sliceType,
    sliceValue,
    originalValue,
    currentValue,
    recommendedValue,
    appliedOnce,
    code,
    status,
    firstAppliedAt
  } = details

  const metadata = chain(details.metadata)
    .toPairs()
    .map(([key, value]) => [key, typeof value === 'string' ? translateMetadataValue(value) : value])
    .fromPairs()
    .value()

  const recommendationInfo = codes[code]
  const {
    appliedReasonText,
    valueFormatter,
    actionText,
    appliedActionText,
    passRetentionPeriodActionText,
    reasonText,
    tradeoffText,
    partialOptimizedActionText,
    partialOptimizationAppliedReasonText,
    partialOptimizedTradeoffText
  } = recommendationInfo

  const isCrrm = code.startsWith('c-crrm')

  let parameters: Record<string, string | JSX.Element> = {
    ...metadata,
    scope: `${nodeTypes(sliceType as NodeType)}: ${impactedArea(path, sliceValue)}`,
    currentValue: appliedOnce ? valueFormatter(originalValue) : valueFormatter(currentValue),
    recommendedValue: valueFormatter(recommendedValue),
    br: <br />
  }
  if (isCrrm) {
    const link = kpiBeforeAfter(details, 'number-of-interfering-links')
    parameters = {
      ...parameters,
      ...link,
      scopeType: nodeTypes(sliceType as NodeType),
      initialTime: formatter(
        DateFormatEnum.DateTimeFormat)(details.statusTrail.slice(-1)[0].createdAt),
      ...(status === 'applied' && { appliedTime: formatter(DateFormatEnum.DateTimeFormat)(
        details.statusTrail.filter(r => r.status === 'applied')[0].createdAt)
      })
    }
  }

  return {
    actionText: isCrrm
      ? isDataRetained(firstAppliedAt)
        ? status === 'applied'
          ? $t(appliedActionText!, parameters)
          : (isFullOptimization
            ? $t(actionText, parameters) : $t(partialOptimizedActionText!, parameters))
        : $t(passRetentionPeriodActionText!, parameters)
      : $t(actionText, parameters),
    reasonText: appliedOnce && appliedReasonText
      ? (isFullOptimization
        ? $t(appliedReasonText, parameters)
        : $t(partialOptimizationAppliedReasonText!, parameters)
      )
      : $t(reasonText, parameters),
    tradeoffText: isFullOptimization
      ? $t(tradeoffText, parameters)
      : $t(partialOptimizedTradeoffText!, parameters)
  }
}

export const Values = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const {
    heading, appliedOnce, status, original, current, recommended, tooltipContent
  } = getValues(details)
  const applied = appliedOnce && status !== 'reverted'
  const secondValue = applied ? current : recommended
  const recommendationText = getRecommendationsText(details)
  const tooltipText = typeof tooltipContent === 'string'
    ? tooltipContent
    : typeof tooltipContent === 'undefined'
      ? null
      : $t(tooltipContent)

  const fields = [
    {
      label: applied
        ? $t({ defaultMessage: 'Original Configuration' })
        : $t({ defaultMessage: 'Current Configuration' }),
      value: applied ? original : current
    },
    {
      label: applied
        ? $t({ defaultMessage: 'Current Configuration' })
        : $t({ defaultMessage: 'Recommended Configuration' }),
      value: tooltipText
        ? <ValueDetailsWithIcon>
          {secondValue}
          {tooltipText && <Tooltip title={tooltipText}>
            <InfoIcon />
          </Tooltip>}
        </ValueDetailsWithIcon>
        : secondValue
    }
  ]

  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Recommendation Details' })}</DetailsHeader>
    <DetailsWrapper>
      <Card type='solid-bg' title={$t(heading)}>
        <GridRow>
          {fields
            .filter(({ value }) => [null, noDataDisplay as string]
              .includes(value as unknown as string | null) === false)
            .map(({ label, value }, ind) => <Fragment key={ind}>
              <GridCol col={{ span: 8 }}>{label}</GridCol>
              <GridCol col={{ span: 16 }}><ValueDetails>{value}</ValueDetails></GridCol>
            </Fragment>)}
        </GridRow>
      </Card>
    </DetailsWrapper>
    <Title>{$t({ defaultMessage: 'What is the recommendation?' })}</Title>
    {recommendationText.actionText}
    <Title>{$t({ defaultMessage: 'Why this recommendation?' })}</Title>
    {recommendationText.reasonText}
    <Title>{$t({ defaultMessage: 'What is the potential trade-off?' })}</Title>
    {recommendationText.tradeoffText}
  </>
}
