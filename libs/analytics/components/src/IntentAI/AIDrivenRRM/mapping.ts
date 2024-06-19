/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const mapping = {
  title: 'AI-Driven RRM',
  sideNotes: {
    introduction: defineMessage({ defaultMessage: '<p>AI-Driven Cloud RRM constantly monitors the network, adjusting the channel plan, bandwidth, and AP transmit power to minimize co-channel interference. These changes are reflected in the Key Performance Indicators. The number of interfering links may fluctuate based on network changes, configurations, and rogue AP activities.</p>' }),
    tradeOff: defineMessage({ defaultMessage: '<p>AI-Driven Cloud RRM will be applied at the zone level, potentially overwriting all configurations, including static settings for channel, bandwidth, Auto Channel Selection, Auto Cell Sizing, and AP transmit power. <br></br><br></br> DFS channels with excessive radar events will be restricted automatically. <br> </br><br></br> Note that unlicensed APs added after AI-Driven Cloud RRM is applied will not be considered, possibly resulting in suboptimal channel planning.</p>' })
  },
  intent: 'Client density vs Client throughput',
  category: 'Wi-Fi Experience',
  zone: 'SPS-Hospitality-BLR',
  status: 'New',
  lastUpdate: 'May 20 2024 14:45',
  clientThroughput: {
    title: defineMessage({ defaultMessage: '<b>Client Throughput</b>' }),
    content: defineMessage({ defaultMessage: '<p>This approach involves accepting some interference, which will limit the number of simultaneously connected clients. It prioritizes achieving the highest possible data transfer rates.</p>' }),
    combined: defineMessage({ defaultMessage: '<p><b>Client Throughput</b>: This approach involves accepting some interference, which will limit the number of simultaneously connected clients. It prioritizes achieving the highest possible data transfer rates.</p>' })
  },
  clientDensity: {
    title: defineMessage({ defaultMessage: '<b>Client Density</b>' }),
    content: defineMessage({ defaultMessage: '<p>This approach minimizes interference, accommodating a larger number of simultaneous client connections. It is ideal for environments with high client density.</p>' }),
    combined: defineMessage({ defaultMessage: '<p><b>Client Density</b>: This approach minimizes interference, accommodating a larger number of simultaneous client connections. It is ideal for environments with high client density.</p>' })
  },
  summary: defineMessage({ defaultMessage: '<p>This approach minimizes interference, accommodating a larger number of simultaneous client connections. It is ideal for environments with high client density.</p>' })
}

export const demoLink = 'https://www.youtube.com/playlist?list=PLySwoo7u9-KJeAI4VY_2ha4r9tjnqE3Zi'
export const guideLink = 'https://docs.commscope.com/bundle/ruckusai-userguide/page/GUID-5D18D735-6D9A-4847-9C6F-8F5091F9B171.html'
