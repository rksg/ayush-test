import { storiesOf } from '@storybook/react'

import { Basic }      from './Basic'
import { Typing }     from './Typing'
import { Withbutton } from './Withbutton'
import { Withlink }   from './Withlink'

storiesOf('ConversationBubbles', module)
  .add('Basic', Basic)
  .add('WithLink', Withlink)
  .add('WithButton', Withbutton)
  .add('Typing', Typing)
export {}