/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { IntentConfigurationConfig } from '../IntentContext'

import { createUseValuesText }                   from './createUseValuesText'
import { createBgScanEnable, kpis, getValuesFn } from './Templates/CBgScanEnable'

const configuration: IntentConfigurationConfig = {
  label: defineMessage({ defaultMessage: 'Background Scan (2.4 GHz)' }),
  valueFormatter: formatter('enabledFormat')
}

const useValuesText = createUseValuesText({
  action: defineMessage({ defaultMessage: `
    <p>IntentAI will activate background scanning and configure the auto channel selection mode to "{channelSelectionMode}" for this network.</p>
    <p>IntentAI will continuously monitor these configurations.</p>
  ` }),
  reason: defineMessage({ defaultMessage: 'Auto Channel Selection feature works well only when RUCKUS APs can perform background scan of the available channels in the network. This helps in building the RF neighborhood. APs can then select an optimum channel for their operation. Hence it is recommended to enable Background Scan feature.' }),
  tradeoff: defineMessage({ defaultMessage: `
    <p>Auto channel selection and background scan may occasionally cause brief connectivity disruptions during channel switching and might not always account for specific network policies or user preferences.</p>
  ` }),
  intro: defineMessage({ defaultMessage: `
    <p>
      <b>Automatic channel optimization using background scanning:</b>
      This feature allows IntentAI to dynamically select the best channel for operation by continuously scanning the wireless environment in the background to avoid interference and congestion.
    </p>
    <p>
      <b>Manual and static channel settings as configured for the network:</b>
      This approach involves the network administrator manually assigning specific channels to Wi-Fi access points in the network, keeping these settings fixed unless changed manually, to maintain stable and controlled network performance.
    </p>
  ` }),
  inactive: defineMessage({ defaultMessage: 'When activated, this AIOps Intent takes over the automatic configuration of auto channel selection mode and background scan capabilities on 2.4 GHz radio in the network.' })
}, getValuesFn)

const { IntentAIDetails, IntentAIForm } = createBgScanEnable(useValuesText)

export { configuration, kpis, IntentAIDetails, IntentAIForm }
