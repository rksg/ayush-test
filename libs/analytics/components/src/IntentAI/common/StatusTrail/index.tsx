import { useIntl, FormattedMessage } from 'react-intl'

import { Card, Loader, Tooltip }     from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { Metadata }             from '../../config'
import { useIntentContext }     from '../../IntentContext'
import { getStatusTooltip }     from '../../services'
import { useIntentParams }      from '../../useIntentDetailsQuery'
import { DetailsSection }       from '../DetailsSection'
import { getIntentStatus }      from '../getIntentStatus'
import { richTextFormatValues } from '../richTextFormatValues'

import { useIntentStatusTrailQuery } from './service'
import * as UI                       from './styledComponents'

export const StatusTrail = () => {
  const { $t } = useIntl()
  const { intent: { sliceValue } } = useIntentContext()

  const isEnabled = [
    useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE),
    useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_CONFIG_CHANGE_TOGGLE)
  ].some(Boolean)

  const query = useIntentStatusTrailQuery({
    ...useIntentParams(),
    loadStatusMetadata: isEnabled
  })

  const coldTierDays = parseInt(get('DRUID_COLD_TIER_DAYS'), 10)
  const tooltip = isEnabled ? <Tooltip.Info title={$t({ defaultMessage: `
    Displays IntentAI status changes for up to {days, plural, one {# day} other {# days}}.
  ` }, { days: coldTierDays })} /> : null

  const shouldShowLimitedText = isEnabled && query.data &&
    query.data?.data.length > 0 &&
    query.data?.total > query.data?.data.length

  return <DetailsSection data-testid='Status Trail'>
    <DetailsSection.Title>
      <FormattedMessage defaultMessage='Status Trail' />
      {tooltip}
    </DetailsSection.Title>
    <Loader states={[query]}>
      <Card>
        <UI.Wrapper>
          {query.data?.data.map(({ displayStatus, createdAt, metadata }, index) => (
            <div key={index}>
              <UI.DateLabel children={formatter(DateFormatEnum.DateTimeFormat)(createdAt)} />
              {isEnabled ? <Tooltip
                title={getStatusTooltip(displayStatus, sliceValue, (metadata || {}) as Metadata)}
                placement='right'
                dottedUnderline
              >
                {getIntentStatus(displayStatus)}
              </Tooltip>
                : <>{getIntentStatus(displayStatus)}</>}
            </div>
          ))}
          {shouldShowLimitedText ? <FormattedMessage
            defaultMessage={`
            <i>Limited to the most recent {days, plural, one {# day} other {# days}} of status.</i>
            `}
            values={{ ...richTextFormatValues, days: coldTierDays }}
          /> : null}
        </UI.Wrapper>
      </Card>
    </Loader>
  </DetailsSection>
}
