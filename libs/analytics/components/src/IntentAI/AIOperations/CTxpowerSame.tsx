/* eslint-disable max-len */
import { defineMessage, FormattedMessage  } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { richTextFormatValues }      from '../common/richTextFormatValues'
import { IntentConfigurationConfig } from '../IntentContext'
import { IntentKPIConfig }           from '../useIntentDetailsQuery'

import { createIntentAIDetails } from './createIntentAIDetails'
import { IntentAIFormTemplate }  from './IntentAIFormTemplate'

export const configuration: IntentConfigurationConfig = {
  label: defineMessage({ defaultMessage: '2.4 GHz TX Power Adjustment' }),
  valueFormatter: formatter('noFormat')
}

export const kpis: IntentKPIConfig[] = [{
  key: 'session-time-on-24GHz',
  label: defineMessage({ defaultMessage: 'Session time on 2.4 GHz' }),
  format: formatter('percentFormat'),
  deltaSign: '-'
}]

const messages = {
  intro: defineMessage({ defaultMessage: `
    <p>
      <b>Optimize for 5 GHz, reduce 2.4 GHz power:</b>
      This option prioritizes the 5 GHz band by decreasing the transmit power of the 2.4 GHz band, aiming to improve overall network performance and reliability by encouraging device connection to the less congested 5 GHz band.
    </p>
    <p>
      <b>Preserve 2.4 GHz range, keep power unchanged:</b>
      This option maintains the transmit power of the 2.4 GHz band to preserve its range and ensure broader coverage, prioritizing compatibility and connectivity for devices that rely on the 2.4 GHz band.
    </p>
  ` }),
  action: defineMessage({ defaultMessage: '{scope} is configured with the same transmit power on 2.4 GHz and 5 GHz/6 GHz. Reducing the transmit power on 2.4 GHz will reduce co-channel interference and encourage clients to use 5 GHz/6 GHz.' }),
  reason: defineMessage({ defaultMessage: 'Encourages client association to 5 GHz/6 GHz and reduces co-channel interference.' }),
  tradeoff: defineMessage({ defaultMessage: `
    <p>Devices that rely solely on the 2.4 GHz band may experience reduced signal strength and potentially slower speeds, particularly if they are located at the edge of coverage areas or in areas with obstacles that attenuate 5 GHz signals.</p>
  ` }),
  inactive: defineMessage({ defaultMessage: 'When activated, this AIOps Intent takes over the automatic reduction of Transmit Power setting for 2.4 GHz in the network.' }),
  apply: <FormattedMessage
    values={richTextFormatValues}
    defaultMessage={`
        <p>IntentAI will reduce 2.4 GHz power for this network. This change will enhance 5 GHz network performance by encouraging device connection to the less congested 5 GHz band, resulting in faster speeds and improved reliability for compatible devices.</p>
        <p>IntentAI will continuously monitor these configurations.</p>
      `}/>,
  doNotApply: <FormattedMessage
    values={richTextFormatValues}
    defaultMessage={`
        <p>IntentAI will maintain the existing network configuration and will cease automated monitoring and change for this Intent.</p>
        <p>For manual control, you may directly change the network configurations.</p>
        <p>For automated monitoring and control, you can select the "Reset" action, after which IntentAI will resume overseeing the network for this Intent.</p>
    `} />
}

export const IntentAIDetails = createIntentAIDetails({ ...messages })

export const IntentAIForm = IntentAIFormTemplate(messages)