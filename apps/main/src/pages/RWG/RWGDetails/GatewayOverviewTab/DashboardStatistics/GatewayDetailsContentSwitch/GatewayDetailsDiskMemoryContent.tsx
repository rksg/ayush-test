import { useIntl } from 'react-intl'

import { Descriptions }             from '@acx-ui/components'
import { GatewayDetailsDiskMemory } from '@acx-ui/rc/utils'
import { noDataDisplay }            from '@acx-ui/utils'


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
      children={gatewayDetails?.diskDevice || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Disk Total Space' })}
      children={$t({ defaultMessage: '{diskTotalSpaceInGb}' },
        { diskTotalSpaceInGb: gatewayDetails?.diskTotalSpaceInGb
          ? gatewayDetails?.diskTotalSpaceInGb + ' GB'
          : noDataDisplay })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Memory Total Space' })}
      children={$t({ defaultMessage: '{memoryTotalSpaceInMb}' },
        { memoryTotalSpaceInMb: gatewayDetails?.memoryTotalSpaceInMb
          ? gatewayDetails?.memoryTotalSpaceInMb + ' MB'
          : noDataDisplay })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Memory Used Space' })}
      children={$t({ defaultMessage: '{memoryUsedSpaceInMb}' },
        { memoryUsedSpaceInMb: gatewayDetails?.memoryUsedSpaceInMb
          ? gatewayDetails?.memoryUsedSpaceInMb + ' MB'
          : noDataDisplay })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Memory Free Space' })}
      children={$t({ defaultMessage: '{memoryFreeSpaceInMb}' },
        { memoryFreeSpaceInMb: gatewayDetails?.memoryFreeSpaceInMb
          ? gatewayDetails?.memoryFreeSpaceInMb + ' MB'
          : noDataDisplay })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Processor Count' })}
      children={gatewayDetails?.processorCount || noDataDisplay}
    />
  </Descriptions>
}