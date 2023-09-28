import { useIntl } from 'react-intl'

import { Descriptions }           from '@acx-ui/components'
import { GatewayDetailsHardware } from '@acx-ui/rc/utils'


export default function GatewayDetailsHardwareContent (props: {
    gatewayDetails: GatewayDetailsHardware }) {
  const { $t } = useIntl()
  const { gatewayDetails } = props

  return <Descriptions
    labelStyle={{
      paddingLeft: '8px'
    }}
    labelWidthPercent={30}>
    <Descriptions.Item
      label={$t({ defaultMessage: 'Baseboard Manufacturer' })}
      children={gatewayDetails?.baseboardManufacturer}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Baseboard Product Name' })}
      children={gatewayDetails?.baseboardProductName}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Baseboard Serial Number' })}
      children={gatewayDetails?.baseboardSerialNumber}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Baseboard Version' })}
      children={gatewayDetails?.baseboardVersion}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'BIOS Vendor' })}
      children={gatewayDetails?.biosVendor}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'BIOS Version' })}
      children={gatewayDetails?.biosVersion}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'BIOS Release Date' })}
      children={gatewayDetails?.biosReleaseDate}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Chassis Manufacturer' })}
      children={gatewayDetails?.chassisManufacturer}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Chassis Serial Number' })}
      children={gatewayDetails?.chassisSerialNumber}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Chassis Type' })}
      children={gatewayDetails?.chassisType}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Chassis Version' })}
      children={gatewayDetails?.chassisVersion}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Processor Family' })}
      children={gatewayDetails?.processorFamily}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Processor Frequency' })}
      children={gatewayDetails?.processorFrequency}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Manufacturer' })}
      children={gatewayDetails?.systemManufacturer}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Product Name' })}
      children={gatewayDetails?.systemProductName}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Serial Number' })}
      children={gatewayDetails?.systemSerialNumber}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System UUID' })}
      children={gatewayDetails?.systemUuid}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Version' })}
      children={gatewayDetails?.systemVersion}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'System Family' })}
      children={gatewayDetails?.systemFamily}
    />
  </Descriptions>
}