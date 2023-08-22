import { useIntl } from 'react-intl'

import { EnhancedRecommendation } from './services'
import { Title }                  from './styledComponents'
import { getRecommendationsText } from './Values'

export const CrrmValuesExtra = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const recommendationText = getRecommendationsText(details, $t)

  return <>
    <Title>{$t({ defaultMessage: 'Why this recommendation?' })}</Title>
    {recommendationText.reasonText}
    <Title>{$t({ defaultMessage: 'Potential trade-off' })}</Title>
    {recommendationText.tradeoffText}
  </>
}
