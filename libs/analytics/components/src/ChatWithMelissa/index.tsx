import moment                        from 'moment-timezone'
import { useCookies }                from 'react-cookie'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Card, defaultRichTextFormatValues } from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'

import { BOT_NAME } from '../MelissaBot'

import graphic from './graphic.png'
import * as UI from './styledComponents'

// eslint-disable-next-line max-len
const summary = 'Ruckus AI findings reveal that P4 is the most common Severity with a count of 90 occurrences, impacting Scope names and Connection and Service Availability categories the most. Oak Ridge HS has the highest Client Impact at 88.89%, while PD-35 leads in Impacted Clients with 70. To prevent similar incidents from occurring in the future, Ruckus AI suggests the following actionables:'
// const summary = ''

export function ChatWithMelissa () {
  const { $t } = useIntl()
  const [cookies,setCookie]=useCookies(['isRecurringUser'])
  const { isRecurringUser } = cookies
  const isMelissaBotEnabled = useIsSplitOn(Features.RUCKUS_AI_CHATBOT_TOGGLE)
  const isIncidentSummaryEnabled = useIsSplitOn(Features.RUCKUS_AI_INCIDENT_SUMMARY_TOGGLE)
  const showIncidentSummary = isIncidentSummaryEnabled && isRecurringUser && summary
  const askAnything = $t({ defaultMessage: 'Ask Anything' })
  const discover = $t({ defaultMessage: 'Discover which ones' })
  const comingSoon = $t({ defaultMessage: 'Coming Soon' })
  const subTitleFirstTime = <FormattedMessage
    defaultMessage='Chat with <b>{botName}</b><br></br>
    and unlock the <b>power of AI</b>'
    description='SubTitle for Melissa Chatbot widget'
    values={{
      ...defaultRichTextFormatValues,
      botName: BOT_NAME
    }}
  />
  const subTitleIncidents = <FormattedMessage
    defaultMessage='Ruckus AI has identified<br></br> the <b>most frequent incidents</b>'
    description='SubTitle for Chatbot incident summary widget'
    values={{
      ...defaultRichTextFormatValues
    }}
  />
  return <UI.Wrapper><Card type='solid-bg'>
    <p>
      <img src={graphic} alt='graphic' /><br />
      {showIncidentSummary ? subTitleIncidents : subTitleFirstTime }
    </p>
    {isMelissaBotEnabled && <Button size='small'
      onClick={()=>{
        const event = new CustomEvent('showMelissaBot',
          { detail: {
            isRecurringUser: !! isRecurringUser,
            summary
          } })
        window.dispatchEvent(event)
        if(isIncidentSummaryEnabled){
          setTimeout(()=>{
            setCookie('isRecurringUser',true,{
              expires: moment().add(1, 'M').toDate()
            })
          },2000)
        }
      }}>{showIncidentSummary ? discover : askAnything}</Button>}
    {!isMelissaBotEnabled && <Button size='small' disabled>{comingSoon}</Button>}
  </Card></UI.Wrapper>
}
