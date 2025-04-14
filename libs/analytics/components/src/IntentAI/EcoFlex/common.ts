/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { IntentConfigurationConfig } from '../IntentContext'
import { IntentKPIConfig }           from '../useIntentDetailsQuery'

export const configuration: IntentConfigurationConfig = {
  label: defineMessage({ defaultMessage: 'Energy Saving' }),
  valueFormatter: formatter('enabledFormat')
}

//This is mandatory for wizard/detail page
export const kpis: IntentKPIConfig[] = [{
  key: 'eco-flex-kpi',
  label: defineMessage({ defaultMessage: 'TBD' }),
  format: formatter('bytesFormat'),
  deltaSign: '-'
}]
