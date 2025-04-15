/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { IntentKPIConfig } from '../useIntentDetailsQuery'

export const kpis: IntentKPIConfig[] = [{
  key: 'number-of-interfering-links',
  label: defineMessage({ defaultMessage: 'Interfering Links' }),
  format: formatter('countFormat'),
  deltaSign: '-'
}]
