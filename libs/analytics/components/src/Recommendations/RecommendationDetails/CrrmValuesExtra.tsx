import _           from 'lodash'
import { useIntl } from 'react-intl'

import { EnhancedRecommendation } from './services'
import { Title }                  from './styledComponents'
import { getRecommendationsText } from './Values'

export const CrrmValuesExtra = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const isFullOptimization = !!_.get(details, 'metadata.algorithmData.isCrrmFullOptimization', true)
  const recommendationText = getRecommendationsText(details, isFullOptimization)
  return <>
    <Title>{$t({ defaultMessage: 'Why this recommendation?' })}</Title>
    {recommendationText.reasonText}
    <Title>{$t({ defaultMessage: 'Potential trade-off' })}</Title>
    {recommendationText.tradeoffText}
  </>
}
