import { Card, Loader, Tooltip }     from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { Metadata }                                   from '../../config'
import { useIntentContext }                           from '../../IntentContext'
import { getStatusTooltip }                           from '../../services'
import { useIntentParams, useIntentStatusTrailQuery } from '../../useIntentDetailsQuery'
import { getIntentStatus }                            from '../getIntentStatus'

import * as UI from './styledComponents'

export const StatusTrail = () => {
  const { intent: { sliceValue } } = useIntentContext()

  const isStatusTrailTooltipEnabled = [
    useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE)
  ].some(Boolean)
  const query = useIntentStatusTrailQuery({
    ...useIntentParams(),
    loadStatusMetadata: isStatusTrailTooltipEnabled
  })

  return <Loader states={[query]}>
    <Card>
      <UI.Wrapper>
        {query.data?.map(({ displayStatus, createdAt, metadata }, index) => (
          <div key={index}>
            <UI.DateLabel children={formatter(DateFormatEnum.DateTimeFormat)(createdAt)} />
            {isStatusTrailTooltipEnabled ? <Tooltip
              title={getStatusTooltip(displayStatus, sliceValue, (metadata || {}) as Metadata)}
              placement='right'
              dottedUnderline
            >
              {getIntentStatus(displayStatus, metadata.retries)}
            </Tooltip>
              : <>{getIntentStatus(displayStatus, metadata.retries)}</>}
          </div>
        ))}
      </UI.Wrapper>
    </Card>
  </Loader>
}
