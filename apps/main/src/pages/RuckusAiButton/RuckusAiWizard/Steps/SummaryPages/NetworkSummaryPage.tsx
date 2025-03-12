import _ from 'lodash'

import { Loader }                    from '@acx-ui/components'
import { SummaryForm }               from '@acx-ui/rc/components'
import { useGetOnboardConfigsQuery } from '@acx-ui/rc/services'
import { NetworkSaveData }           from '@acx-ui/rc/utils'


export function NetworkSummaryPage (props: { summaryId: string, summaryTitle: string }) {
  const { summaryId, summaryTitle } = props

  const gptSummaryResult =
  useGetOnboardConfigsQuery({ params: { id: summaryId } }, { skip: _.isEmpty(summaryId) })

  return (
    <Loader states={[gptSummaryResult]}>
      <SummaryForm
        summaryData={gptSummaryResult.data as NetworkSaveData}
        isRuckusAiMode={true}
        ruckusAiSummaryTitle={summaryTitle}
      />
    </Loader>
  )
}

