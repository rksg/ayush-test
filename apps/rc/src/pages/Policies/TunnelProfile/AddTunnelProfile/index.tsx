
import { useIntl } from 'react-intl'

import { useTunnelProfileActions } from '@acx-ui/rc/components'

import { TunnelProfileForm } from '../TunnelProfileForm'

const AddTunnelProfile = () => {

  const { $t } = useIntl()
  const { createTunnelProfile } = useTunnelProfileActions()

  return (
    <TunnelProfileForm
      title={$t({ defaultMessage: 'Add Tunnel Profile' })}
      submitButtonLabel={$t({ defaultMessage: 'Add' })}
      onFinish={createTunnelProfile}
    />
  )
}

export default AddTunnelProfile
