import { useIntl } from 'react-intl'

import { Loader }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Outlet }                 from '@acx-ui/react-router-dom'


function Services () {
  const isServicesEnabled = useIsSplitOn(Features.SERVICES)
  const { $t } = useIntl()

  if (!isServicesEnabled) {
    return <span>{ $t({ defaultMessage: 'Services is not enabled' }) }</span>
  }

  return (
    <Loader>
      <Outlet />
    </Loader>
  )
}

export default Services
