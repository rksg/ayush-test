/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { IntentConfigurationConfig } from '../IntentContext'
import { IntentKPIConfig }           from '../useIntentDetailsQuery'

export const configuration: IntentConfigurationConfig = {
  label: defineMessage({ defaultMessage: 'EquiFlex' }),
  valueFormatter: formatter('enabledFormat'),
  tooltip: () =>
    defineMessage({ defaultMessage: 'Enabling EquiFlex will disable Airtime Decongestion' })
}

export const kpis: IntentKPIConfig[] = [{
  key: 'avg-mgmt-traffic-per-client',
  label: defineMessage({ defaultMessage: 'Average management traffic per client' }),
  format: formatter('bytesFormat'),
  deltaSign: '-'
}]

export const commonEquiFlexDetails = {
  tradeoff: defineMessage({ defaultMessage: 'Potential trade-offs of intelligent and optimized probe responses include increased complexity in network management, potential delays in connecting lesser-priority devices, and possible issues with compatibility across different devices and manufacturers.' }),
  action: {
    active: defineMessage({ defaultMessage: 'EquiFlex for this {scope} is currently {currentValue}. This is a RF feature that is only available via RUCKUS AI, and it performs better than the default Airtime Decongestion (ATD) feature in {smartZone}. It is recommended to enable EquiFlex in all WLANs. It is possible to deselect specific WLANs when applying this recommendation.' }),
    inactive: defineMessage({ defaultMessage: 'When activated, this Intent takes over the automatic probe request/response optimization in the network.' })
  }
}