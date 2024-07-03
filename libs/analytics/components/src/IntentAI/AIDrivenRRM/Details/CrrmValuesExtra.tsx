import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import { EnhancedRecommendation } from '../services'

import { DetailsHeader, Wrapper } from './styledComponents'
import { getRecommendationsText } from './Values'

export const CrrmValuesExtra = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const isFullOptimization = !!_.get(details, 'metadata.algorithmData.isCrrmFullOptimization', true)
  const recommendationText = getRecommendationsText(details, isFullOptimization)
  return <Wrapper>
    {/*  */}
    <GridRow>
      <GridCol col={{ span: 12 }}>
        <DetailsHeader>{$t({ defaultMessage: 'Why this recommendation?' })}</DetailsHeader>
        <Card type='default'>
          {recommendationText.reasonText}
        </Card>
      </GridCol>
      <GridCol col={{ span: 12 }}>
        <DetailsHeader>{$t({ defaultMessage: 'Potential trade-off' })}</DetailsHeader>
        <Card type='default'>
          {recommendationText.tradeoffText}
        </Card>
      </GridCol>
    </GridRow>
  </Wrapper>
}
