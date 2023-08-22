import { Fragment } from 'react'

import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import { EnhancedRecommendation } from './services'
import {
  DetailsHeader,
  DetailsWrapper,
  CrrmValuesText,
  ValueDetails
} from './styledComponents'
import { getRecommendationsText, getValues } from './Values'

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

  return <>
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
  </>
}
