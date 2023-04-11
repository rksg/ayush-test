
import { useIntl } from 'react-intl'

import { Loader, PageHeader, TrendPill } from '@acx-ui/components'
import { DateFormatEnum, formatter }     from '@acx-ui/formatter'
import { useParams }                     from '@acx-ui/react-router-dom'

import { useVideoCallQoeTestDetailQuery } from '../VideoCallQoe/services'

export function VideoCallQoeDetails (){
  const { $t } = useIntl()
  const { testId } = useParams()
  const queryResults = useVideoCallQoeTestDetailQuery({ testId: Number(testId),status: 'ENDED' })
  const callQoeDetails = queryResults.data?.getAllCallQoeTests.at(0)
  // eslint-disable-next-line no-console
  console.log({
    callQoeDetails
  })
  return (
    <Loader states={[queryResults]}>
      {callQoeDetails && <PageHeader
        title={callQoeDetails.name}
        subTitle={`Start Time: ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)
        (callQoeDetails.meetings[0].startTime)}` +
        ` | End Time: ${formatter(DateFormatEnum.DateTimeFormatWithSeconds)
        (callQoeDetails.meetings[0].endTime)}` +
    ` | Duration: ${formatter('durationFormat')
    (new Date(callQoeDetails.meetings[0].endTime).getTime()
    - new Date(callQoeDetails.meetings[0].startTime).getTime())}`
        }
        extra={[
          <>{$t({ defaultMessage: 'Video Call QOE' })}</>,
          <TrendPill value='Good' trend='positive' />
        ]} />}
    </Loader>
  )
}