import { storiesOf } from '@storybook/react'

import { AsyncValidationStory }     from './AsyncValidationStory'
import { BasicMultiStepsFormStory } from './BasicMultiStepsFormStory'
import { DynamicStepsStory }        from './DynamicStepsStory'
import { EditModeStory }            from './EditModeStory'

storiesOf('StepsForm', module)
  .add('Basic', BasicMultiStepsFormStory)
  .add('With Async Validation', AsyncValidationStory)
  .add('Edit Mode', EditModeStory)
  .add('Dynamic Steps', DynamicStepsStory)

export {}
