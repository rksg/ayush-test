/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import { compareVersion } from '@acx-ui/analytics/utils'
import { get }            from '@acx-ui/config'
import { formatter }      from '@acx-ui/formatter'

import { CRRMStates } from './states'
import { crrmText }   from './utils'

export type IconValue = { order: number, label: MessageDescriptor }

export type StatusTrail = Array<{ status: Lowercase<StateType>, createdAt?: string }>

export type ConfigurationValue =
  string |
  Array<{ channelMode: string, channelWidth: string, radio: string }> |
  boolean |
  null

export const crrmStates: Record<CRRMStates, IconValue> = {
  [CRRMStates.optimized]: { order: 0, label: defineMessage({ defaultMessage: 'Optimized' }) },
  [CRRMStates.nonOptimized]: { order: 1, label: defineMessage({ defaultMessage: 'Non-Optimized' }) },
  [CRRMStates.verified]: { order: 0, label: defineMessage({ defaultMessage: 'Verified' }) },
  [CRRMStates.insufficientLicenses]: { order: 2, label: defineMessage({ defaultMessage: 'Insufficient Licenses' }) },
  [CRRMStates.unqualifiedZone]: { order: 2, label: defineMessage({ defaultMessage: 'Unqualified Zone' }) },
  [CRRMStates.noAps]: { order: 2, label: defineMessage({ defaultMessage: 'No APs' }) },
  [CRRMStates.verificationError]: { order: 2, label: defineMessage({ defaultMessage: 'Verification Error' }) },
  [CRRMStates.unknown]: { order: 2, label: defineMessage({ defaultMessage: 'Unknown' }) }
}

export const priorities: Record<'low' | 'medium' | 'high', IconValue> = {
  low: { order: 0, label: defineMessage({ defaultMessage: 'Low' }) },
  medium: { order: 1, label: defineMessage({ defaultMessage: 'Medium' }) },
  high: { order: 2, label: defineMessage({ defaultMessage: 'High' }) }
}

type CodeInfo = {
  category: MessageDescriptor,
  summary: MessageDescriptor,
  partialOptimizedSummary?: MessageDescriptor,
  priority: IconValue
}

type RecommendationKPIConfig = {
  key: string;
  label: MessageDescriptor;
  tooltipContent?: MessageDescriptor;
  format: ReturnType<typeof formatter>;
  deltaSign: '+' | '-' | 'none';
  valueAccessor?: (value: number[]) => number;
  valueFormatter?: ReturnType<typeof formatter>;
  showAps?: boolean;
  onlyForStatuses?: StateType[]
}

type RecommendationConfig = {
  valueFormatter: ReturnType<typeof formatter>;
  valueText: MessageDescriptor;
  actionText: MessageDescriptor;
  reasonText: MessageDescriptor;
  tradeoffText: MessageDescriptor;
  appliedReasonText?: MessageDescriptor;
  kpis: RecommendationKPIConfig[],
  recommendedValueTooltipContent?:
    string |
    ((status: StateType, currentValue: ConfigurationValue, recommendedValue: string) =>
      MessageDescriptor);
  partialOptimizedActionText?: MessageDescriptor;
  partialOptimizationAppliedReasonText?: MessageDescriptor;
  partialOptimizedTradeoffText?: MessageDescriptor;
}

const categories = {
  'Wi-Fi Client Experience': defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
  'Security': defineMessage({ defaultMessage: 'Security' }),
  'Infrastructure': defineMessage({ defaultMessage: 'Infrastructure' }),
  'AP Performance': defineMessage({ defaultMessage: 'AP Performance' }),
  'AI-Driven Cloud RRM': defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
  'Insufficient Licenses': crrmStates[CRRMStates.insufficientLicenses].label,
  'Verification Error': crrmStates[CRRMStates.verificationError].label,
  'Verified': crrmStates[CRRMStates.verified].label,
  'Unqualified Zone': crrmStates[CRRMStates.unqualifiedZone].label,
  'No APs': crrmStates[CRRMStates.noAps].label
}

