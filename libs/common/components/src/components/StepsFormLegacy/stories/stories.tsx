import { storiesOf } from '@storybook/react'

import { AsyncValidation } from './AsyncValidation'
import { BasicMultiSteps } from './BasicMultiSteps'
import { CustomInputForm } from './CustomInputForm'
import { DynamicSteps }    from './DynamicSteps'
import { EditMode }        from './EditMode'
import { SingleStep }      from './SingleStep'

function MockLayout (props: React.PropsWithChildren) {
  return <div className='ant-pro-basicLayout'>{props.children}</div>
}

storiesOf('StepsForm', module)
  .add('Basic', () => <MockLayout><BasicMultiSteps /></MockLayout>)
  .add('With Async Validation', () => <MockLayout><AsyncValidation /></MockLayout>)
  .add('Edit Mode', () => <MockLayout><EditMode/ ></MockLayout>)
  .add('Dynamic Steps', () => <MockLayout><DynamicSteps /></MockLayout>)
  .add('Single Step', () => <MockLayout><SingleStep /></MockLayout>)
  .add('Custom Inputs', () => <MockLayout><CustomInputForm /></MockLayout>)

export {}
