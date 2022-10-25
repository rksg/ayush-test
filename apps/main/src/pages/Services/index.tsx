import { useIntl } from 'react-intl'

import { Loader }                      from '@acx-ui/components'
import { Features, useSplitTreatment } from '@acx-ui/feature-toggle'
import { Outlet }                      from '@acx-ui/react-router-dom'


function Services () {
  const isServicesEnabled = useSplitTreatment(Features.SERVICES)
  const { $t } = useIntl()

  if (!isServicesEnabled) {
    // eslint-disable-next-line no-console
    console.log($t({ defaultMessage: 'Services is not enabled' }))
    // return <span>{ $t({ defaultMessage: 'Services is not enabled' }) }</span>
  }

  return (
    <Loader>
      <Outlet />
    </Loader>
  )
}

export default Services
