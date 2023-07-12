import { chain, snakeCase }   from 'lodash'
import { IntlShape, useIntl } from 'react-intl'

import { impactedArea, nodeTypes }         from '@acx-ui/analytics/utils'
import { Card, GridCol, GridRow, Tooltip } from '@acx-ui/components'
import { NodeType }                        from '@acx-ui/utils'

import { codes } from '../config'

import { EnhancedRecommendation } from './services'
import {
  DetailsHeader,
  ValueDetails,
  DetailsWrapper,
  Title,
  InfoIcon,
  ValueDetailsWithIcon
} from './styledComponents'


const getValues = (details: EnhancedRecommendation) => {
  const {
    status,
    originalValue,
    currentValue,
    recommendedValue,
    code,
    appliedOnce
  } = details
  const { valueFormatter, recommendedValueTooltipContent } = codes[code]
  return {
    status,
    code,
    appliedOnce,
    heading: codes[code].valueText,
    original: valueFormatter(originalValue),
    current: valueFormatter(currentValue),
    recommended: valueFormatter(recommendedValue),
    tooltipContent: typeof recommendedValueTooltipContent === 'function'
      ? recommendedValueTooltipContent(status, currentValue, recommendedValue)
      : recommendedValueTooltipContent
  }
}

function extractBeforeAfter (value: EnhancedRecommendation['kpis']) {
  const { current, previous, projected } = value!
  const [before, after] = [previous, current, projected]
    .filter(value => value !== null)
  return [before, after]
}

const getKpiConfig = (recommendation: EnhancedRecommendation, key: string) => {
  return codes[recommendation.code]
    .kpis
    .find(kpi => kpi.key === key)
}

const kpiBeforeAfter = (recommendation: EnhancedRecommendation, key: string) => {
  const config = getKpiConfig(recommendation, key)
  const prop = `kpi_${snakeCase(key)}`
  const [before, after] = extractBeforeAfter(recommendation[prop])
    .map(value => config!.format(value))
  return { before, after }
}

const translateMetadataValue = (value: string) => {
  switch (value) {
    case 'BACKGROUND_SCANNING': return 'Background Scanning'
    case 'CHANNEL_FLY': return 'ChannelFly'
    default: return value
  }
}

const getRecommendationsText = (details: EnhancedRecommendation, $t: IntlShape['$t']) => {
  const {
    path,
    sliceType,
    sliceValue,
    originalValue,
    currentValue,
    recommendedValue,
    appliedOnce,
    code
  } = details

  const metadata = chain(details.metadata)
    .toPairs()
    .map(([key, value]) => [key, typeof value === 'string' ? translateMetadataValue(value) : value])
    .fromPairs()
    .value()

  const recommendationInfo = codes[code]
  const { valueFormatter, actionText, reasonText, tradeoffText } = recommendationInfo

  let parameters: Record<string, string | JSX.Element> = {
    ...metadata,
    scope: `${nodeTypes(sliceType as NodeType)}: ${impactedArea(path, sliceValue)}`,
    currentValue: appliedOnce ? valueFormatter(originalValue) : valueFormatter(currentValue),
    recommendedValue: valueFormatter(recommendedValue),
    br: <br />
  }
  if (code.startsWith('c-crrm')) {
    const link = kpiBeforeAfter(details, 'number-of-interfering-links')
    parameters = {
      ...parameters,
      ...link
    }
  }
  return {
    actionText: $t(actionText, parameters),
    reasonText: $t(reasonText, parameters),
    tradeoffText: $t(tradeoffText, parameters)
  }
}

export const Values = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const {
    heading, appliedOnce, status, original, current, recommended, tooltipContent
  } = getValues(details)
  const applied = appliedOnce && status !== 'reverted'
  const firstValue = applied ? original : current
  const firstLabel = applied
    ? $t({ defaultMessage: 'Original Configuration' })
    : $t({ defaultMessage: 'Current Configuration' })
  const secondValue = applied ? current : recommended
  const secondLabel = applied
    ? $t({ defaultMessage: 'Current Configuration' })
    : $t({ defaultMessage: 'Recommended Configuration' })
  const recommendationText = getRecommendationsText(details, $t)
  const tooltipText = typeof tooltipContent === 'string'
    ? tooltipContent
    : typeof tooltipContent === 'undefined'
      ? null
      : $t(tooltipContent)

  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Recommendation Details' })}</DetailsHeader>
    <DetailsWrapper>
      <Card type='solid-bg' title={$t(heading)}>
        <GridRow>
          <GridCol col={{ span: 8 }}>{firstLabel}</GridCol>
          <GridCol col={{ span: 16 }}><ValueDetails>{firstValue}</ValueDetails></GridCol>
          <GridCol col={{ span: 8 }}>{secondLabel}</GridCol>
          <GridCol col={{ span: 16 }}>
            <ValueDetails>
              <ValueDetailsWithIcon>
                {secondValue}
                {tooltipText && <Tooltip title={tooltipText}>
                  <InfoIcon />
                </Tooltip>}
              </ValueDetailsWithIcon>
            </ValueDetails>
          </GridCol>
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