import { storiesOf } from '@storybook/react'
import { Button }    from 'antd'

import { Tooltip } from '.'

storiesOf('Tooltip', module)
  .add('Sample', () => {
    return <div>
      <Tooltip title={'This is a tooltip'}>
        <Button>bottom</Button>
      </Tooltip>
      <div style={{ paddingTop: '100px' }}>
        <Tooltip title={'This is a tooltip'}>
          <Button>top</Button>
        </Tooltip>
      </div>
    </div>
  })

export {}
