import { useIntl } from 'react-intl'

import { Button, Card } from '@acx-ui/components'

import graphic from './graphic.png'
import * as UI from './styledComponents'

export function ChatWithMelissa () {
  const { $t } = useIntl()
  const chatWith = $t({ defaultMessage: 'Chat with' })
  const melissaText = $t({ defaultMessage: 'Melissa' })
  const unlockText = $t({ defaultMessage: 'and unlock the' })
  const powerOfAi = $t({ defaultMessage: 'power of AI' })
  const askAnything = $t({ defaultMessage: 'Ask Anything' })
  return <UI.Wrapper><Card type='solid-bg'>
    <p>
      <img src={graphic} alt='graphic' /><br />
      {chatWith} <b>{melissaText}</b><br />
      {unlockText} <b>{powerOfAi}</b>
    </p>
    <Button size='small'
      onClick={()=>{
        const event = new CustomEvent('showMelissaBot',
          { detail: {} })
        window.dispatchEvent(event)
      }}>{askAnything}</Button>
  </Card></UI.Wrapper>
}
