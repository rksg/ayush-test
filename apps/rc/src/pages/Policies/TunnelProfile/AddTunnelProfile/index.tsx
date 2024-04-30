
import { useIntl } from 'react-intl'

import { useTunnelProfileActions }           from '@acx-ui/rc/components'
import { getTunnelProfileFormDefaultValues } from '@acx-ui/rc/utils'

import { TunnelProfileForm } from '../TunnelProfileForm'

const AddTunnelProfile = () => {
  const { $t } = useIntl()
  const { createTunnelProfile } = useTunnelProfileActions()
  const formInitValues = getTunnelProfileFormDefaultValues()

  return (
    <TunnelProfileForm
      title={$t({ defaultMessage: 'Add Tunnel Profile' })}
      submitButtonLabel={$t({ defaultMessage: 'Add' })}
      onFinish={createTunnelProfile}
      initialValues={formInitValues}
    />
  )
}

export default AddTunnelProfile
