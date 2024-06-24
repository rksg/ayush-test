/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const mapping = {
  intent: 'Client density vs Client throughput',
  category: 'Wi-Fi Experience',
  sideNotes: {
    introduction: defineMessage({ defaultMessage: '<p>Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.</p>' }),
    tradeoff: defineMessage({ defaultMessage: '<p>In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, making networks more prone to signal degradation and interference, which could compromise overall performance and reliability.</p>' })
  },
  clientThroughput: {
    title: defineMessage({ defaultMessage: '<p>High client throughput in sparse network</p>' }),
    content: defineMessage({ defaultMessage: '<p>In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.</p>' })
  },
  clientDensity: {
    title: defineMessage({ defaultMessage: '<p>High number of clients in a dense network</p>' }),
    content: defineMessage({ defaultMessage: '<p>High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.</p>' })
  }
}

export const demoLink = 'https://www.youtube.com/playlist?list=PLySwoo7u9-KJeAI4VY_2ha4r9tjnqE3Zi'
export const guideLink = 'https://docs.commscope.com/bundle/ruckusai-userguide/page/GUID-5D18D735-6D9A-4847-9C6F-8F5091F9B171.html'
