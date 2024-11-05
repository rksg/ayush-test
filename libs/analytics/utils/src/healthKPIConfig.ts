/* eslint-disable max-len */
import { identity, flow } from 'lodash'
import moment             from 'moment-timezone'
import { defineMessage }  from 'react-intl'

import { get }       from '@acx-ui/config'
import { formatter } from '@acx-ui/formatter'

const isMLISA = get('IS_MLISA_SA')

const pillSuffix = {
  success: defineMessage({ defaultMessage: 'success' }),
  meetGoal: defineMessage({ defaultMessage: 'meets goal' })
}

const createBarChartConfig = (apiMetric: string) => ({
  apiMetric,
  shortXFormat: (date: string) => moment(date).format('DD'),
  longYFormat: (val: number) => formatter('percentFormat')(val / 100),
  shortYFormat: (val: number) => formatter('percentFormat')(val / 100)
})

const divideBy1000 = (ms: number) => ms / 1000
const multipleBy100 = (ms: number) => ms * 100
export const multipleBy1000 = (ms: number) => ms * 1000
export const divideBy100 = (ms: number) => ms / 100
export const noFormat = (x: number) => x
export const numberWithPercentSymbol = (x: number) => `${x}%`

export const shouldAddFirmwareFilter = () =>
  window.location.pathname.includes('/health/wired')
    ? true
    : undefined

