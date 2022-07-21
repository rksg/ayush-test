import { storiesOf } from '@storybook/react'

import { Alert } from '.'

storiesOf('Alert', module)
  .add('Alert', () =>
    <>
      <Alert message='Success Tips' type='success' showIcon closable/>
      <Alert message='Informational Notes' type='info' showIcon closable />
      <Alert message='This is a warning notice' type='warning' showIcon closable />
      <Alert message='Error' type='error' showIcon closable />
    </>
  )

export {}