const bandbalancingEnable: RecommendationConfig = {
  valueFormatter: formatter('enabledFormat'),
  valueText: defineMessage({ defaultMessage: 'Load Balancing: Band Balancing Mode' }),
  actionText: defineMessage({ defaultMessage: 'Band Balancing Mode for {scope} is disabled. It is recommended to enable Band Balancing Mode.' }),
  reasonText: defineMessage({ defaultMessage: 'Band Balancing feature intelligently distributes WLAN clients on 2.4 GHz and 5 GHz channels in order to balance the client load. Band Balancing shall result in better radio utilization resulting in better Wi-Fi experience to the user.' }),
  tradeoffText: defineMessage({ defaultMessage: 'This feature requires Wi-Fi clients to have BTM capability. If there are legacy Wi-Fi clients with incorrect BTM implementation, such clients may have intermittent issues when connecting to Wi-Fi.' }),
  kpis: [{
    key: 'client-ratio',
    label: defineMessage({ defaultMessage: 'Percentage of Clients on 2.4 GHz' }),
    format: formatter('percentFormat'),
    deltaSign: '-'
  }]
}


export const states = {
  new: {
    text: defineMessage({ defaultMessage: 'New' }),
    tooltip: defineMessage({ defaultMessage: 'Schedule a day and time to apply this recommendation.' })
  },
  applyscheduled: {
    text: defineMessage({ defaultMessage: 'Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'Recommendation has been scheduled for {scheduledAt}. Note that the actual configuration change will happen asynchronously within 1 hour of the scheduled time.' })
  },
  applyscheduleinprogress: {
    text: defineMessage({ defaultMessage: 'Apply In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'Recommendation scheduled for {scheduledAt} is in progress' })
  },
  applied: {
    text: defineMessage({ defaultMessage: 'Applied' }),
    tooltip: defineMessage({ defaultMessage: 'Recommendation has been successfully applied on {updatedAt}. RUCKUS Analytics will monitor this configuration change for the next 7 days until {updatedAtPlus7Days}.' }),
    tooltipCCR: defineMessage({ defaultMessage: 'Recommendation has been successfully applied on {updatedAt}.' })
  },
  applyfailed: {
    text: defineMessage({ defaultMessage: 'Failed' }),
    tooltip: defineMessage({ defaultMessage: 'An error was encountered on {updatedAt} when the recommended configuration change was applied. Note that no configuration change was made.\n\nError: {errorMessage}' })
  },
  beforeapplyinterrupted: {
    text: defineMessage({ defaultMessage: 'Interrupted (Recommendation not applied)' }),
    tooltip: defineMessage({ defaultMessage: 'RUCKUS Analytics has detected a manual configuration change in {smartZone} on {updatedAt} that may interfere with this recommendation. As such, the recommendation scheduled for {scheduledAt} has been canceled. Manually check whether this recommendation is still valid.' })
  },
  afterapplyinterrupted: {
    text: defineMessage({ defaultMessage: 'Interrupted (Recommendation applied)' }),
    tooltip: defineMessage({ defaultMessage: 'RUCKUS Analytics has detected a manual configuration change in {smartZone} on {updatedAt} that may interfere with this recommendation. As such, the results from the monitoring of this configuration change may not be relevant anymore. Manually check whether this recommendation is still valid.' })
  },
  applywarning: {
    text: defineMessage({ defaultMessage: 'REVERT' }),
    tooltip: defineMessage({ defaultMessage: 'RUCKUS Analytics has detected a degradation in network performance after the application of the recommended configuration on {updatedAt}. Click revert to undo the configuration change as soon as possible.' })
  },
  revertscheduled: {
    text: defineMessage({ defaultMessage: 'Revert Scheduled' }),
    tooltip: defineMessage({ defaultMessage: 'A reversion to undo the configuration change has been scheduled for {scheduledAt}. Note that the actual reversion of configuration will happen asynchronously within 1 hour of the scheduled time.' })
  },
  revertscheduleinprogress: {
    text: defineMessage({ defaultMessage: 'Revert In Progress' }),
    tooltip: defineMessage({ defaultMessage: 'Revert scheduled for {scheduledAt} is in progress' })
  },
  revertfailed: {
    text: defineMessage({ defaultMessage: 'Revert Failed' }),
    tooltip: defineMessage({ defaultMessage: 'An error was encountered on {updatedAt} when the reversion was applied. Note that no reversion was made.\n\nError: {errorMessage}' }),
    tooltipPartial: defineMessage({ defaultMessage: 'Error(s) were encountered on {updatedAt} when the reversion was applied. \n\nErrors: \n{errorMessage}' })
  },
  reverted: {
    text: defineMessage({ defaultMessage: 'Reverted' }),
    tooltip: defineMessage({ defaultMessage: 'Reversion has been successfully applied on {updatedAt}.' })
  },
  deleted: {
    text: defineMessage({ defaultMessage: 'Deleted' }),
    tooltip: defineMessage({ defaultMessage: 'Deleted' })
  },
  unqualifiedZone: {
    text: crrmStates[CRRMStates.unqualifiedZone].label,
    tooltip: crrmStates[CRRMStates.unqualifiedZone].label
  },
  noAps: {
    text: crrmStates[CRRMStates.noAps].label,
    tooltip: crrmStates[CRRMStates.noAps].label
  },
  insufficientLicenses: {
    text: crrmStates[CRRMStates.insufficientLicenses].label,
    tooltip: crrmStates[CRRMStates.insufficientLicenses].label
  },
  verificationError: {
    text: crrmStates[CRRMStates.verificationError].label,
    tooltip: crrmStates[CRRMStates.verificationError].label
  },
  verified: {
    text: crrmStates[CRRMStates.verified].label,
    tooltip: crrmStates[CRRMStates.verified].label
  },
  unknown: {
    text: crrmStates[CRRMStates.unknown].label,
    tooltip: crrmStates[CRRMStates.unknown].label
  }
}

export type StateType = keyof typeof states

const probeflexConfig: RecommendationConfig = {
  valueFormatter: formatter('enabledFormat'),
  valueText: defineMessage({ defaultMessage: 'AirFlexAI' }),
  actionText: defineMessage({ defaultMessage: 'AirFlexAI for this {scope} is currently not enabled. This is a RF feature that is only available via RUCKUS AI, and it performs better than the default Airtime Decongestion (ATD) feature in {smartZone}. It is recommended to enable AirFlexAI suppression in all WLANs. It is possible to deselect specific WLANs when applying this recommendation.' }),
  reasonText: defineMessage({ defaultMessage: 'AirFlexAI suppresses unnecessary probe responses from APs to reduce the management traffic overhead and steer clients to connect to APs with better RSS. This will free up airtime, especially in high density deployments, and increase the connection RSS, thus improving the overall network performance.' }),
  tradeoffText: defineMessage({ defaultMessage: 'This feature may cause a slight increase (~1 secs) in time to connect for a very small percentage of clients since probes are being suppressed.' }),
  recommendedValueTooltipContent: () => defineMessage({ defaultMessage: 'Enabling AirFlexAI suppression will disable Airtime Decongestion' }),
  kpis: [
    {
      key: 'curr-avg-mgmt-traffic-per-client',
      label: defineMessage({ defaultMessage: 'Current average management traffic per client' }),
      format: formatter('bytesFormat'),
      deltaSign: 'none'
    },
    {
      key: 'prev-avg-mgmt-traffic-per-client',
      label: defineMessage({ defaultMessage: 'Average management traffic per client before the recommendation was applied' }),
      format: formatter('bytesFormat'),
      deltaSign: 'none',
      onlyForStatuses: [
        'applied',
        'applyfailed',
        'beforeapplyinterrupted',
        'afterapplyinterrupted',
        'applywarning',
        'revertscheduled',
        'revertscheduleinprogress',
        'revertfailed',
        'reverted'
      ]
    }
  ]
}

export const codes = {
  'c-bgscan24g-enable': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Auto channel selection mode and background scan on 2.4 GHz radio' }),
    priority: priorities.medium,
    valueFormatter: formatter('enabledFormat'),
    valueText: defineMessage({ defaultMessage: 'Background Scan (2.4 GHz)' }),
    actionText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: '2.4 GHz radio setting for {scope} has "Auto Channel Selection" set as "{channelSelectionMode}", however "Background Scan" feature is disabled for this Zone. To effectively use "{channelSelectionMode}" as channel selection algorithm, it recommended to enable "Background Scan" feature with default scan timer as 20 seconds.' })
      : defineMessage({ defaultMessage: '2.4 GHz radio setting for {scope} has "Auto Channel Selection" set as "{channelSelectionMode}", however "Background Scan" feature is disabled for this Venue. To effectively use "{channelSelectionMode}" as channel selection algorithm, it recommended to enable "Background Scan" feature with default scan timer as 20 seconds.' }),
    reasonText: defineMessage({ defaultMessage: 'Auto Channel Selection feature works well only when RUCKUS APs can perform background scan of the available channels in the network. This helps in building the RF neighborhood. APs can then select an optimum channel for their operation. Hence it is recommended to enable Background Scan feature.' }),
    tradeoffText: defineMessage({ defaultMessage: 'Enabling background scan feature would cause RUCKUS Radio to send additional beacons on the shared wireless medium. However the size of these beacons are very small and would cause negligible effect on the network capacity and would outweigh the benefits of using the optimized and non-interfering radio channels.' }),
    kpis: []
  },
  'c-bgscan5g-enable': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Auto channel selection mode and background scan on 5 GHz radio' }),
    priority: priorities.medium,
    valueFormatter: formatter('enabledFormat'),
    valueText: defineMessage({ defaultMessage: 'Background Scan (5 GHz)' }),
    actionText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: '5 GHz radio setting for {scope} has "Auto Channel Selection" set as "{channelSelectionMode}", however "Background Scan" feature is disabled for this Zone. To effectively use "{channelSelectionMode}" as channel selection algorithm, it recommended to enable "Background Scan" feature with default scan timer as 20 seconds.' })
      : defineMessage({ defaultMessage: '5 GHz radio setting for {scope} has "Auto Channel Selection" set as "{channelSelectionMode}", however "Background Scan" feature is disabled for this Venue. To effectively use "{channelSelectionMode}" as channel selection algorithm, it recommended to enable "Background Scan" feature with default scan timer as 20 seconds.' }),
    reasonText: defineMessage({ defaultMessage: 'Auto Channel Selection feature works well only when RUCKUS APs can perform background scan of the available channels in the network. This helps in building the RF neighborhood. APs can then select an optimum channel for their operation. Hence it is recommended to enable Background Scan feature.' }),
    tradeoffText: defineMessage({ defaultMessage: 'Enabling background scan feature would cause RUCKUS Radio to send additional beacons on the shared wireless medium. However the size of these beacons are very small and would cause negligible effect on the network capacity and would outweigh the benefits of using the optimized and non-interfering radio channels.' }),
    kpis: []
  },
  'c-bgscan24g-timer': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Background scan timer on 2.4 GHz radio' }),
    priority: priorities.low,
    valueFormatter: formatter('durationFormat'),
    valueText: defineMessage({ defaultMessage: 'Background Scan Timer (2.4 GHz)' }),
    actionText: defineMessage({ defaultMessage: '2.4 GHz radio setting for {scope} has "Background Scan Timer" set as {currentValue}. Recommended setting for "Background Scan Timer" is {recommendedValue} to effectively use "Background Scan" feature.' }),
    reasonText: defineMessage({ defaultMessage: 'An optimized scan timer for background feature enables RUCKUS APs to scan the channels for an appropriate time interval. Time interval that is too long would result in longer time for radio channel selection.' }),
    tradeoffText: defineMessage({ defaultMessage: 'Though {recommendedValue} is an optimized timer value to scan the radio channels, it may not be needed for Wi-Fi network which is less volatile and has been stabilized over a period of time. However there is no significant overhead or trade-off if the value is kept at {recommendedValue}.' }),
    kpis: [{
      key: 'avg-ap-channel-change-count',
      label: defineMessage({ defaultMessage: 'Average AP Channel Change Count' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }, {
      key: 'max-ap-channel-change-count',
      label: defineMessage({ defaultMessage: 'Max AP Channel Change Count' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }, {
      key: 'co-channel-interference',
      label: defineMessage({ defaultMessage: 'Co-channel Interference' }),
      tooltipContent: defineMessage({ defaultMessage: 'Interference of 0-20% is minimal, 20-50% is mild and 50-100% is severe.' }),
      format: formatter('percentFormat'),
      deltaSign: '-'
    }]
  },
  'c-bgscan5g-timer': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Background scan timer on 5 GHz radio' }),
    priority: priorities.low,
    valueFormatter: formatter('durationFormat'),
    valueText: defineMessage({ defaultMessage: 'Background Scan Timer (5 GHz)' }),
    actionText: defineMessage({ defaultMessage: '5 GHz radio setting for {scope} has "Background Scan Timer" set as {currentValue}.  Recommended setting for "Background Scan Timer" is {recommendedValue} to effectively use "Background Scan" feature.' }),
    reasonText: defineMessage({ defaultMessage: 'An optimized scan timer for background feature enables RUCKUS APs to scan the channels for an appropriate time interval. Time interval that is too long would result in longer time for radio channel selection.' }),
    tradeoffText: defineMessage({ defaultMessage: 'Though {recommendedValue} is an optimized timer value to scan the radio channels, it may not be needed for Wi-Fi network which is less volatile and has been stabilized over a period of time. However there is no significant overhead or trade-off if the value is kept at {recommendedValue}.' }),
    kpis: [{
      key: 'avg-ap-channel-change-count',
      label: defineMessage({ defaultMessage: 'Average AP Channel Change Count' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }, {
      key: 'max-ap-channel-change-count',
      label: defineMessage({ defaultMessage: 'Max AP Channel Change Count' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }, {
      key: 'co-channel-interference',
      label: defineMessage({ defaultMessage: 'Co-channel Interference' }),
      tooltipContent: defineMessage({ defaultMessage: 'Interference of 0-20% is minimal, 20-50% is mild and 50-100% is severe.' }),
      format: formatter('percentFormat'),
      deltaSign: '-'
    }]
  },
  'c-bgscan6g-timer': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Background scan timer on 6 GHz radio' }),
    priority: priorities.low,
    valueFormatter: formatter('durationFormat'),
    valueText: defineMessage({ defaultMessage: 'Background Scan Timer (6 GHz radio)' }),
    actionText: defineMessage({ defaultMessage: '6 GHz radio setting for {scope} has "Background Scan Timer" set as {currentValue}.  Recommended setting for "Background Scan Timer" is {recommendedValue} to effectively use "Background Scan" feature.' }),
    reasonText: defineMessage({ defaultMessage: 'An optimized scan timer for background feature enables RUCKUS APs to scan the channels for an appropriate time interval. Time interval that is too long would result in longer time for radio channel selection.' }),
    tradeoffText: defineMessage({ defaultMessage: 'Though {recommendedValue} is an optimized timer value to scan the radio channels, it may not be needed for Wi-Fi network which is less volatile and has been stabilized over a period of time. However there is no significant overhead or trade-off if the value is kept at {recommendedValue}.' }),
    kpis: [{
      key: 'avg-ap-channel-change-count',
      label: defineMessage({ defaultMessage: 'Average AP Channel Change Count' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }, {
      key: 'max-ap-channel-change-count',
      label: defineMessage({ defaultMessage: 'Max AP Channel Change Count' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }, {
      key: 'co-channel-interference',
      label: defineMessage({ defaultMessage: 'Co-channel Interference' }),
      tooltipContent: defineMessage({ defaultMessage: 'Interference of 0-20% is minimal, 20-50% is mild and 50-100% is severe.' }),
      format: formatter('percentFormat'),
      deltaSign: '-'
    }]
  },
  'c-dfschannels-enable': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Enable DFS channels' }),
    priority: priorities.medium,
    valueFormatter: formatter('enabledFormat'),
    valueText: defineMessage({ defaultMessage: 'DFS Channels' }),
    actionText: defineMessage({ defaultMessage: '{scope} does not have DFS channels enabled, it is recommended to enable DFS Channels for radio 5 GHz.' }),
    reasonText: defineMessage({ defaultMessage: 'Enabling DFS channels will give better channel availability to the AP and enable AP to pick the best available channel. This shall help in reducing co-channel interference and help in improving user experience and throughput for 5 GHz Wi-Fi connections.' }),
    tradeoffText: defineMessage({ defaultMessage: 'DFS channels share the spectrum with weather radar and other radar systems. RUCKUS APs have the capability to detect if there is a conflict and automatically move away from the channel if there is a conflict. This move may not be observable to most Wi-Fi end users. However, for users engaged in a live audio/video call or other real-time and low-latency applications, this move may cause temporary disruptions.' }),
    kpis: [{
      key: 'co-channel-interference',
      label: defineMessage({ defaultMessage: 'Co-channel Interference' }),
      tooltipContent: defineMessage({ defaultMessage: 'Interference of 0-20% is minimal, 20-50% is mild and 50-100% is severe.' }),
      format: formatter('percentFormat'),
      deltaSign: '-'
    }]
  },
  'c-dfschannels-disable': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Disable DFS channels' }),
    priority: priorities.low,
    valueFormatter: formatter('enabledFormat'),
    valueText: defineMessage({ defaultMessage: 'DFS Channels' }),
    actionText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'There is a significant high detection of DFS Radar signals in the {scope}, it is recommended to disable DFS Channels on this Zone.' })
      : defineMessage({ defaultMessage: 'There is a significant high detection of DFS Radar signals in the {scope}, it is recommended to disable DFS Channels on this Venue.' }),
    reasonText: defineMessage({ defaultMessage: 'If AP is placed in an area where there are genuine and consistent DFS Radar signals, then the AP need not try to operate on the DFS channel.' }),
    tradeoffText: defineMessage({ defaultMessage: 'Disabling DFS Channels will reduce number of available channels for the AP. In a deployment, if there are less available channels and more APs, AP may pick overlapping channels and may cause channel interference and hence inferior user experience.' }),
    kpis: [{
      key: 'avg-dfs-event-count',
      label: defineMessage({ defaultMessage: 'Average DFS Events' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }, {
      key: 'max-dfs-event-count',
      label: defineMessage({ defaultMessage: 'Max DFS Events' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }]
  },
  'c-bandbalancing-enable': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Enable band balancing' }),
    priority: priorities.low,
    ...bandbalancingEnable
  },
  'c-bandbalancing-enable-below-61': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Enable band balancing' }),
    priority: priorities.low,
    ...bandbalancingEnable
  },
  'c-bandbalancing-proactive': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Change band balancing mode' }),
    priority: priorities.low,
    valueFormatter: formatter('noFormat'),
    valueText: defineMessage({ defaultMessage: 'Load Balancing: Steering Mode' }),
    actionText: defineMessage({ defaultMessage: 'Steering mode for {scope} is set as {currentValue}. It is recommended to change the mode to PROACTIVE.' }),
    reasonText: defineMessage({ defaultMessage: 'Band Balancing (BB) feature intelligently distributes the WLAN clients on the 2.4 GHz and the 5 GHz channels in order to balance the client load. Mode "PROACTIVE" shall have higher efficiency in steering clients from one band to another and hence shall result in improve load on the AP resulting in better WiFi experience to the user.' }),
    tradeoffText: defineMessage({ defaultMessage: 'This feature requires Wi-Fi clients to have BTM capability. If there are legacy Wi-Fi clients with incorrect BTM implementation, such clients may have intermittent issues when connecting to Wi-Fi.' }),
    kpis: [{
      key: 'client-ratio',
      label: defineMessage({ defaultMessage: 'Percentage of Clients on 2.4 GHz' }),
      format: formatter('percentFormat'),
      deltaSign: '-'
    }]
  },
  'c-aclb-enable': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Enable load balancing based on client count' }),
    priority: priorities.low,
    valueFormatter: formatter('enabledFormat'),
    valueText: defineMessage({ defaultMessage: 'Client Load Balancing' }),
    actionText: defineMessage({ defaultMessage: 'Client Load Balancing for this {scope} is disabled. For proper distribution of Clients across APs, it is recommended to enable Client Load Balancing with default method as "Based on Client Count". Note that for Smartzones 6.0 and below Client Load Balancing will be enabled on 5 GHz only.' }),
    reasonText: defineMessage({ defaultMessage: 'Client Load Balancing allows equal distribution of clients by allowing heavily loaded APs to move clients to less loaded neighboring APs, This shall result in better radio utilization resulting in better Wi-Fi experience to the user.' }),
    tradeoffText: defineMessage({ defaultMessage: 'Client may not have implemented BTM properly, leading to connectivity issues.' }),
    kpis: [{
      key: 'avg-ap-unique-client-count',
      label: defineMessage({ defaultMessage: 'Average AP Unique Clients' }),
      format: formatter('countFormat'),
      deltaSign: 'none'
    }, {
      key: 'max-ap-unique-client-count',
      label: defineMessage({ defaultMessage: 'Max AP Unique Clients' }),
      format: formatter('countFormat'),
      deltaSign: 'none'
    }]
  },
  'i-zonefirmware-upgrade': {
    category: categories.Infrastructure,
    summary: defineMessage({ defaultMessage: 'Zone firmware upgrade' }),
    priority: priorities.medium,
    valueFormatter: formatter('noFormat'),
    valueText: defineMessage({ defaultMessage: 'AP Firmware Version' }),
    recommendedValueTooltipContent: (
      status: StateType,
      currentValue: ConfigurationValue,
      recommendedValue: string
    ) =>
      (![
        'applied',
        'afterapplyinterrupted',
        'applywarning',
        'revertscheduled',
        'revertscheduleinprogress',
        'revertfailed'
      ].includes(status) &&
        currentValue &&
        compareVersion(currentValue as string, recommendedValue) > -1)
        ? defineMessage({ defaultMessage: 'Zone was upgraded manually to recommended AP firmware version. Manually check whether this recommendation is still valid.' })
        : defineMessage({ defaultMessage: 'Latest available AP firmware version will be used when this recommendation is applied.' }),
    actionText: defineMessage({ defaultMessage: '{scope} is running with older AP firmware version {currentValue}. It is recommended to upgrade zone to the latest available AP firmware version.' }),
    reasonText: defineMessage({ defaultMessage: 'Latest AP firmware version in the zone will ensure all the APs in zone have the best available firmware with appropriate security/bug fixes and new features.' }),
    tradeoffText: defineMessage({ defaultMessage: 'Changing AP firmware version for a zone will cause all APs to reboot and there would be a some network downtime, hence it is recommended to take this action during off peak hours.{br}{br}If the zone has older AP models which does not support the the new AP firmware version, then upgrading the zone firmware will make those older APs unusable. Such older APs must be replaced with newer APs to ensure the right security fixes are available in the AP firmware.' }),
    kpis: [{
      key: 'aps-on-latest-fw-version',
      label: defineMessage({ defaultMessage: 'APs on Latest Firmware Version' }),
      valueAccessor: ([x, y]: number[]) => x / y,
      valueFormatter: formatter('percentFormat'),
      deltaSign: '+',
      format: formatter('ratioFormat'),
      tooltipContent: defineMessage({ defaultMessage: 'Numbers could be delayed by up to 1 hour.' }),
      showAps: true
    }]
  },
  'c-txpower-same': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Tx Power setting for 2.4 GHz and 5 GHz/6 GHz radio' }),
    priority: priorities.medium,
    valueFormatter: formatter('txFormat'),
    valueText: defineMessage({ defaultMessage: '2.4 GHz TX Power Adjustment' }),
    actionText: defineMessage({ defaultMessage: '{scope} is configured with the same transmit power on 2.4 GHz and 5 GHz/6 GHz. Reducing the transmit power on 2.4 GHz will reduce co-channel interference and encourage clients to use 5 GHz/6 GHz.' }),
    reasonText: defineMessage({ defaultMessage: 'Encourages client association to 5 GHz/6 GHz and reduces co-channel interference.' }),
    tradeoffText: defineMessage({ defaultMessage: '2.4 GHz clients at the edge of Wi-Fi coverage may receive poor signal or lose connectivity.' }),
    kpis: [
      {
        key: 'co-channel-interference',
        label: defineMessage({ defaultMessage: 'Co-channel Interference' }),
        tooltipContent: defineMessage({ defaultMessage: 'Interference of 0-20% is minimal, 20-50% is mild and 50-100% is severe.{br}This value is calculated for all radios.' }),
        format: formatter('percentFormat'),
        deltaSign: '-'
      },
      {
        key: 'session-time-on-24GHz',
        label: defineMessage({ defaultMessage: 'Session time on 2.4 GHz' }),
        format: formatter('percentFormat'),
        deltaSign: '-'
      }]
  },
  'c-crrm-channel24g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 2.4 GHz radio' }),
    partialOptimizedSummary: defineMessage({ defaultMessage: 'Optimal channel plan found for 2.4 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
    actionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 2.4 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.' }),
    partialOptimizedActionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 2.4 GHz band due to suboptimal channel planning. The channel plan can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.' }),
    reasonText: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    appliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    partialOptimizationAppliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.' }),
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }]
  },
  'c-crrm-channel5g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 5 GHz radio' }),
    partialOptimizedSummary: defineMessage({ defaultMessage: 'Optimal channel plan found for 5 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
    actionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 5 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.' }),
    partialOptimizedActionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 5 GHz band due to suboptimal channel planning. The channel plan can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.' }),
    reasonText: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    appliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    partialOptimizationAppliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' }),
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }]
  },
  'c-crrm-channel6g-auto': {
    category: categories['AI-Driven Cloud RRM'],
    summary: defineMessage({ defaultMessage: 'Optimal Ch/Width and Tx Power found for 6 GHz radio' }),
    partialOptimizedSummary: defineMessage({ defaultMessage: 'Optimal channel plan found for 6 GHz radio' }),
    priority: priorities.high,
    valueFormatter: crrmText,
    valueText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
    actionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 6 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.' }),
    partialOptimizedActionText: defineMessage({ defaultMessage: '{scope} is experiencing high co-channel interference in 6 GHz band due to suboptimal channel planning. The channel plan can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience.' }),
    reasonText: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    appliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    partialOptimizationAppliedReasonText: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    tradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten.' }),
    partialOptimizedTradeoffText: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
      : defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.' }),
    kpis: [{
      key: 'number-of-interfering-links',
      label: defineMessage({ defaultMessage: 'Number of Interfering Links' }),
      format: formatter('countFormat'),
      deltaSign: '-'
    }]
  },
  'unqualifiedZone': {
    category: crrmStates[CRRMStates.unqualifiedZone].label,
    summary: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'No RRM recommendation as zone is unqualified' })
      : defineMessage({ defaultMessage: 'No RRM recommendation as venue is unqualified' }),
    priority: priorities.low
  },
  'noAps': {
    category: crrmStates[CRRMStates.noAps].label,
    summary: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'No RRM recommendation as zone has no APs' })
      : defineMessage({ defaultMessage: 'No RRM recommendation as venue has no APs' }),
    priority: priorities.low
  },
  'insufficientLicenses': {
    category: crrmStates[CRRMStates.insufficientLicenses].label,
    summary: defineMessage({ defaultMessage: 'No RRM recommendation due to incomplete license compliance' }),
    priority: priorities.low
  },
  'verificationError': {
    category: crrmStates[CRRMStates.verificationError].label,
    summary: defineMessage({ defaultMessage: 'No RRM recommendation due to verification error' }),
    priority: priorities.low
  },
  'verified': {
    category: crrmStates[CRRMStates.verified].label,
    summary: defineMessage({ defaultMessage: 'AI verified and in optimal state' }),
    priority: priorities.low
  },
  'unknown': {
    category: crrmStates[CRRMStates.unknown].label,
    summary: defineMessage({ defaultMessage: 'Unknown' }),
    priority: priorities.low
  },
  'c-probeflex-24g': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Enable AirFlexAI for 2.4 GHz' }),
    priority: priorities.medium,
    ...probeflexConfig
  },
  'c-probeflex-5g': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Enable AirFlexAI for 5 GHz' }),
    priority: priorities.medium,
    ...probeflexConfig
  },
  'c-probeflex-6g': {
    category: categories['Wi-Fi Client Experience'],
    summary: defineMessage({ defaultMessage: 'Enable AirFlexAI for 6 GHz' }),
    priority: priorities.medium,
    ...probeflexConfig
  }
} as unknown as Record<string, RecommendationConfig & CodeInfo>

export const statusTrailMsgs = Object.entries(states).reduce((acc, [key, val]) => {
  acc[key as StateType] = val.text
  return acc
}, {} as Record<StateType, MessageDescriptor>)

export const filterKpisByStatus = (kpis: RecommendationKPIConfig[], status: StateType) => {
  return kpis.filter(kpi => typeof kpi.onlyForStatuses === 'undefined'
    || kpi.onlyForStatuses.includes(status))
}
