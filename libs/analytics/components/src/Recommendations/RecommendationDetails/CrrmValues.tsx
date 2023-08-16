import { Fragment } from 'react'

import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import { EnhancedRecommendation } from './services'
import { StatusTrail }            from './statusTrail'
import {
  DetailsHeader,
  DetailsWrapper,
  Title,
  CrrmTitle,
  CrrmDiv,
  ValueDetails
} from './styledComponents'
import { getRecommendationsText, getValues } from './values'

export const CrrmValues = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const {
    appliedOnce, status, original, current, recommended
  } = getValues(details)
  const applied = appliedOnce && status !== 'reverted'
  const recommendationText = getRecommendationsText(details, $t)

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
      value: applied ? current : recommended
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
      <CrrmTitle>{$t({ defaultMessage: 'Why this recommendation?' })}</CrrmTitle>
      {recommendationText.reasonText}
      <Title>{$t({ defaultMessage: 'Potential trade-off' })}</Title>
      {recommendationText.tradeoffText}
      <StatusTrail details={details}/>
    </GridCol>
  </GridRow>
}
