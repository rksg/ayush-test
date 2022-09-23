import moment from 'moment-timezone'

import { formatter } from '@acx-ui/utils'

const valueLabel = {
  success: '{{value}}% success',
  meetGoal: '{{value}}% meets goal'
}

const createBarChartConfig = (apiMetric: string) => ({
  apiMetric,
  shortXFormat: (date: string) => moment(date).format('DD'),
  longYFormat: (val: number) => formatter('percentFormat')(val / 100),
  shortYFormat: (val: number) => formatter('percentFormat')(val / 100)
})

// const createUnitFormatter = (text: string, formatFn = formatter()) => 
//   (x: number) => t(text, { value: formatFn(x) })

const divideBy1000 = (ms: number) => ms / 1000

export const kpiConfig = {
  connectionSuccess: {
    text: 'Connection Success',
    timeseries: {
      apiMetric: 'connectionSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('connectionSuccessAndAttemptCount'),
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} attempts', '', ''],
      valueLabel: valueLabel.success,
      tooltip: 'A connection is deemed successful when a Wifi client is able to complete the 802.11 authentication, association, L2 authentication and receives an IP address from the DHCP. If any of these stages fail, it is considered as a failed connection. For L3 authentication, such as WISPr and captive portal authentication, since the Wifi client will receive an IP address before the L3 authentication, the client connection will be deemed successful before the L3 authentication completes.\n\nThe time-series graph on the left displays the percentage of successful connections across time, and the bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  },
  timeToConnect: {
    text: 'Time to Connect',
    timeseries: {
      apiMetric: 'ttcCountAndConnectionCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      initialThreshold: 2000,
      splits: [1000, 2000, 5000, 10000, 30000, 50000],
      apiMetric: 'timeToConnect',
      xUnit: 'sec',
      shortXFormat: divideBy1000,
      //longXFormat: createUnitFormatter('{{value}} seconds', divideBy1000),
     // shortYFormat: formatter(),
      //longYFormat: createUnitFormatter('{{value}} connections')
    },
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} connections', 'under ', '{{formattedThreshold}} seconds'],
      valueLabel: valueLabel.meetGoal,
      tooltip: 'The time to connect (TTC) measures the total time taken for a Wifi client to successfully go through all the required stages in order to establish a IP connection, namely 802.11 authentication, association, L2 authentication, and receiving an IP address from the DHCP. For L3 authentication, such as WISPr and captive portal authentication, since the Wifi client will receive an IP address before the L3 authentication, the time to connect does not include the time taken for L3 authentication.\n\nThe time-series graph on the left displays the percentage of successful connections across time that meet the configured TTC SLA. Bar chart on the right displays the distribution of TTC. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.',
      thresholdFormat: divideBy1000
    }
  },
  association: {
    text: 'Association',
    timeseries: {
      apiMetric: 'assocSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    // barChart: createBarChartConfig('assocSuccessAndAttemptCount'),
    // pill: {
    //   description: ['{{thresholdCount}} of {{totalCount}} association attempts'],
    //   valueLabel: valueLabel.success,
    //   tooltip: 'The time-series graph on the left displays the percentage of association attempts that have completed successfully. An association attempt is deemed successful when the Wifi client receives an Association ID from the AP. It is normal for a single Wifi client to have more than one association attempts.\n\nThe bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    // }
  },
  userAuthentication: {
    text: '802.11 Authentication',
    timeseries: {
      apiMetric: 'authSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('authSuccessAndAttemptCount'),
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} Auth attempts'],
      valueLabel: valueLabel.success,
      tooltip: 'The time-series graph on the left displays the percentage of 802.11 authentication attempts that has completed successfully. 802.11 authentication is the first step in establishing a WiFi connection, and it requires a WiFi client to establish its identity as a valid 802.11 device with an AP. No data encryption or security is available at this stage, and it is not to be confused with WPA or 802.1X authentication.\n\nThe bar chart on the right captures the daily percentage over the past 7 days. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the histogram will stay constant based on the selected date range at the top of the page.'
    }
  },
  eap: {
    text: 'EAP',
    timeseries: {
      apiMetric: 'eapSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('eapSuccessAndAttemptCount'),
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} EAP attempts'],
      valueLabel: valueLabel.success,
      tooltip: 'The time-series graph on the left displays the percentage of EAP attempts (consisting the 4-way handshake between client and AP) that have completed successfully. An EAP attempt is deemed successful when all the necessary handshakes are completed. Do note that a single Wifi client could have multiple EAP attempts.\n\nThe bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  },
  dhcp: {
    textPostFix: 'Success',
    text: 'DHCP',
    timeseries: {
      apiMetric: 'dhcpSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('dhcpSuccessAndAttemptCount'),
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} DHCP attempts'],
      valueLabel: valueLabel.success,
      tooltip: 'The time-series graph on the left displays the percentage of DHCP connection attempts that have completed successfully. A DHCP connection attempt is deemed successful when the Wifi client has received an IP address from the DHCP server. Do note that a single Wifi client could have multiple DHCP connection attempts.\n\nThe bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  },
  radius: {
    text: 'RADIUS',
    timeseries: {
      apiMetric: 'radiusSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('radiusSuccessAndAttemptCount'),
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} RADIUS attempts'],
      valueLabel: valueLabel.success,
      tooltip: 'The time-series graph on the left displays the percentage of RADIUS authentication attempts that have completed successfully. A RADIUS authentication attempt is deemed successful when all the necessary handshakes in the RADIUS protocol are completed, and the client is either allowed or denied access. Do note that a single Wifi client could have multiple authentication attempts.\n\nThe bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  },
  captivePortal: {
    text: 'Captive Portal',
    timeseries: {
      apiMetric: 'CHANGEME',
      minGranularity: 'PT3M'
    }
  },
  roamingSuccess: {
    text: 'Roaming Success',
    timeseries: {
      apiMetric: 'clientRoamingSuccessAndAttemptCount',
      minGranularity: 'PT3M'
    },
    barChart: createBarChartConfig('clientRoamingSuccessAndAttemptCount'),
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} attempts', '', ''],
      valueLabel: valueLabel.success,
      tooltip: 'This metric measures the percentage of roaming attempts that have completed successfully. A roaming attempt is deemed successful when the Wifi client has its session transferred from one AP to the next. It is possible for a single Wifi client to have multiple roaming attempts.\n\nThe bar chart on the right captures the daily percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  },
  rss: {
    text: 'Client RSS',
    timeseries: {
      apiMetric: 'rssCountAndSessionCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: -75,
      apiMetric: 'rss',
      splits: [-100, -90, -85, -80, -75, -70, -65, -60, -50],
      xUnit: 'dBm',
      //longXFormat: x => t('{{x}} dBm', {x}),
      //shortYFormat: formatter(),
      //longYFormat: createUnitFormatter('{{value}} sessions'),
      isReverse: true
    },
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} sessions', 'under ', '{{formattedThreshold}} dBm'],
      valueLabel: valueLabel.meetGoal,
      tooltip: 'The time-series graph on the left displays the percentage of client sessions with average RSS that has met the configured SLA. The bar chart on the right captures the distribution of the RSS. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  },
  clientThroughput: {
    text: 'Client Throughput',
    timeseries: {
      apiMetric: 'throughputCountAndSessionCount',
      minGranularity: 'PT3M'
    },
    // // TODO: multiple initial SLA ?
    histogram: {
      highlightAbove: true,
      initialThreshold: 10000,
      splits: [10000, 25000, 50000, 100000, 200000, 500000, 1000000],
      apiMetric: 'clientThroughput',
      xUnit: 'Mbps',
      shortXFormat: divideBy1000,
      //longXFormat: x => t('{{x}} Mbps', {x: divideBy1000(x)}),
      //shortYFormat: formatter(),
      //longYFormat: createUnitFormatter('{{value}} samples')
    },
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} sessions', 'above ', '{{formattedThreshold}} Mbps'],
      valueLabel: valueLabel.meetGoal,
      tooltip: 'Client throughput measures the down link throughput estimate of the client, taking into consideration RF channel conditions, interference, channel contention and client capabilities.\n\nThe time-series graph on the left displays the percentage of Wifi sessions across time that have a client throughput that meet the configured SLA. The bar chart on the right displays the distribution of the client throughput. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.',
      thresholdFormat: divideBy1000
    }
  },
  apCapacity: {
    text: 'AP Capacity',
    timeseries: {
      apiMetric: 'capacityCountAndAPCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      highlightAbove: true,
      initialThreshold: 50,
      splits: [5, 10, 25, 50, 100, 300, 500],
      apiMetric: 'apCapacity',
      xUnit: 'Mbps',
      //shortXFormat: identity,
      //longXFormat: x => t('{{x}} Mbps', {x}),
      //shortYFormat: formatter(),
      //longYFormat: createUnitFormatter('{{value}} APs')
    },
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} APs', 'above ', '{{formattedThreshold}} Mbps'],
      valueLabel: valueLabel.meetGoal,
      tooltip: 'AP capacity measures the downlink saturated throughput estimate of the AP radios, taking into consideration the RF channel conditions, interference, channel contention and client capabilities.\n\nThe time-series graph on the left displays the percentage of AP capacity samples across time that meets the configured SLA. The bar chart on the right displays the distribution of AP capacity across the number of APs. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  },
  airtimeEfficiency: {
    text: 'Airtime Efficiency/Overhead',
    timeseries: {
      apiMetric: 'CHANGEME',
      minGranularity: 'PT3M'
    },
    histogram: {
      initialThreshold: 50,
      apiMetric: 'CHANGEME'
    }
  },
  apServiceUptime: {
    text: 'AP-RUCKUS Cloud Connection Uptime',
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
      //shortXFormat: x => formatter('percentFormatNoSign')(x),
      //longXFormat: x => formatter('percentFormat')(x),
      //shortYFormat: formatter(),
      //longYFormat: createUnitFormatter('{{value}} APs')
    },
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} APs', 'above ', '{{formattedThreshold}}'],
      valueLabel: valueLabel.meetGoal,
      tooltip: 'AP-Controller connection uptime measures the percentage of time the AP radios are fully available for client service.\n\nThe time-series graph on the left displays the percentage of AP-Controller connection uptime samples across time that meets the configured SLA. The bar chart on the right displays the distribution of AP service uptime across the number of APs. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.',
      //thresholdFormat: x => formatter('percentFormat')(x)
    }
  },
  apToSZLatency: {
    text: 'AP-to-RUCKUS Cloud Latency',
    timeseries: {
      apiMetric: 'apSzLatencyCountAndAPCount',
      minGranularity: 'PT3M'
    },
    // histogram: {
    //   highlightAbove: false,
    //   initialThreshold: isAlto() ? 200 : 40,
    //   apiMetric: 'apSzLatency',
    //   splits: isAlto()
    //     ? [50, 100, 150, 200, 250, 300, 350, 400]
    //     : [5, 10, 20, 40, 60, 100, 200, 500],
    //   xUnit: 'ms',
    //   longXFormat: x => t('{{x}} ms', {x}),
    //   shortYFormat: formatter(),
    //   longYFormat: createUnitFormatter('{{value}} APs')
    // },
    // pill: {
    //   description: ['{{thresholdCount}} of {{totalCount}} APs', 'under ', '{{formattedThreshold}} ms'],
    //   valueLabel: valueLabel.meetGoal,
    //   tooltip: 'The time-series graph on the left displays the percentage of APs that have AP-to-SZ control plane latency which meets the configured SLA. The bar chart on the right captures the distribution of the latency across the number of APs. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    // },
  },
  szUptime: {
    text: 'SZ Uptime',
    timeseries: {
      apiMetric: 'CHANGEME',
      minGranularity: 'PT3M'
    }
  },
  clusterLatency: {
    text: 'Cluster Latency',
    timeseries: {
      apiMetric: 'szLatencyCountAndSzCount',
      minGranularity: 'PT3M'
    },
    histogram: {
      highlightAbove: false,
      initialThreshold: 10,
      apiMetric: 'szLatency',
      splits: [2, 5, 10, 25, 50, 100, 200, 500],
      xUnit: 'ms',
      //longXFormat: x => t('{{x}} ms', {x}),
      //shortYFormat: formatter(),
      //longYFormat: createUnitFormatter('{{value}} internode links')
    },
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} internode links', 'under ', '{{formattedThreshold}} ms'],
      valueLabel: valueLabel.meetGoal,
      tooltip: 'The time-series graph on the left displays the percentage of samples that have intra-SZ cluster latency (which is the latency between each node within a SZ cluster) which meets the configured SLA. The bar chart on the right captures the distribution of the latency across the number of clusters. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  },
  switchPoeUtilization: {
    text: 'PoE Utilization',
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
      //shortXFormat: formatter('percentFormatNoSign'),
      longXFormat: formatter('percentFormat'),
      //shortYFormat: formatter(),
      //longYFormat: createUnitFormatter('{{value}} switches')
    },
    pill: {
      description: ['{{thresholdCount}} of {{totalCount}} switches', 'below ', '{{formattedThreshold}}'],
      valueLabel: valueLabel.meetGoal,
      thresholdFormat: formatter('percentFormat'),
      tooltip: 'The PoE Utilization measures the percentage of the switches that utilize less power than the goal set.\n\nThe time-series graph on the left displays the percentage of switches across time that meet the configured SLA. The bar chart on the right captures the distribution of PoE Utilization across the number of switches. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  },
  onlineAPs: {
    text: 'Online APs',
    timeseries: {
      apiMetric: 'onlineAPCountAndTotalAPCount',
      minGranularity: 'PT15M'
    },
    barChart: createBarChartConfig('onlineAPCountAndTotalAPCount'),
    pill: {
      description: ['', '', ''],
      valueLabel: '{{value}}%',
      thresholdFormat: formatter('countFormat'),
      tooltip: 'Online APs measures the percentage of APs which are online and connected to Smart Zone.\n\nThe time-series graph on the left displays the Online AP percentage across time. The bar chart on the right captures the daily Online AP percentage over the last 7 days of the selected time range. Do note that the numbers related to the time-series graph will change as you zoom in/out of a time range, whereas the bar chart will stay fixed based on the selected time range at the top of the page.'
    }
  }
}

