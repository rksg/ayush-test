import _           from 'lodash'
import { useIntl } from 'react-intl'

import { EnhancedRecommendation } from './services'
import { Title }                  from './styledComponents'
import { getRecommendationsText } from './Values'

export const CrrmValuesExtra = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const isFullyOptimized = !!_.get(details, 'metadata.algorithmData.isFullyOptimized', true)
  const recommendationText = getRecommendationsText(details, isFullyOptimized)
  return <>
    <Title>{$t({ defaultMessage: 'Why this recommendation?' })}</Title>
    {recommendationText.reasonText}
    <Title>{$t({ defaultMessage: 'Potential trade-off' })}</Title>
    {recommendationText.tradeoffText}
  </>
}
