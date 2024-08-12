import { useIntl } from 'react-intl'

import { EnhancedIntent }                    from '../../IntentAIForm/services'
import { IntentAIRRMGraph }                  from '../../RRMGraph'
import { dataRetentionText, isDataRetained } from '../../utils'
import {
  DetailsHeader,
  DetailsWrapper,
  Wrapper
} from '../styledComponents'

export const CrrmGraph = ({ details }: { details: EnhancedIntent }) => {
  const { $t } = useIntl()
  return <Wrapper>
    <DetailsHeader>{$t({ defaultMessage: 'Key Performance Indications' })}</DetailsHeader>
    <DetailsWrapper>
      { details && isDataRetained(details.dataEndTime)
        ? <IntentAIRRMGraph
          details={details as EnhancedIntent}
        /> : $t(dataRetentionText)
      }
    </DetailsWrapper>
  </Wrapper>
}
