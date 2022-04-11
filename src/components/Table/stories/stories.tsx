import { storiesOf }   from '@storybook/react'
import { BasicTable }  from './BasicTable'
import { CustomTable } from './CustomTable'

storiesOf('Table', module)
  .add('Basic', BasicTable)
  .add('With Custom Cell', CustomTable)

export {}
