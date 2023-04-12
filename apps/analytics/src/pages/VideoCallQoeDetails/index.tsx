
import { useIntl } from 'react-intl'

import { Loader, PageHeader }        from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { useParams }                 from '@acx-ui/react-router-dom'

import { useVideoCallQoeTestDetailQuery } from '../VideoCallQoe/services'

import { BigTrendPill } from './styledComponents'

export function VideoCallQoeDetails (){
  const { $t } = useIntl()
  const { testId } = useParams()
  const queryResults = useVideoCallQoeTestDetailQuery({ testId: Number(testId),status: 'ENDED' })
  const callQoeDetails = queryResults.data?.getAllCallQoeTests.at(0)
  const getPill = (mos:number)=>{
    const isValidMos = mos ? true : false
    return isValidMos ? (mos >= 4 ? <BigTrendPill value='Good' trend='positive' /> :
      <BigTrendPill value='Bad' trend='negative' />) : '-'
  }
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
          <>{getPill(callQoeDetails.meetings[0].mos)}</>
        ]} />}
    </Loader>
  )
}