import { Fragment } from 'react'

import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import { CloudRRMGraph }          from './graph'
import { EnhancedRecommendation } from './services'
import { StatusTrail }            from './statusTrail'
import {
  DetailsHeader,
  DetailsWrapper,
  Title,
  CrrmValuesText,
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
      <DetailsHeader>{$t({ defaultMessage: 'Recommendation Details' })}</DetailsHeader>
      <DetailsWrapper>
        <Card type='solid-bg'>
          <GridRow>
            {fields
              .filter(({ value }) => value !== null)
              .map(({ label, value }, ind) => <Fragment key={ind}>
                <GridCol col={{ span: 8 }}>{label}</GridCol>
                <GridCol col={{ span: 16 }}><ValueDetails>{value}</ValueDetails></GridCol>
              </Fragment>)}
          </GridRow>
          <CrrmValuesText>
            {recommendationText.actionText}
          </CrrmValuesText>
        </Card>
      </DetailsWrapper>
      <CloudRRMGraph/>
    </GridCol>
    <GridCol col={{ span: 8 }}>
      <Title>{$t({ defaultMessage: 'Why this recommendation?' })}</Title>
      {recommendationText.reasonText}
      <Title>{$t({ defaultMessage: 'Potential trade-off' })}</Title>
      {recommendationText.tradeoffText}
      <StatusTrail details={details}/>
    </GridCol>
  </GridRow>
}
