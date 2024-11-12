import { storiesOf } from '@storybook/react'

import { BasicCompatibilityStatusBar } from './CompatibilityStatusBar'
import { TypeCard }                    from './TypeCard'

function MockLayout (props: React.PropsWithChildren) {
  return <div className='ant-pro-basicLayout'>{props.children}</div>
}

storiesOf('EdgeCluster', module)
  .add('Type card', () => <MockLayout><TypeCard /></MockLayout>)
  .add('Compatibility status bar', () => <MockLayout><BasicCompatibilityStatusBar /></MockLayout>)

export {}
