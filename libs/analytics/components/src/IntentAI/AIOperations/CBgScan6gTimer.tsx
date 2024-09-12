/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { IntentConfigurationConfig } from '../IntentContext'

import { createUseValuesText }     from './createUseValuesText'
import { createBgScanTimer, kpis } from './Templates/CBgScanTimer'

const configuration: IntentConfigurationConfig = {
  label: defineMessage({ defaultMessage: 'Background Scan Timer (6 GHz)' }),
  valueFormatter: formatter('durationFormat')
}

const useValuesText = createUseValuesText({
  action: defineMessage({ defaultMessage: `
    <p>IntentAI will change the background scan interval allowing the network to swiftly detect and react to interference, optimizing performance and ensuring a more responsive and efficient Wi-Fi experience.</p>
  ` }),
  reason: defineMessage({ defaultMessage: 'An optimized scan timer for background feature enables RUCKUS APs to scan the channels for an appropriate time interval. Time interval that is too long would result in longer time for radio channel selection.' }),
  tradeoff: defineMessage({ defaultMessage: `
    <p>More frequent scans may lead to increased power consumption and brief connectivity interruptions, potentially disrupting real-time applications, such as audio and video calls, and impacting overall network stability and user experience.</p>
  ` }),
  intro: defineMessage({ defaultMessage: `
    <p>
      <b>Reduce background scan interval for efficiency:</b>
      Shortening the interval between background scans helps the Wi-Fi network quickly adapt to changing interference and congestion, potentially improving performance and responsiveness.
    </p>
    <p>
      <b>Keep background interval unchanged for stability:</b>
      Maintaining the current interval for background scans ensures consistent and predictable network behavior, minimizing the risk of connectivity disruptions and maintaining stability.
    </p>
  ` }),
  inactive: defineMessage({ defaultMessage: 'When activated, this AIOps Intent takes over the automatic configuration Background Scan Timer on 6 GHz radio in the network.' })
})

const { IntentAIDetails, IntentAIForm } = createBgScanTimer(useValuesText)

export { configuration, kpis, IntentAIDetails, IntentAIForm }
