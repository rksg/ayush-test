import { useIntl } from 'react-intl'

import { Descriptions }     from '@acx-ui/components'
import { GatewayDetailsOs } from '@acx-ui/rc/utils'


export default function GatewayDetailsOSContent (props: {
    gatewayDetails: GatewayDetailsOs }) {
  const { $t } = useIntl()
  const { gatewayDetails } = props

  return <Descriptions
    labelStyle={{
      paddingLeft: '8px'
    }}
    labelWidthPercent={30}>
    <Descriptions.Item
      label={$t({ defaultMessage: 'OS Architecture' })}
      children={gatewayDetails?.architecture}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'OS Branch' })}
      children={gatewayDetails?.branch}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'OS Kernel' })}
      children={gatewayDetails?.kernel}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'OS Name' })}
      children={gatewayDetails?.name}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'OS Release' })}
      children={gatewayDetails?.release}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'OS Version' })}
      children={gatewayDetails?.version}
    />
  </Descriptions>
}