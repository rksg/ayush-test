/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const sampleMapping = {
  'c-crrm-channel5g-auto': {
    title: 'AI-Driven RRM',
    sideNotes: {
      introduction: defineMessage({ defaultMessage: '<p>AI-Driven Cloud RRM constantly monitors the network, adjusting the channel plan, bandwidth, and AP transmit power to minimize co-channel interference. These changes are reflected in the Key Performance Indicators. The number of interfering links may fluctuate based on network changes, configurations, and rogue AP activities.</p>' }),
      tradeOff: defineMessage({ defaultMessage: '<p>AI-Driven Cloud RRM will be applied at the zone level, potentially overwriting all configurations, including static settings for channel, bandwidth, Auto Channel Selection, Auto Cell Sizing, and AP transmit power. DFS channels with excessive radar events will be restricted automatically. Note that unlicensed APs added after AI-Driven Cloud RRM is applied will not be considered, possibly resulting in suboptimal channel planning.</p>' })
    },
    intent: 'Throughput vs Client Density',
    zone: 'SPS-Hospitality-BLR',
    date: '2020-01-01',
    maximumThroughput: defineMessage({ defaultMessage: '<p><b>Maximum Throughput</b>: This approach involves accepting some interference, which will limit the number of simultaneously connected clients. It prioritizes achieving the highest possible data transfer rates.</p>' }),
    highClientDensity: defineMessage({ defaultMessage: '<p><b>High Client Density</b>: This approach minimizes interference, accommodating a larger number of simultaneous client connections. It is ideal for environments with high client density.</p>' })
  }
}
