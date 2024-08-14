import { useIntl } from 'react-intl'

import { ProcessedCloudRRMGraph } from '@acx-ui/components'

import {
  DetailsHeader,
  DetailsWrapper,
  Wrapper
} from '../../IntentAIDetails/styledComponents'
import { EnhancedIntent }                    from '../../IntentAIForm/services'
import { dataRetentionText, isDataRetained } from '../../utils'
import { IntentAIRRMGraph }                  from '../RRMGraph'

export const CrrmGraph = ({ details, summaryUrlBefore, summaryUrlAfter, crrmData }:
  {
    details: EnhancedIntent,
    summaryUrlBefore: string,
    summaryUrlAfter: string,
    crrmData: ProcessedCloudRRMGraph[]
  }) => {
  const { $t } = useIntl()
  return <Wrapper>
    <DetailsHeader>{$t({ defaultMessage: 'Key Performance Indications' })}</DetailsHeader>
    <DetailsWrapper>
      { details && isDataRetained(details.dataEndTime)
        ? <IntentAIRRMGraph
          details={details as EnhancedIntent}
          crrmData={crrmData}
          summaryUrlBefore={summaryUrlBefore}
          summaryUrlAfter={summaryUrlAfter}
        />
        : $t(dataRetentionText)}
    </DetailsWrapper>
  </Wrapper>
}
