import { useIntl } from 'react-intl'

import { Loader }                      from '@acx-ui/components'
import { Features, useSplitTreatment } from '@acx-ui/feature-toggle'
import { Outlet }                      from '@acx-ui/react-router-dom'


function Policies () {
  const isPoliciesEnabled = useSplitTreatment(Features.POLICIES)
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
