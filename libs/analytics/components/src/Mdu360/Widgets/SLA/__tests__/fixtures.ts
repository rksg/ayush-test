import { SLAKeys }   from '../../../types'
import { slaConfig } from '../config'
import { SLAData }   from '../types'

export const mockMduThresholdQuery = {
  query: `query GetMDUThresholds($path: [HierarchyNodeInput], $mspEcIds: [String]) { 
    timeToConnectSLA: MDUThreshold(
      name: "timeToConnect",
      mspEcIds: $mspEcIds
    ) {
      value
      isSynced
    }
    clientThroughputSLA: MDUThreshold(
      name: "clientThroughput",
      mspEcIds: $mspEcIds
    ) {
      value
      isSynced
    }
    channelWidthSLA: MDUThreshold(
      name: "channelWidth",
      mspEcIds: $mspEcIds
    ) {
      value
      isSynced
    }
    channelChangePerDaySLA: MDUThreshold(
      name: "channelChangePerDay",
      mspEcIds: $mspEcIds
    ) {
      value
      isSynced
    }
  }`
}

export const mockQueryResponse: SLAData = {
  timeToConnectSLA: {
    value: 5,
    isSynced: true
  },
  clientThroughputSLA: {
    value: slaConfig[SLAKeys.clientThroughputSLA].defaultValue!,
    isSynced: true
  },
  channelWidthSLA: {
    value: 20,
    isSynced: true
  },
  channelChangePerDaySLA: {
    value: slaConfig[SLAKeys.channelChangeExperienceSLA].defaultValue!,
    isSynced: true
  }
}

export const mockUpdateSlaThresholdsQuery = {
  query: `mutation SaveMultipleThresholds(
    $mspEcIds: [String],
    $timeToConnectSLA: Float!,
    $clientThroughputSLA: Float!
  ) {
    timeToConnectSLA: MDUThreshold(
      name: "timeToConnect",
      value: $timeToConnectSLA,
      mspEcIds: $mspEcIds
    ) {
      success
    }
    clientThroughputSLA: MDUThreshold(
      name: "clientThroughput",
      value: $clientThroughputSLA,
      mspEcIds: $mspEcIds
    ) {
      success
    }
  }`
}