export const kpiConfig = {
  connectionSuccess: {
    text: defineMessage({ defaultMessage: 'Connection Success' }),
    timeseries: {
      apiMetric: 'connectionSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('connectionSuccessAndAttemptCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} attempts' }),
      thresholdDesc: [],
      pillSuffix: pillSuffix.success,
      thresholdFormatter: null,
      tooltip: defineMessage({ defaultMessage: 'A connection is deemed successful when a Wifi client is able to complete the 802.11 authentication, association, L2 authentication and receives an IP address from the DHCP. If any of these stages fail, it is considered as a failed connection. For L3 authentication, such as WISPr and captive portal authentication, since the Wifi client will receive an IP address before the L3 authentication, the client connection will be deemed successful before the L3 authentication completes.{br}{br}The time-series graph on the left displays the percentage of successful connections across time, and the bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      apiMetric: 'connectionSuccess',
      format: formatter('percentFormat'),
      deltaSign: '+'
    }
  },
  timeToConnect: {
    text: defineMessage({ defaultMessage: 'Time To Connect' }),
    timeseries: {
      apiMetric: 'ttcCountAndConnectionCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      initialThreshold: 2000,
      splits: [1000, 2000, 5000, 10000, 30000, 50000],
      apiMetric: 'timeToConnect',
      xUnit: defineMessage({ defaultMessage: 'seconds' }),
      shortXFormat: divideBy1000,
      yUnit: 'connections',
      reFormatFromBarChart: multipleBy1000
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} connections' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'under' }),
        defineMessage({ defaultMessage: '{threshold} seconds' })
      ],
      pillSuffix: pillSuffix.meetGoal,
      tooltip: defineMessage({ defaultMessage: 'The time to connect (TTC) measures the total time taken for a Wifi client to successfully go through all the required stages in order to establish a IP connection, namely 802.11 authentication, association, L2 authentication, and receiving an IP address from the DHCP. For L3 authentication, such as WISPr and captive portal authentication, since the Wifi client will receive an IP address before the L3 authentication, the time to connect does not include the time taken for L3 authentication.{br}{br}The time-series graph on the left displays the percentage of successful connections across time that meet the configured TTC SLA. Bar chart on the right displays the distribution of TTC. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' }),
      thresholdFormatter: divideBy1000
    },
    configChange: {
      apiMetric: 'timeToConnect',
      format: formatter('durationFormat'),
      deltaSign: '-'
    }
  },
  association: {
    text: defineMessage({ defaultMessage: 'Association' }),
    timeseries: {
      apiMetric: 'assocSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('assocSuccessAndAttemptCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} association attempts' }),
      thresholdDesc: [],
      thresholdFormatter: null,
      pillSuffix: pillSuffix.success,
      tooltip: defineMessage({ defaultMessage: 'The time-series graph on the left displays the percentage of association attempts that have completed successfully. An association attempt is deemed successful when the Wifi client receives an Association ID from the AP. It is normal for a single Wifi client to have more than one association attempts.{br}{br}The bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      text: defineMessage({ defaultMessage: 'Association Success' }),
      apiMetric: 'assocSuccess',
      format: formatter('percentFormat'),
      deltaSign: '+'
    }
  },
  userAuthentication: {
    text: defineMessage({ defaultMessage: '802.11 Authentication' }),
    timeseries: {
      apiMetric: 'authSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('authSuccessAndAttemptCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} Auth attempts' }),
      thresholdDesc: [],
      thresholdFormatter: null,
      pillSuffix: pillSuffix.success,
      tooltip: defineMessage({ defaultMessage: 'The time-series graph on the left displays the percentage of 802.11 authentication attempts that has completed successfully. 802.11 authentication is the first step in establishing a Wi-Fi connection, and it requires a Wi-Fi client to establish its identity as a valid 802.11 device with an AP. No data encryption or security is available at this stage, and it is not to be confused with WPA or 802.1X authentication.{br}{br}The bar chart on the right captures the daily percentage over the past 7 days. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the histogram will stay constant based on the selected date range at the top of the page.' })
    },
    configChange: {
      text: defineMessage({ defaultMessage: '802.11 Authentication Success' }),
      apiMetric: 'authSuccess',
      format: formatter('percentFormat'),
      deltaSign: '+'
    }
  },
  eap: {
    text: defineMessage({ defaultMessage: 'EAP' }),
    timeseries: {
      apiMetric: 'eapSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('eapSuccessAndAttemptCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} EAP attempts' }),
      thresholdDesc: [],
      thresholdFormatter: null,
      pillSuffix: pillSuffix.success,
      tooltip: defineMessage({ defaultMessage: 'The time-series graph on the left displays the percentage of EAP attempts (consisting the 4-way handshake between client and AP) that have completed successfully. An EAP attempt is deemed successful when all the necessary handshakes are completed. Do note that a single Wifi client could have multiple EAP attempts.{br}{br}The bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      text: defineMessage({ defaultMessage: 'EAP Success' }),
      apiMetric: 'eapSuccess',
      format: formatter('percentFormat'),
      deltaSign: '+'
    }
  },
  dhcp: {
    textPostFix: 'Success',
    text: defineMessage({ defaultMessage: 'DHCP' }),
    timeseries: {
      apiMetric: 'dhcpSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('dhcpSuccessAndAttemptCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} DHCP attempts' }),
      thresholdDesc: [],
      thresholdFormatter: null,
      pillSuffix: pillSuffix.success,
      tooltip: defineMessage({ defaultMessage: 'The time-series graph on the left displays the percentage of DHCP connection attempts that have completed successfully. A DHCP connection attempt is deemed successful when the Wifi client has received an IP address from the DHCP server. Do note that a single Wifi client could have multiple DHCP connection attempts.{br}{br}The bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      text: defineMessage({ defaultMessage: 'DHCP Success' }),
      apiMetric: 'dhcpSuccess',
      format: formatter('percentFormat'),
      deltaSign: '+'
    }
  },
  switchDhcp: {
    textPostFix: 'Success',
    text: defineMessage({ defaultMessage: 'DHCP' }),
    enableSwitchFirmwareFilter: true,
    timeseries: {
      apiMetric: 'switchDHCPSuccessAndAttemptCount',
      minGranularity: 'PT15M'
    },
    barChart: createBarChartConfig('switchDHCPSuccessAndAttemptCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} DHCP successful bindings' }),
      thresholdDesc: [],
      thresholdFormatter: null,
      valueFormatter: 'percentFormat',
      pillSuffix: pillSuffix.success,
      tooltip: defineMessage({ defaultMessage: 'Metric of successful DHCP bindings of clients that are connected to the switches.' })
    }
  },
  radius: {
    text: defineMessage({ defaultMessage: 'RADIUS' }),
    timeseries: {
      apiMetric: 'radiusSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('radiusSuccessAndAttemptCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} RADIUS attempts' }),
      thresholdDesc: [],
      thresholdFormatter: null,
      pillSuffix: pillSuffix.success,
      tooltip: defineMessage({ defaultMessage: 'The time-series graph on the left displays the percentage of RADIUS authentication attempts that have completed successfully. A RADIUS authentication attempt is deemed successful when all the necessary handshakes in the RADIUS protocol are completed, and the client is either allowed or denied access. Do note that a single Wifi client could have multiple authentication attempts.{br}{br}The bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      text: defineMessage({ defaultMessage: 'RADIUS Success' }),
      apiMetric: 'radiusSuccess',
      format: formatter('percentFormat'),
      deltaSign: '+'
    }
  },
  roamingSuccess: {
    text: defineMessage({ defaultMessage: 'Roaming Success' }),
    timeseries: {
      apiMetric: 'clientRoamingSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('clientRoamingSuccessAndAttemptCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} attempts' }),
      thresholdDesc: [],
      thresholdFormatter: null,
      pillSuffix: pillSuffix.success,
      tooltip: defineMessage({ defaultMessage: 'This metric measures the percentage of roaming attempts that have completed successfully. A roaming attempt is deemed successful when the Wifi client has its session transferred from one AP to the next. It is possible for a single Wifi client to have multiple roaming attempts.{br}{br}The bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      apiMetric: 'roamingSuccess',
      format: formatter('percentFormat'),
      deltaSign: '+'
    }
  },
  rss: {
    text: defineMessage({ defaultMessage: 'Client RSS' }),
    timeseries: {
      apiMetric: 'rssCountAndSessionCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: -75,
      apiMetric: 'rss',
      splits: [-100, -90, -85, -80, -75, -70, -65, -60, -50],
      xUnit: defineMessage({ defaultMessage: 'dbm' }),
      yUnit: 'sessions',
      shortXFormat: noFormat,
      isReverse: true,
      reFormatFromBarChart: noFormat
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} sessions' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'under' }),
        defineMessage({ defaultMessage: '{threshold} dBm' })
      ],
      thresholdFormatter: null,
      pillSuffix: pillSuffix.meetGoal,
      tooltip: defineMessage({ defaultMessage: 'The time-series graph on the left displays the percentage of client sessions with average RSS that has met the configured SLA. The bar chart on the right captures the distribution of the RSS. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      apiMetric: 'clientRss',
      format: formatter('decibelMilliWattsFormat'),
      deltaSign: '-'
    }
  },
  clientThroughput: {
    text: defineMessage({ defaultMessage: 'Client Throughput' }),
    timeseries: {
      apiMetric: 'throughputCountAndSessionCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      highlightAbove: true,
      initialThreshold: 10000,
      splits: [10000, 25000, 50000, 100000, 200000, 500000, 1000000],
      apiMetric: 'clientThroughput',
      xUnit: defineMessage({ defaultMessage: 'Mbps' }),
      yUnit: 'samples',
      shortXFormat: divideBy1000,
      reFormatFromBarChart: multipleBy1000
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} sessions' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'above' }),
        defineMessage({ defaultMessage: '{threshold} Mbps' })
      ],
      pillSuffix: pillSuffix.meetGoal,
      tooltip: defineMessage({ defaultMessage: 'Client throughput measures the down link throughput estimate of the client, taking into consideration RF channel conditions, interference, channel contention and client capabilities.{br}{br}The time-series graph on the left displays the percentage of Wifi sessions across time that have a client throughput that meet the configured SLA. The bar chart on the right displays the distribution of the client throughput. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' }),
      thresholdFormatter: divideBy1000
    },
    configChange: {
      apiMetric: 'clientThroughPut',
      format: formatter('networkSpeedFormat'),
      deltaSign: '+'
    }
  },
  apCapacity: {
    text: defineMessage({ defaultMessage: 'AP Capacity' }),
    timeseries: {
      apiMetric: 'capacityCountAndAPCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      highlightAbove: true,
      initialThreshold: 50,
      splits: [5, 10, 25, 50, 100, 300, 500],
      apiMetric: 'apCapacity',
      xUnit: defineMessage({ defaultMessage: 'Mbps' }),
      shortXFormat: identity,
      //shortYFormat: formatter(),
      yUnit: 'APs',
      reFormatFromBarChart: noFormat
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} APs' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'above' }),
        defineMessage({ defaultMessage: '{threshold} Mbps' })
      ],
      thresholdFormatter: null,
      pillSuffix: pillSuffix.meetGoal,
      tooltip: defineMessage({ defaultMessage: 'AP capacity measures the downlink saturated throughput estimate of the AP radios, taking into consideration the RF channel conditions, interference, channel contention and client capabilities.{br}{br}The time-series graph on the left displays the percentage of AP capacity samples across time that meets the configured SLA. The bar chart on the right displays the distribution of AP capacity across the number of APs. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      apiMetric: 'apCapacity',
      format: flow([multipleBy1000, formatter('networkSpeedFormat')]),
      deltaSign: '+'
    }
  },
  apServiceUptime: {
    text: defineMessage({ defaultMessage: 'AP-{smartZone} Connection Uptime' }),
    timeseries: {
      apiMetric: 'apUptimeCountAndApCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      highlightAbove: true,
      initialThreshold: 0.995,
      splits: [0.5, 0.95, 0.98, 0.99, 0.995, 0.997, 0.999],
      apiMetric: 'apServiceUptime',
      xUnit: '%',
      yUnit: 'APs',
      shortXFormat: multipleBy100,
      reFormatFromBarChart: divideBy100
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} APs' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'above' }),
        defineMessage({ defaultMessage: '{threshold}' })
      ],
      thresholdFormatter: formatter('percentFormat'),
      pillSuffix: pillSuffix.meetGoal,
      tooltip: defineMessage({ defaultMessage: 'AP-{smartZone} connection uptime measures the percentage of time the AP radios are fully available for client service.\n\nThe time-series graph on the left displays the percentage of AP-{smartZone} connection uptime samples across time that meets the configured SLA. The bar chart on the right displays the distribution of AP service uptime across the number of APs. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
      //thresholdFormat: x => formatter('percentFormat')(x)
    },
    configChange: {
      apiMetric: 'apUpTime',
      format: formatter('percentFormat'),
      deltaSign: '+'
    }
  },
  apToSZLatency: {
    text: defineMessage({ defaultMessage: 'AP-to-{smartZone} Latency' }),
    timeseries: {
      apiMetric: 'apSzLatencyCountAndAPCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: isMLISA ? 40 : 200,
      apiMetric: 'apSzLatency',
      splits: isMLISA
        ? [5, 10, 20, 40, 60, 100, 200, 500]
        : [50, 100, 150, 200, 250, 300, 350, 400],
      xUnit: defineMessage({ defaultMessage: 'ms' }),
      yUnit: 'APs',
      shortXFormat: (x : number) => x,
      reFormatFromBarChart: noFormat
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} APs' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'under' }),
        defineMessage({ defaultMessage: '{threshold} ms' })
      ],
      thresholdFormatter: null,
      pillSuffix: pillSuffix.meetGoal,
      tooltip: defineMessage({ defaultMessage: 'The time-series graph on the left displays the percentage of APs that have AP-to-{smartZone} control plane latency which meets the configured SLA. The bar chart on the right captures the distribution of the latency across the number of APs. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      apiMetric: 'apSzLatency',
      format: formatter('durationFormat'),
      deltaSign: '-'
    }
  },
  clusterLatency: {
    text: defineMessage({ defaultMessage: 'Cluster Latency' }),
    timeseries: {
      apiMetric: 'szLatencyCountAndSzCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('szLatencyCountAndSzCount'),
    histogram: {
      highlightAbove: false,
      initialThreshold: 10,
      apiMetric: 'szLatency',
      splits: [2, 5, 10, 25, 50, 100, 200, 500],
      xUnit: defineMessage({ defaultMessage: 'ms' }),
      yUnit: 'internode links',
      shortXFormat: (x: number) => x,
      reFormatFromBarChart: noFormat
    },
    pill: {
      description: defineMessage({
        defaultMessage: '{successCount} of {totalCount} internode links'
      }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'below' }),
        defineMessage({ defaultMessage: '{threshold} ms' })
      ],
      pillSuffix: pillSuffix.meetGoal,
      thresholdFormatter: null,
      tooltip: defineMessage({
        defaultMessage:
          'The time-series graph on the left displays the percentage of samples that have intra-SZ cluster latency (which is the latency between each node within a SZ cluster) which meets the configured SLA. The bar chart on the right captures the distribution of the latency across the number of clusters. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
      })
    },
    configChange: {
      apiMetric: 'szLatency',
      format: formatter('durationFormat'),
      deltaSign: '-'
    }
  },
  switchPoeUtilization: {
    text: defineMessage({ defaultMessage: 'PoE Utilization Compliance' }),
    enableSwitchFirmwareFilter: shouldAddFirmwareFilter,
    isBeta: false,
    timeseries: {
      apiMetric: 'switchPoeUtilizationCountAndSwitchCount',
      minGranularity: 'PT15M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: 0.8,
      apiMetric: 'switchPoeUtilization',
      splits: [0.1, 0.25, 0.5, 0.6, 0.7, 0.8, 0.9],
      xUnit: '%',
      yUnit: 'switches',
      shortXFormat: multipleBy100,
      longXFormat: formatter('percentFormat'),
      reFormatFromBarChart: divideBy100
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} switches' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'below' }),
        defineMessage({ defaultMessage: '{threshold}' })
      ],
      pillSuffix: pillSuffix.meetGoal,
      thresholdFormatter: formatter('percentFormat'),
      tooltip: defineMessage({ defaultMessage: 'Compliance metric of switches where power consumed is within budget allocation.' })
    }
  },
  onlineAPs: {
    text: defineMessage({ defaultMessage: 'Online APs' }),
    timeseries: {
      apiMetric: 'onlineAPCountAndTotalAPCount',
      minGranularity: 'PT15M'
    },
    barChart: createBarChartConfig('onlineAPCountAndTotalAPCount'),
    pill: {
      description: '',
      thresholdDesc: [],
      pillSuffix: '',
      thresholdFormatter: null,
      tooltip: defineMessage({ defaultMessage: 'Online APs measures the percentage of APs which are online and connected to {smartZone}.{br}{br}The time-series graph on the left displays the Online AP percentage across time. The bar chart on the right captures the daily Online AP percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.' })
    },
    configChange: {
      text: defineMessage({ defaultMessage: 'Online APs Count' }),
      apiMetric: 'onlineAPCount',
      format: formatter('countFormat'),
      deltaSign: '+'
    }
  },
  switchReachability: {
    text: defineMessage({ defaultMessage: 'Switch Reachability' }),
    enableSwitchFirmwareFilter: true,
    timeseries: {
      apiMetric: 'switchStatusCountAndSwitchCount',
      minGranularity: 'PT15M'
    },
    barChart: createBarChartConfig('switchStatusCountAndSwitchCount'),
    pill: {
      description: '',
      thresholdDesc: [],
      pillSuffix: '',
      thresholdFormatter: null,
      tooltip: defineMessage({ defaultMessage: 'Metric of accessibility of switches to controller.' })
    }
  },
  switchMemoryUtilization: {
    text: defineMessage({ defaultMessage: 'Memory Compliance' }),
    isBeta: false,
    enableSwitchFirmwareFilter: true,
    timeseries: {
      apiMetric: 'switchMemoryUtilizationCountAndSwitchCount',
      minGranularity: 'PT15M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: 80,
      apiMetric: 'switchMemoryUtilization',
      splits: [10, 20, 40, 60, 80, 85, 90, 95, 99],
      xUnit: '%',
      yUnit: 'switches',
      shortXFormat: noFormat,
      longXFormat: noFormat,
      reFormatFromBarChart: noFormat
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} switches use' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'under' }),
        defineMessage({ defaultMessage: '{threshold} Memory' })
      ],
      pillSuffix: pillSuffix.meetGoal,
      thresholdFormatter: numberWithPercentSymbol,
      tooltip: defineMessage({ defaultMessage: 'Compliance metric of switches with memory utilization below a threshold.' })
    }
  },
  switchCpuUtilization: {
    text: defineMessage({ defaultMessage: 'CPU Compliance' }),
    isBeta: false,
    enableSwitchFirmwareFilter: true,
    refreshWiredSummary: true,
    timeseries: {
      apiMetric: 'switchCpuUtilizationCountAndSwitchCount',
      minGranularity: 'PT15M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: 90,
      apiMetric: 'switchCpuUtilization',
      splits: [10, 20, 40, 60, 80, 85, 90, 95, 99],
      xUnit: '%',
      yUnit: 'switches',
      shortXFormat: noFormat,
      longXFormat: noFormat,
      reFormatFromBarChart: noFormat
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} switches use' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'under' }),
        defineMessage({ defaultMessage: '{threshold} CPU' })
      ],
      pillSuffix: pillSuffix.meetGoal,
      thresholdFormatter: numberWithPercentSymbol,
      valueFormatter: 'percentFormat',
      tooltip: defineMessage({ defaultMessage: 'Compliance metric of switches with CPU utilization below a threshold.' })
    }
  },
  switchesTemperature: {
    text: defineMessage({ defaultMessage: 'Temperature Compliance' }),
    enableSwitchFirmwareFilter: true,
    timeseries: {
      apiMetric: 'switchTempCountAndSwitchCount',
      minGranularity: 'PT15M'
    },
    barChart: createBarChartConfig('switchTempCountAndSwitchCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{avgSuccessCount} of {maxCount} switches are under safe thresholds of temperature.' }),
      thresholdDesc: [],
      pillSuffix: '',
      thresholdFormatter: null,
      tooltip: defineMessage({ defaultMessage: 'Compliance metric of switches within safe temperature operating conditions.' })
    }
  },
  switchUplinkPortUtilization: {
    text: defineMessage({ defaultMessage: 'Uplink Port Utilization Compliance' }),
    isBeta: false,
    enableSwitchFirmwareFilter: true,
    refreshWiredSummary: true,
    timeseries: {
      apiMetric: 'switchUplinkPortUtilCountAndPortCount',
      minGranularity: 'PT15M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: 80,
      apiMetric: 'switchUplinkPortUtilization',
      splits: [10, 20, 40, 60, 80, 85, 90, 95, 99],
      xUnit: '%',
      yUnit: 'Ports',
      shortXFormat: noFormat,
      longXFormat: noFormat,
      reFormatFromBarChart: noFormat
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} uplink ports are' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'under' }),
        defineMessage({ defaultMessage: '{threshold} congested' })
      ],
      pillSuffix: pillSuffix.meetGoal,
      thresholdFormatter: numberWithPercentSymbol,
      valueFormatter: 'percentFormat',
      tooltip: defineMessage({ defaultMessage: 'Compliance metric that refers to amount of network traffic that is transmitted effectively through the uplink port of wired switches.' })
    }
  },
  switchPortUtilization: {
    text: defineMessage({ defaultMessage: 'Port Utilization Compliance' }),
    isBeta: false,
    enableSwitchFirmwareFilter: true,
    timeseries: {
      apiMetric: 'switchPortUtilizationCountAndPortCount',
      minGranularity: 'PT15M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: 80,
      apiMetric: 'switchPortUtilization',
      splits: [10, 20, 40, 60, 80, 85, 90, 95, 99],
      xUnit: '%',
      yUnit: 'Ports',
      shortXFormat: noFormat,
      longXFormat: noFormat,
      reFormatFromBarChart: noFormat
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} ports are' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'under' }),
        defineMessage({ defaultMessage: '{threshold} congested' })
      ],
      pillSuffix: pillSuffix.meetGoal,
      thresholdFormatter: numberWithPercentSymbol,
      valueFormatter: 'percentFormat',
      tooltip: defineMessage({ defaultMessage: 'Compliance metric that refers to traffic being transmitted effectively if its within the network capacity.' })
    }
  },
  switchInterfaceAnomalies: {
    text: defineMessage({ defaultMessage: 'Interface Health Compliance' }),
    enableSwitchFirmwareFilter: true,
    timeseries: {
      apiMetric: 'switchInterfaceAnomaliesCountAndPortCount',
      minGranularity: 'PT15M'
    },
    barChart: createBarChartConfig('switchInterfaceAnomaliesCountAndPortCount'),
    pill: {
      description: defineMessage({ defaultMessage: 'Ports without anomalies' }),
      thresholdDesc: [],
      pillSuffix: '',
      thresholdFormatter: null,
      tooltip: defineMessage({ defaultMessage: 'Compliance metric that refers to unexpected and abnormal networking behaviour can occur due to cable issues, failed negotiation, and MTU Errors, Input errors contributing to bad user minutes.' })
    }
  },
  switchStormControl: {
    text: defineMessage({ defaultMessage: 'MC Traffic' }),
    isBeta: false,
    enableSwitchFirmwareFilter: true,
    refreshWiredSummary: true,
    timeseries: {
      apiMetric: 'switchPortStormCountAndPortCount',
      minGranularity: 'PT15M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: 80,
      apiMetric: 'switchPortStormCount',
      splits: [10, 20, 40, 60, 80, 85, 90, 95, 99],
      xUnit: '%',
      yUnit: 'Ports',
      shortXFormat: noFormat,
      longXFormat: noFormat,
      reFormatFromBarChart: noFormat
    },
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} ports are' }),
      thresholdDesc: [
        defineMessage({ defaultMessage: 'under' }),
        defineMessage({ defaultMessage: '{threshold} MC packets storm' })
      ],
      pillSuffix: pillSuffix.meetGoal,
      thresholdFormatter: numberWithPercentSymbol,
      valueFormatter: 'percentFormat',
      tooltip: defineMessage({ defaultMessage: 'Compliance metrics that refers to multicast traffic received that is >= threshold.' })
    }
  },
  switchAuthentication: {
    text: defineMessage({ defaultMessage: 'Authentication' }),
    enableSwitchFirmwareFilter: true,
    timeseries: {
      apiMetric: 'switchAuthCountAndAttemptCount',
      minGranularity: 'PT15M'
    },
    barChart: createBarChartConfig('switchAuthCountAndAttemptCount'),
    pill: {
      description: defineMessage({ defaultMessage: '{successCount} of {totalCount} of auth succeeded' }),
      thresholdDesc: [],
      pillSuffix: '',
      thresholdFormatter: null,
      tooltip: defineMessage({ defaultMessage: 'Metric of authentication events amongst success and failed categories.' })
    }
  }
}
export const kpisForTab = (isMLISA? : string) => {
  return {
    overview: {
      kpis: [
        'connectionSuccess',
        'timeToConnect',
        'clientThroughput',
        'apCapacity',
        'apServiceUptime',
        'onlineAPs'
      ]
    },
    connection: {
      kpis: [
        'userAuthentication',
        'association',
        'eap',
        'radius',
        'dhcp',
        'roamingSuccess'
      ]
    },
    performance: {
      kpis: [
        'clientThroughput',
        'apCapacity',
        'rss'
      ]
    },
    infrastructure: {
      kpis: [
        'apServiceUptime',
        'apToSZLatency',
        ...(isMLISA ? ['clusterLatency'] : []),
        'switchPoeUtilization',
        'onlineAPs'
      ]
    }
  }
}

export const wiredKPIsForTab = (is10010eKPIsEnabled = false) => {
  const kpis = {
    overview: {
      kpis: [
        'switchUplinkPortUtilization'
        // TODO: revisit this kpi: https://jira.ruckuswireless.com/browse/RSA-6826
        //'switchReachability'
      ]
    },
    connection: {
      kpis: [
        'switchAuthentication'
      ]
    },
    performance: {
      kpis: [
        'switchPortUtilization',
        'switchUplinkPortUtilization'
      ]
    },
    infrastructure: {
      kpis: [
        // TODO: revisit this kpi: https://jira.ruckuswireless.com/browse/RSA-6826
        //'switchReachability',
        'switchMemoryUtilization',
        'switchCpuUtilization',
        'switchesTemperature',
        'switchPoeUtilization'
      ]
    }
  }
  if (is10010eKPIsEnabled) {
    kpis.performance.kpis.push('switchInterfaceAnomalies')
    kpis.performance.kpis.push('switchStormControl')
    kpis.connection.kpis.push('switchDhcp')
  }
  return kpis
}
