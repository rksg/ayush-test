import { Card, Loader }              from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { useIntentParams, useIntentStatusTrailQuery } from '../../useIntentDetailsQuery'
import { getIntentStatus }                            from '../getIntentStatus'

import * as UI from './styledComponents'

export const StatusTrail = () => {
  const params = useIntentParams()

  const query = useIntentStatusTrailQuery(params)

  return <Loader states={[query]}>
    <Card>
      <UI.Wrapper>
        {query.data?.map(({ displayStatus, createdAt }, index) => (
          <div key={index}>
            <UI.DateLabel children={formatter(DateFormatEnum.DateTimeFormat)(createdAt)} />
            {getIntentStatus(displayStatus)}
          </div>
        ))}
      </UI.Wrapper>
    </Card>
  </Loader>
}
