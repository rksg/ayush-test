import { chain }              from 'lodash'
import { IntlShape, useIntl } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import configRecommendationsData  from './configRecommendationData'
import configRecommendations      from './configRecommendations'
import { EnhancedRecommendation } from './services'
import {
  DetailsHeader,
  ValueDetails,
  DetailsWrapper,
  RecommendationTitle,
  RecommendationDivider,
  RecommendationCardWrapper
} from './styledComponents'

const { states } = configRecommendationsData

const getValues = (details: EnhancedRecommendation) => {
  const {
    status,
    originalValue,
    currentValue,
    recommendedValue,
    code,
    appliedOnce
  } = details
  const { valueFormatter, recommendedValueTooltipContent } = configRecommendations[code]
  return {
    status,
    code,
    appliedOnce,
    heading: configRecommendations[code].valueText,
    original: valueFormatter(originalValue),
    current: valueFormatter(currentValue),
    recommended: valueFormatter(recommendedValue),
    tooltipContent: typeof recommendedValueTooltipContent === 'function'
      ? recommendedValueTooltipContent(status, currentValue, recommendedValue)
      : recommendedValueTooltipContent
  }
}

const getRecommendationsText = (details: EnhancedRecommendation, $t: IntlShape['$t']) => {
  const metadata = chain(details.metadata).value()
  const recommendationInfo = configRecommendations[details.code]
  const { valueFormatter, actionText, reasonText, tradeoffText } = recommendationInfo
  const {
    sliceValue,
    originalValue,
    currentValue,
    recommendedValue,
    appliedOnce
  } = details
  let parameters = {
    ...metadata,
    scope: sliceValue,
    currentValue: appliedOnce ? valueFormatter(originalValue) : valueFormatter(currentValue),
    recommendedValue: valueFormatter(recommendedValue),
    br: <br />
  }

  return {
    actionText: $t(actionText, parameters),
    reasonText: $t(reasonText, parameters),
    tradeoffText: $t(tradeoffText, parameters)
  }
}

export const Values = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const { heading, appliedOnce, status, original, current, recommended } = getValues(details)
  const applied = appliedOnce && status !== states.reverted
  const firstValue = applied ? original : current
  const firstLabel = applied
    ? $t({ defaultMessage: 'Original Configuration' })
    : $t({ defaultMessage: 'Current Configuration' })
  const secondValue = applied ? current : recommended
  const secondLabel = !applied
    ? $t({ defaultMessage: 'Original Configuration' })
    : $t({ defaultMessage: 'Current Configuration' })
  const recommendationText = getRecommendationsText(details, $t)
  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Recommendation Details' })}</DetailsHeader>
    <DetailsWrapper>
      <Card type='solid-bg' title={$t(heading)}>
        <GridRow>
          <GridCol col={{ span: 12 }}>
            {firstLabel}
          </GridCol>
          <GridCol col={{ span: 12 }}>
            <ValueDetails>{firstValue}</ValueDetails>
          </GridCol>
          <GridCol col={{ span: 12 }}>
            {secondLabel}
          </GridCol>
          <GridCol col={{ span: 12 }}>
            <ValueDetails>{secondValue}</ValueDetails>
          </GridCol>
        </GridRow>
      </Card>
      <RecommendationCardWrapper>
        <GridRow>
          <GridCol col={{ span: 24 }}>
            <RecommendationTitle>
              {$t({ defaultMessage: 'What is the recommendation?' })}
            </RecommendationTitle>
            <RecommendationDivider />
            {recommendationText.actionText}
          </GridCol>
          <GridCol col={{ span: 24 }}>
            <RecommendationTitle>
              {$t({ defaultMessage: 'Why this recommendation?' })}
            </RecommendationTitle>
            <RecommendationDivider />
            {recommendationText.reasonText}
          </GridCol>
          <GridCol col={{ span: 24 }}>
            <RecommendationTitle>
              {$t({ defaultMessage: 'What is the potential trade-off?' })}
            </RecommendationTitle>
            <RecommendationDivider />
            {recommendationText.tradeoffText}
          </GridCol>
        </GridRow>
      </RecommendationCardWrapper>
    </DetailsWrapper>
  </>
}