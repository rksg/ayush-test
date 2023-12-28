import { useIntl } from 'react-intl'

import {
  useEdgeDhcpActions
} from '@acx-ui/rc/components'

import { EdgeDhcpForm } from '../DHCPForm'

const AddDhcp = () => {
  const { $t } = useIntl()
  const { createEdgeDhcpProfile, isEdgeDhcpProfileCreating } = useEdgeDhcpActions()

  return (
    <EdgeDhcpForm
      title={$t({ defaultMessage: 'Add DHCP for SmartEdge Service' })}
      submitButtonLabel={$t({ defaultMessage: 'Add' })}
      onFinish={createEdgeDhcpProfile}
      isSubmiting={isEdgeDhcpProfileCreating}
    />
  )
}

export default AddDhcp
