import _ from 'lodash'

import { Card, Loader }              from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { IntentStatusTrail, useIntentParams, useIntentStatusTrailQuery } from '../../useIntentDetailsQuery'
import { getIntentStatus }                                               from '../getIntentStatus'

import * as UI from './styledComponents'

export const StatusTrail = () => {
  const params = useIntentParams()

  const query = useIntentStatusTrailQuery(params)
  const isDetectError = query.isError && !!_.pick(query.error, ['data'])

  const statusTrail = isDetectError ?
    (_.pick(query.error, ['data']) as { data: IntentStatusTrail }).data
    : query.data

  return <Card>
    <UI.Wrapper>
      <Loader states={[isDetectError? _.omit(query, ['error']) : query]}>
        {statusTrail?.map(({ displayStatus, createdAt }, index) => (
          <div key={index}>
            <UI.DateLabel children={formatter(DateFormatEnum.DateTimeFormat)(createdAt)} />
            {getIntentStatus(displayStatus)}
          </div>
        ))}
      </Loader>
    </UI.Wrapper>
  </Card>
}
