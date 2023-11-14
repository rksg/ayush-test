import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Card, defaultRichTextFormatValues } from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'

import { BOT_NAME } from '../MelissaBot'

import graphic from './graphic.png'
import * as UI from './styledComponents'

export function ChatWithMelissa () {
  const { $t } = useIntl()
  const isMelissaBotEnabled = useIsSplitOn(Features.RUCKUS_AI_CHATBOT_TOGGLE)
  const askAnything = $t({ defaultMessage: 'Ask Anything' })
  const comingSoon = $t({ defaultMessage: 'Coming Soon' })
  const subTitle = <FormattedMessage
    defaultMessage='Chat with <b>{botName}</b><br></br>
    and unlock the <b>power of AI</b>'
    description='SubTitle for Melissa Chatbot widget'
    values={{
      ...defaultRichTextFormatValues,
      botName: BOT_NAME
    }}
  />
  return <UI.Wrapper><Card type='solid-bg'>
    <p>
      <img src={graphic} alt='graphic' /><br />
      {subTitle}
    </p>
    {isMelissaBotEnabled && <Button size='small'
      onClick={()=>{
        const event = new CustomEvent('showMelissaBot',
          { detail: {} })
        window.dispatchEvent(event)
      }}>{askAnything}</Button>}
    {!isMelissaBotEnabled && <Button size='small' disabled>{comingSoon}</Button>}
  </Card></UI.Wrapper>
}
