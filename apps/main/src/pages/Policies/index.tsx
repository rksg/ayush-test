import { useIntl } from 'react-intl'

import { Loader }                     from '@acx-ui/components'
import { Features, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { Outlet }                     from '@acx-ui/react-router-dom'


function Policies () {
  const isPoliciesEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const { $t } = useIntl()

  if (!isPoliciesEnabled) {
    return <span>{ $t({ defaultMessage: 'Policies is not enabled' }) }</span>
  }

  return (
    <Loader>
      <Outlet />
    </Loader>
  )
}

export default Policies
