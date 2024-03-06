import { storiesOf } from '@storybook/react'

import { PageNoPermissions } from '.'
import { BrowserRouter as Router }     from '@acx-ui/react-router-dom'

storiesOf('PageNoPermissions', module)
  .add('PageNoPermissions', () =>
    <Router><PageNoPermissions /></Router>
  )

export {}
