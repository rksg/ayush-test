import { storiesOf }                from '@storybook/react'
import { AsyncValidationStory }     from './AsyncValidationStory'
import { BasicMultiStepsFormStory } from './BasicMultiStepsFormStory'
import { EditModeStory }            from './EditModeStory'
import { MultiColumnsStory }        from './MultiColumnsStory'

storiesOf('StepsForm', module)
  .add('Basic Multiple Steps Form', BasicMultiStepsFormStory)
  .add('With Async Validation', AsyncValidationStory)
  .add('Edit Mode', EditModeStory)
  .add('Multi Columns Form', MultiColumnsStory)

export {}
