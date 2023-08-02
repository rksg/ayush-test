import { Fragment } from 'react'

import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow, Tooltip } from '@acx-ui/components'

import { EnhancedRecommendation } from './services'
import { StatusTrail }            from './statusTrail'
import {
  DetailsHeader,
  DetailsWrapper,
  Title,
  InfoIcon,
  ValueDetailsWithIcon,
  CrrmTitle,
  CrrmDiv,
  ValueDetails
} from './styledComponents'
import { getRecommendationsText, getValues } from './values'

export const CrrmValues = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const {
    appliedOnce, status, original, current, recommended, tooltipContent
  } = getValues(details)
  const applied = appliedOnce && status !== 'reverted'
  const secondValue = applied ? current : recommended
  const recommendationText = getRecommendationsText(details, $t)
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

  return <GridRow>
    <GridCol col={{ span: 16 }}>
      <DetailsWrapper>
        <DetailsHeader>{$t({ defaultMessage: 'Recommendation Details' })}</DetailsHeader>
        <Card type='solid-bg'>
          <GridRow>
            {fields
              .filter(({ value }) => value !== null)
              .map(({ label, value }, ind) => <Fragment key={ind}>
                <GridCol col={{ span: 8 }}>{label}</GridCol>
                <GridCol col={{ span: 16 }}><ValueDetails>{value}</ValueDetails></GridCol>
              </Fragment>)}
          </GridRow>
          <CrrmDiv>
            {recommendationText.actionText}
          </CrrmDiv>
        </Card>
      </DetailsWrapper>
      <div style={{ paddingTop: 50 }}>Crrm Graph</div>
    </GridCol>
    <GridCol col={{ span: 8 }}>
      <CrrmTitle>{$t({ defaultMessage: 'Why is the recommendation?' })}</CrrmTitle>
      {recommendationText.reasonText}
      <Title>{$t({ defaultMessage: 'Potential trade-off' })}</Title>
      {recommendationText.tradeoffText}
      <StatusTrail details={details}/>
    </GridCol>
  </GridRow>
}
