import { Card }                      from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { useIntentContext } from '../../IntentContext'
import { getIntentStatus }  from '../getIntentStatus'

import * as UI from './styledComponents'

export const StatusTrail = () => {
  const { intent } = useIntentContext()

  return <Card>
    <UI.Wrapper>
      {intent.statusTrail.map(({ displayStatus, createdAt, retries }, index) => (
        <div key={index}>
          <UI.DateLabel children={formatter(DateFormatEnum.DateTimeFormat)(createdAt)} />
          {getIntentStatus(displayStatus, retries)}
        </div>
      ))}
    </UI.Wrapper>
  </Card>
}
