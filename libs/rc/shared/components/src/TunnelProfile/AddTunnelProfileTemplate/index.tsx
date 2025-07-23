
import { useIntl } from 'react-intl'

import { getTunnelProfileFormDefaultValues } from '@acx-ui/rc/utils'

import { TunnelProfileForm }       from '../TunnelProfileForm'
import { useTunnelProfileActions } from '../TunnelProfileForm/useTunnelProfileActions'

export const AddTunnelProfileTemplate = () => {
  const { $t } = useIntl()
  const { createTunnelProfileTemplateOperation } = useTunnelProfileActions()
  const formInitValues = getTunnelProfileFormDefaultValues()

  return (
    <TunnelProfileForm
      title={$t({ defaultMessage: 'Add Tunnel Profile Template' })}
      submitButtonLabel={$t({ defaultMessage: 'Add' })}
      onFinish={createTunnelProfileTemplateOperation}
      initialValues={formInitValues}
      isTemplate
    />
  )
}
