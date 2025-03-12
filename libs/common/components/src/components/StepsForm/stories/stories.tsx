import { storiesOf } from '@storybook/react'

import { AlertMessageBar }           from './AlertMessageBar'
import { AsyncValidation }           from './AsyncValidation'
import { BasicMultiSteps }           from './BasicMultiSteps'
import { CustomInputForm }           from './CustomInputForm'
import { CustomSubmitBtton }         from './CustomSubmitBtton'
import { DynamicSteps }              from './DynamicSteps'
import { EditMode }                  from './EditMode'
import { GotoStep }                  from './GotoStep'
import { SingleStep }                from './SingleStep'
import { TextContent }               from './TextContent'
import { BasicWithPrerequisiteStep } from './WithPrerequisiteStep'

function MockLayout (props: React.PropsWithChildren) {
  return <div className='ant-pro-basicLayout'>{props.children}</div>
}

storiesOf('StepsForm', module)
  .add('Basic', () => <MockLayout><BasicMultiSteps /></MockLayout>)
  .add('With Async Validation', () => <MockLayout><AsyncValidation /></MockLayout>)
  .add('Edit Mode', () => <MockLayout><EditMode /></MockLayout>)
  .add('Dynamic Steps', () => <MockLayout><DynamicSteps /></MockLayout>)
  .add('Single Step', () => <MockLayout><SingleStep /></MockLayout>)
  .add('Custom Inputs', () => <MockLayout><CustomInputForm /></MockLayout>)
  .add('Custom Submit Button', () => <MockLayout><CustomSubmitBtton /></MockLayout>)
  .add('Alert Message Bar', () => <MockLayout><AlertMessageBar /></MockLayout>)
  .add('GotoStep', () => <MockLayout><GotoStep /></MockLayout>)
  .add('Text Content', () => <MockLayout><TextContent /></MockLayout>)
  .add('With Prerequisite Step', () => <MockLayout><BasicWithPrerequisiteStep /></MockLayout>)

export {}
