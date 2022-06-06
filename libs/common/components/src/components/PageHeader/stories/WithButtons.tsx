import React from 'react'

import { PageHeader } from '..'
import { Button }     from '../../Button'

export function WithButtons () {
  return <PageHeader
    title='With Buttons'
    extra={[
      <Button key='1' type='primary'>Add...</Button>,
      <Button key='2'>Another Button</Button>
    ]}
  />
}
