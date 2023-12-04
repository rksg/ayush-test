import { useEffect, useState } from 'react'

import moment                        from 'moment-timezone'
import { useCookies }                from 'react-cookie'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Card, defaultRichTextFormatValues } from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'

import { BOT_NAME } from '../MelissaBot'

import graphic        from './graphic.png'
import { getSummary } from './services'
import * as UI        from './styledComponents'

export function ChatWithMelissa () {
  const { $t } = useIntl()
  const [summary,setSummary] = useState('')
  const [cookies,setCookie]=useCookies(['isRecurringUser'])
  const { isRecurringUser } = cookies
  const isMelissaBotEnabled = useIsSplitOn(Features.RUCKUS_AI_CHATBOT_TOGGLE)
  const isIncidentSummaryEnabled = useIsSplitOn(Features.RUCKUS_AI_INCIDENT_SUMMARY_TOGGLE)
  const showIncidentSummary = isIncidentSummaryEnabled && isRecurringUser
  useEffect(()=>{
    if(showIncidentSummary){
      getSummary().then((data)=>{
        setSummary(data.summary)
      })
    }
  },[showIncidentSummary])
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
      disabled={showIncidentSummary && !summary}
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
