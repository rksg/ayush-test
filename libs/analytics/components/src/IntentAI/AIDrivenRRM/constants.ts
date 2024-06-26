/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const content = {
  sideNotes: {
    title: defineMessage({ defaultMessage: 'Side Notes' }),
    introduction: defineMessage({ defaultMessage: 'Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' }),
    tradeoff: defineMessage({ defaultMessage: 'In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, making networks more prone to signal degradation and interference, which could compromise overall performance and reliability.' })
  },
  clientThroughput: {
    title: defineMessage({ defaultMessage: 'High client throughput in sparse network' }),
    content: defineMessage({ defaultMessage: 'In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.' }),
    introduction: defineMessage({ defaultMessage: '<p><b>High client throughput in sparse network</b>: In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.</p>' })
  },
  clientDensity: {
    title: defineMessage({ defaultMessage: 'High number of clients in a dense network' }),
    content: defineMessage({ defaultMessage: 'High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' }),
    introduction: defineMessage({ defaultMessage: '<p><b>High number of clients in a dense network: </b>High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.</p>' })
  },
  calendarText: defineMessage({ defaultMessage: 'This recommendation will be applied at the chosen time whenever there is a need to change the channel plan. Schedule a time during off-hours when the number of WiFi clients is at the minimum.' })
}

export const demoLink = 'https://www.youtube.com/playlist?list=PLySwoo7u9-KJeAI4VY_2ha4r9tjnqE3Zi'
export const guideLink = 'https://docs.commscope.com/bundle/ruckusai-userguide/page/GUID-5D18D735-6D9A-4847-9C6F-8F5091F9B171.html'

export const steps = {
  introduction: defineMessage({ defaultMessage: 'Introduction' }),
  priority: defineMessage({ defaultMessage: 'Intent Priority' }),
  settings: defineMessage({ defaultMessage: 'Settings' }),
  summary: defineMessage({ defaultMessage: 'Summary' })
}
