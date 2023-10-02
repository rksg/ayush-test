import { useIntl } from 'react-intl'

import { Descriptions }             from '@acx-ui/components'
import { GatewayDetailsDiskMemory } from '@acx-ui/rc/utils'


export default function GatewayDetailsDiskMemoryContent (props: {
    gatewayDetails: GatewayDetailsDiskMemory }) {
  const { $t } = useIntl()
  const { gatewayDetails } = props

  return <Descriptions
    labelStyle={{
      paddingLeft: '8px'
    }}
    labelWidthPercent={40}>
    <Descriptions.Item
      label={$t({ defaultMessage: 'Disk Device' })}
      children={gatewayDetails?.diskDevice}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Disk Total Space' })}
      children={$t({ defaultMessage: '{diskTotalSpaceInGb} GB' },
        { diskTotalSpaceInGb: gatewayDetails?.diskTotalSpaceInGb })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Memory Total Space' })}
      children={$t({ defaultMessage: '{memoryTotalSpaceInMb} MB' },
        { memoryTotalSpaceInMb: gatewayDetails?.memoryTotalSpaceInMb })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Memory Used Space' })}
      children={$t({ defaultMessage: '{memoryUsedSpaceInMb} MB' },
        { memoryUsedSpaceInMb: gatewayDetails?.memoryUsedSpaceInMb })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Memory Free Space' })}
      children={$t({ defaultMessage: '{memoryFreeSpaceInMb} MB' },
        { memoryFreeSpaceInMb: gatewayDetails?.memoryFreeSpaceInMb })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Processor Count' })}
      children={gatewayDetails?.processorCount}
    />
  </Descriptions>
}