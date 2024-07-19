import { useIntl } from 'react-intl'

import { EnhancedRecommendation } from '../../IntentAIForm/services'
import { IntentAIRRMGraph }       from '../../RRMGraph'
import { isDataRetained }         from '../../utils'
import {
  DetailsHeader,
  DetailsWrapper,
  Wrapper
} from '../styledComponents'

export const CrrmGraph = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  return <Wrapper>
    <DetailsHeader>{$t({ defaultMessage: 'Key Performance Indications' })}</DetailsHeader>
    <DetailsWrapper>
      { details && isDataRetained(details.dataEndTime)
        && <IntentAIRRMGraph
          details={details as EnhancedRecommendation}
        />
      }
    </DetailsWrapper>
  </Wrapper>
}
