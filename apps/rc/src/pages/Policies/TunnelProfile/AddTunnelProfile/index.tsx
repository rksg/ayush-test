
import { useIntl } from 'react-intl'

import { TunnelProfileForm, useTunnelProfileActions } from '@acx-ui/rc/components'
import { getTunnelProfileFormDefaultValues }          from '@acx-ui/rc/utils'

const AddTunnelProfile = () => {
  const { $t } = useIntl()
  const { createTunnelProfileOperation } = useTunnelProfileActions()
  const formInitValues = getTunnelProfileFormDefaultValues()

  return (
    <TunnelProfileForm
      title={$t({ defaultMessage: 'Add Tunnel Profile' })}
      submitButtonLabel={$t({ defaultMessage: 'Add' })}
      onFinish={createTunnelProfileOperation}
      initialValues={formInitValues}
    />
  )
}

export default AddTunnelProfile
