import { useIntl } from 'react-intl'

import { Loader }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Outlet }                 from '@acx-ui/react-router-dom'


function Services () {
  const { $t } = useIntl()

  return (
    <Loader>
      <Outlet />
    </Loader>
  )
}

export default Services
