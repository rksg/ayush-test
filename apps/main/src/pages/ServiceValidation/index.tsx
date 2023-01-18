import { useIntl } from 'react-intl'

import { Loader }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Outlet }                 from '@acx-ui/react-router-dom'


function ServiceValidation () {
  const isServiceValidationEnabled = useIsSplitOn(Features.SERVICE_VALIDATION)
  const { $t } = useIntl()

  if (!isServiceValidationEnabled) {
    return <span>{ $t({ defaultMessage: 'Service Validation is not enabled' }) }</span>
  }

  return (
    <Loader>
      <Outlet />
    </Loader>
  )
}

export default ServiceValidation