export const kpisForTab = {
  overview: {
    // display order
    kpis: [
      'connectionSuccess',
      'timeToConnect',
      'clientThroughput',
      'apCapacity',
      'apServiceUptime',
      'onlineAPs'
    ],
    // order in which queries are executed
    loadOrder: [
      'connectionSuccess',
      'apServiceUptime',
      'apCapacity',
      'timeToConnect',
      'clientThroughput',
      'onlineAPs'
    ]
  },
  connection: {
    // display order
    kpis: [
      'connectionSuccess',
      'timeToConnect',
      'userAuthentication',
      'association',
      'eap',
      'radius',
      'dhcp',
      'roamingSuccess'
      // 'captivePortal',
    ],
    // order in which queries are executed
    loadOrder: [
      'connectionSuccess',
      'userAuthentication',
      'association',
      'eap',
      'radius',
      'dhcp',
      'roamingSuccess',
      'timeToConnect'
    ]
  },
  performance: {
    kpis: [
      'clientThroughput',
      'apCapacity',
      'rss'
      // 'airtimeEfficiency'
    ],
    loadOrder: [
      'rss',
      'apCapacity',
      'clientThroughput'
    ]
  },
  infrastructure: {
    kpis: [
      'apServiceUptime',
      'apToSZLatency',
      // isAlto() ? null : 'clusterLatency',
      'switchPoeUtilization',
      'onlineAPs'
      // 'szUptime',
    ].filter(Boolean),
    loadOrder: [
      // isAlto() ? null : 'clusterLatency',
      'apServiceUptime',
      'apToSZLatency',
      'switchPoeUtilization',
      'onlineAPs'
    ].filter(Boolean)
  }
}