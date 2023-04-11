import { storiesOf } from '@storybook/react'

import { UsageRate } from '.'

storiesOf('UsageRate', module)
  .add('Rate', () => {
    return <>
      <p style={{ width: '100px' }}><div>0</div><UsageRate percent={0}/></p>
      <p style={{ width: '100px' }}><div>33.33</div><UsageRate percent={33.33}/></p>
      <p style={{ width: '100px' }}><div>60</div><UsageRate percent={60.00}/></p>
      <p style={{ width: '100px' }}><div>66.66</div><UsageRate percent={66.6600}/></p>
      <p style={{ width: '100px' }}><div>90</div><UsageRate percent={90}/></p>
    </>
  })

export {}
