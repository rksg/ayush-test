/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { IntentKPIConfig } from '../useIntentDetailsQuery'

export const kpis: IntentKPIConfig[] = [{
  key: 'number-of-interfering-links',
  label: defineMessage({ defaultMessage: 'Interfering links' }),
  format: formatter('countFormat'),
  deltaSign: '-'
}]

export const intentPriority = {
  full: {
    value: defineMessage({ defaultMessage: 'Client Density' }),
    title: defineMessage({ defaultMessage: 'High number of clients in a dense network' }),
    content: defineMessage({ defaultMessage: 'High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' })
  },
  partial: {
    value: defineMessage({ defaultMessage: 'Client Throughput' }),
    title: defineMessage({ defaultMessage: 'High client throughput in sparse network' }),
    content: defineMessage({ defaultMessage: 'In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.' })
  }
}
