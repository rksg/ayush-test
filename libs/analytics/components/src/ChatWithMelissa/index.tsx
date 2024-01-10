import { useEffect, useState } from 'react'

import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Card, defaultRichTextFormatValues } from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { useLocation }                               from '@acx-ui/react-router-dom'

import { BOT_NAME } from '../MelissaBot'

import graphic        from './graphic.png'
import { getSummary } from './services'
import * as UI        from './styledComponents'

export function ChatWithMelissa () {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const GENERIC_ERROR_MSG= $t({ defaultMessage: 'Oops! We are currently experiencing unexpected technical difficulties. Please try again later.' })
  const { search } = useLocation()
  const [summary,setSummary] = useState<string|null>('')
  const [isRecurringUser,setIsRecurringUser] = useState(localStorage.getItem('isRecurringUser'))
  const isMelissaBotEnabled = useIsSplitOn(Features.RUCKUS_AI_CHATBOT_TOGGLE)
  const isIncidentSummaryEnabled = useIsSplitOn(Features.RUCKUS_AI_INCIDENT_SUMMARY_TOGGLE)
  const showIncidentSummary = isIncidentSummaryEnabled && isRecurringUser === 'true'
  useEffect(()=>{
    if(showIncidentSummary){
      setSummary('')
      getSummary().then((data)=>{
        setSummary(data.summary)
      }).catch((error:Error)=>{
        // eslint-disable-next-line no-console
        console.error(error)
        setSummary(GENERIC_ERROR_MSG)
      })
    }
  },[showIncidentSummary,search])
  const askAnything = $t({ defaultMessage: 'Ask Anything' })
  const discover = $t({ defaultMessage: 'Discover which ones' })
  const comingSoon = $t({ defaultMessage: 'Coming Soon' })
  const noSummaryText = $t({ defaultMessage: 'No incidents indentified for last day.' })
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
    defaultMessage='RUCKUS AI has identified<br></br> the <b>most frequent incidents</b>'
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
      loading={showIncidentSummary && summary===''}
      disabled={showIncidentSummary && summary===''}
      onClick={()=>{
        const event = new CustomEvent('showMelissaBot',
          { detail: {
            isRecurringUser: !! isRecurringUser,
            summary: summary || noSummaryText
          } })
        window.dispatchEvent(event)
        if(isIncidentSummaryEnabled){
          setIsRecurringUser('true')
          localStorage.setItem('isRecurringUser', 'true')
        }
      }}>{showIncidentSummary ? discover : askAnything}</Button>}
    {!isMelissaBotEnabled && <Button size='small' disabled>{comingSoon}</Button>}
  </Card></UI.Wrapper>
}
