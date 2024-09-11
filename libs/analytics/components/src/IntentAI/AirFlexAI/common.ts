/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { IntentKPIConfig } from '../useIntentDetailsQuery'

export const kpis: IntentKPIConfig[] = [{
  key: 'avg-mgmt-traffic-per-client',
  label: defineMessage({ defaultMessage: 'Average management traffic per client' }),
  format: formatter('bytesFormat'),
  deltaSign: '-'
}]

