import { useIntl } from 'react-intl'

import { ProcessedCloudRRMGraph } from '@acx-ui/components'

import { DetailsSection }                    from '../../common/DetailsSection'
import { useIntentContext }                  from '../../IntentContext'
import { dataRetentionText, isDataRetained } from '../../utils'
import { IntentAIRRMGraph }                  from '../RRMGraph'

export const CrrmGraph = ({ summaryUrlBefore, summaryUrlAfter, crrmData }: {
  summaryUrlBefore: string,
  summaryUrlAfter: string,
  crrmData: ProcessedCloudRRMGraph[]
}) => {
  const { $t } = useIntl()
  const { intent } = useIntentContext()

  const children = isDataRetained(intent.dataEndTime)
    ? <IntentAIRRMGraph
      details={intent}
      crrmData={crrmData}
      summaryUrlBefore={summaryUrlBefore}
      summaryUrlAfter={summaryUrlAfter}
    />
    : $t(dataRetentionText)

  return <DetailsSection
    title={$t({ defaultMessage: 'Key Performance Indications' })}
    children={children}
  />
}
