import { storiesOf } from '@storybook/react'

import { AsyncValidation } from './AsyncValidation'
import { BasicMultiSteps } from './BasicMultiSteps'
import { DynamicSteps }    from './DynamicSteps'
import { EditMode }        from './EditMode'
import { SingleStep }      from './SingleStep'

storiesOf('StepsForm', module)
  .add('Basic', BasicMultiSteps)
  .add('With Async Validation', AsyncValidation)
  .add('Edit Mode', EditMode)
  .add('Dynamic Steps', DynamicSteps)
  .add('Single Step', SingleStep)

export {}
