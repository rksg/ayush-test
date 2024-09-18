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
  action: {
    active: defineMessage({ defaultMessage: `
      <p>Leverage <b><i>EquiFlex</i></b>, available only through IntentAI for intelligent handling of probe request/response and optimize management traffic in a dense network.</p>
      <p>For improved performance, this option will disable the Air Time Decongestion (ATD) feature if previously enabled for this network.</p>
    ` }),
    inactive: defineMessage({ defaultMessage: 'When activated, this Intent takes over the automatic probe request/response optimization in the network.' })
  }
}