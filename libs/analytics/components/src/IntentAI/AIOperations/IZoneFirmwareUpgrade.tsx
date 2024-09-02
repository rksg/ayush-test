/* eslint-disable max-len */
import { defineMessage, FormattedMessage } from 'react-intl'

import { compareVersion } from '@acx-ui/analytics/utils'
import { formatter }      from '@acx-ui/formatter'

import { isIntentActive }            from '../common/isIntentActive'
import { richTextFormatValues }      from '../common/richTextFormatValues'
import { IntentConfigurationConfig } from '../IntentContext'
import { Intent, IntentKPIConfig }   from '../useIntentDetailsQuery'

import { createIntentAIDetails } from './createIntentAIDetails'
import { IntentAIFormTemplate }  from './IntentAIFormTemplate'


export const configuration: IntentConfigurationConfig = {
  label: defineMessage({ defaultMessage: 'AP Firmware Version' }),
  valueFormatter: formatter('noFormat'),
  tooltip: (intent: Intent) =>
    (isIntentActive(intent) &&
      intent.currentValue &&
      compareVersion(intent.currentValue as string, intent.recommendedValue as string) > -1)
      ? defineMessage({ defaultMessage: 'Zone was upgraded manually to recommended AP firmware version. Manually check whether this intent is still valid.' })
      : defineMessage({ defaultMessage: 'Latest available AP firmware version will be used when this intent is applied.' })
}

export const kpis: IntentKPIConfig[] = [{
  key: 'aps-on-latest-fw-version',
  label: defineMessage({ defaultMessage: 'APs on Latest Firmware Version' }),
  valueAccessor: ([x, y]: number[]) => x / y,
  valueFormatter: formatter('percentFormat'),
  deltaSign: '+',
  format: formatter('ratioFormat')
}]

const messages = {
  intro: defineMessage({ defaultMessage: `
    <p>
      <b>Upgrade for latest security and features:</b>
      Upgrading the network ensures it benefits from the latest security patches and features, enhancing protection against cyber threats and enabling access to new functionalities for improved performance.
    </p>
    <p>
      <b>Delay to avoid network downtime and compatibility issues:</b>
      Delaying upgrades prioritizes network stability and compatibility, minimizing the risk of potential downtime and ensuring existing devices continue to function without compatibility issues.
    </p>
  ` }),
  action: defineMessage({ defaultMessage: '{scope} is running with older AP firmware version {currentValue}. It is recommended to upgrade zone to the latest available AP firmware version.' }),
  reason: defineMessage({ defaultMessage: 'Latest AP firmware version in the zone will ensure all the APs in zone have the best available firmware with appropriate security/bug fixes and new features.' }),
  tradeoff: defineMessage({ defaultMessage: `
    <p>Upgrades may temporarily disrupt network operations and require careful planning to mitigate potential compatibility issues with existing hardware or software configurations.</p>
  ` }),
  inactive: defineMessage({ defaultMessage: 'When activated, this AIOps Intent takes over the automatic upgrade of Zone firmware in the network.' }),
  apply: <FormattedMessage
    values={richTextFormatValues}
    defaultMessage={`
    <p>IntentAI will upgrade the Zone firmware ensuring the network remains secure and up-to-date with the latest features. This change will enhance protection against cyber threats and enabling access to new functionalities for improved performance and management.</p>
    <p>IntentAI will continuously monitor these configurations.</p>
  `}
  />,
  doNotApply: <FormattedMessage
    values={richTextFormatValues}
    defaultMessage={`
    <p>IntentAI will maintain the existing network configuration and will cease automated monitoring and change for this Intent.</p>
    <p>For manual control, you may directly change the network configurations.</p>
    <p>For automated monitoring and control, you can select the "Resume" action, after which IntentAI will resume overseeing the network for this Intent.</p>
`} />
}

export const IntentAIDetails = createIntentAIDetails({ ...messages })

export const IntentAIForm = IntentAIFormTemplate(messages)