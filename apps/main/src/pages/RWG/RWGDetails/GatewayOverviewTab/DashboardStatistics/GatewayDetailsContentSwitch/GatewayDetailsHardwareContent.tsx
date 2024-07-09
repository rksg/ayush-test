import { useIntl } from 'react-intl'

import { Descriptions }           from '@acx-ui/components'
import { GatewayDetailsHardware } from '@acx-ui/rc/utils'
import { noDataDisplay }          from '@acx-ui/utils'


export default function GatewayDetailsHardwareContent (props: {
    gatewayDetails: GatewayDetailsHardware }) {
  const { $t } = useIntl()
  const { gatewayDetails } = props

  return <Descriptions
    labelStyle={{
      paddingLeft: '8px'
    }}
    labelWidthPercent={45}>
    <Descriptions.Item
      label={$t({ defaultMessage: 'Baseboard Manufacturer' })}
      children={gatewayDetails?.baseboardManufacturer || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Baseboard Product Name' })}
      children={gatewayDetails?.baseboardProductName || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Baseboard Serial Number' })}
      children={gatewayDetails?.baseboardSerialNumber || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Baseboard Version' })}
      children={gatewayDetails?.baseboardVersion || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'BIOS Vendor' })}
      children={gatewayDetails?.biosVendor || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'BIOS Version' })}
      children={gatewayDetails?.biosVersion || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'BIOS Release Date' })}
      children={gatewayDetails?.biosReleaseDate || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Chassis Manufacturer' })}
      children={gatewayDetails?.chassisManufacturer || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Chassis Serial Number' })}
      children={gatewayDetails?.chassisSerialNumber || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Chassis Type' })}
      children={gatewayDetails?.chassisType || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Chassis Version' })}
      children={gatewayDetails?.chassisVersion || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Processor Family' })}
      children={gatewayDetails?.processorFamily || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Processor Frequency' })}
      children={gatewayDetails?.processorFrequency || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Manufacturer' })}
      children={gatewayDetails?.systemManufacturer || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Product Name' })}
      children={gatewayDetails?.systemProductName || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Serial Number' })}
      children={gatewayDetails?.systemSerialNumber || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System UUID' })}
      children={gatewayDetails?.systemUuid || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Version' })}
      children={gatewayDetails?.systemVersion || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Family' })}
      children={gatewayDetails?.systemFamily || noDataDisplay}
    />
  </Descriptions>
}