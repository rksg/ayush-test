import { storiesOf } from '@storybook/react'

import { BrowserRouter as Router } from '@acx-ui/react-router-dom'

import { PageNoPermissions } from '.'

storiesOf('PageNoPermissions', module)
  .add('PageNoPermissions', () =>
    <Router><PageNoPermissions /></Router>
  )

export {}
