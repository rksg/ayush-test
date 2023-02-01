import { storiesOf } from '@storybook/react'

import { MultiModalStepsForm }  from './MultiModalStepsForm'
import { SingleModalStepsForm } from './SingleModalStepsForm'

storiesOf('ModalStepsForm', module)
  .add('SingleModalStepsForm', SingleModalStepsForm)
  .add('MultiModalStepsForm', MultiModalStepsForm)

export {}
