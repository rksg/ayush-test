
import { useIntl } from 'react-intl'

import { useTunnelProfileActions } from '@acx-ui/rc/components'
import { useParams }               from '@acx-ui/react-router-dom'

import { TunnelProfileForm } from '../TunnelProfileForm'

const AddTunnelProfile = () => {

  const { $t } = useIntl()
  const params = useParams()
  const { create } = useTunnelProfileActions(params)

  return (
    <TunnelProfileForm
      title={$t({ defaultMessage: 'Add Tunnel Profile' })}
      submitButtonLabel={$t({ defaultMessage: 'Add' })}
      onFinish={create}
    />
  )
}

export default AddTunnelProfile
