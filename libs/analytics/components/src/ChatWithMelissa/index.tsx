import { useIntl } from 'react-intl'

import { Button, Card }           from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import graphic from './graphic.png'
import * as UI from './styledComponents'

export function ChatWithMelissa () {
  const { $t } = useIntl()
  const isMelissaBotEnabled = useIsSplitOn(Features.RUCKUS_AI_CHATBOT_TOGGLE)
  const chatWith = $t({ defaultMessage: 'Chat with' })
  const melissaText = $t({ defaultMessage: 'Melissa' })
  const unlockText = $t({ defaultMessage: 'and unlock the' })
  const powerOfAi = $t({ defaultMessage: 'power of AI' })
  const askAnything = $t({ defaultMessage: 'Ask Anything' })
  const comingSoon = $t({ defaultMessage: 'Coming Soon' })
  return <UI.Wrapper><Card type='solid-bg'>
    <p>
      <img src={graphic} alt='graphic' /><br />
      {chatWith} <b>{melissaText}</b><br />
      {unlockText} <b>{powerOfAi}</b>
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
