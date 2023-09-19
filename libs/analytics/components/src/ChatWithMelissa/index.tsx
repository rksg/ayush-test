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
    <Button size='small'>Ask anything</Button>
  </Card></UI.Wrapper>
}
