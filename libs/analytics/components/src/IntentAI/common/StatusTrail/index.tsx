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

  const preventColdTier = [
    useIsSplitOn(Features.RUCKUS_AI_PREVENT_COLD_TIER_QUERY_TOGGLE),
    useIsSplitOn(Features.ACX_UI_PREVENT_COLD_TIER_QUERY_TOGGLE)
  ].some(Boolean)

  const query = useIntentStatusTrailQuery({
    ...useIntentParams(),
    loadStatusMetadata: preventColdTier
  })

  const coldTierDays = parseInt(get('DRUID_COLD_TIER_DAYS'), 10)
  const tooltip = preventColdTier ? <Tooltip.Info title={$t({ defaultMessage: `
    Displays IntentAI status changes for up to {days, plural, one {# day} other {# days}}.
  ` }, { days: coldTierDays })} /> : null

  const shouldShowLimitedText = preventColdTier && query.data &&
    query.data?.total > query.data?.data.length

  return <DetailsSection data-testid='Status Trail'>
    <DetailsSection.Title>
      <FormattedMessage defaultMessage='Status Trail' />
      {tooltip}
    </DetailsSection.Title>
    <Loader states={[query]}>
      <Card>
        <UI.Wrapper>
          <UI.StatusTrailWrapper shouldShowLimitedText={!!shouldShowLimitedText}>
            {query.data?.data.map(({ displayStatus, createdAt, metadata }, index) => (
              <div key={index}>
                <UI.DateLabel children={formatter(DateFormatEnum.DateTimeFormat)(createdAt)} />
                {preventColdTier ? <Tooltip
                  title={getStatusTooltip(displayStatus, sliceValue, (metadata || {}) as Metadata)}
                  placement='right'
                  dottedUnderline
                >
                  {getIntentStatus(displayStatus, metadata?.retries)}
                </Tooltip>
                  : <>{getIntentStatus(displayStatus, metadata?.retries)}</>}
              </div>
            ))}
          </UI.StatusTrailWrapper>
          {shouldShowLimitedText ? <UI.FootnoteWrapper>
            <FormattedMessage
              defaultMessage={`
            <i>Limited to the most recent {days, plural, one {# day} other {# days}} of status.</i>
            `}
              values={{ ...richTextFormatValues, days: coldTierDays }}
            />
          </UI.FootnoteWrapper> : null}
        </UI.Wrapper>
      </Card>
    </Loader>
  </DetailsSection>
}
