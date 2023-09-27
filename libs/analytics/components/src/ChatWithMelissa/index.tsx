import { Button, Card } from '@acx-ui/components'

import graphic from './graphic.png'
import * as UI from './styledComponents'

export function ChatWithMelissa () {
  return <UI.Wrapper><Card type='solid-bg'>
    <p>
      <img src={graphic} alt='graphic' /><br />
      Chat with <b>Melissa</b><br />
      and unlock the <b>power of AI</b>
    </p>
    {
      // TODO: open chatbot when it's ready with this button
      // <Button size='small'>Ask Anything</Button>
    }
    <Button size='small' disabled>Coming Soon</Button>
  </Card></UI.Wrapper>
}
