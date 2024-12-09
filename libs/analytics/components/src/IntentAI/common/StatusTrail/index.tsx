import { Card, Tooltip }             from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { getStatusTooltip } from '../../services'
import { Intent }           from '../../useIntentDetailsQuery'
import { getIntentStatus }  from '../getIntentStatus'

import * as UI from './styledComponents'

type StatusTrailProps = {
  intent: Intent
}

export const StatusTrail = ({ intent }: StatusTrailProps) => {
  const isStatusTrailTooltipEnabled = useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE)

  const { sliceValue } = intent
  return <Card>
    <UI.Wrapper>
      {intent.statusTrail.map(({ displayStatus, createdAt, metadata }, index) => (
        <div key={index}>
          <UI.DateLabel children={formatter(DateFormatEnum.DateTimeFormat)(createdAt)} />
          {isStatusTrailTooltipEnabled ?<Tooltip
            title={getStatusTooltip(displayStatus, sliceValue, metadata || {})}
            placement='right'
            dottedUnderline={true}
          >
            {getIntentStatus(displayStatus)}
          </Tooltip>
            : <>{getIntentStatus(displayStatus)}</>}
        </div>
      ))}
    </UI.Wrapper>
  </Card>
}
