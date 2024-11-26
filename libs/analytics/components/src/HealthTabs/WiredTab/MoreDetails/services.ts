import { gql } from 'graphql-request'

import { getSelectedNodePath } from '@acx-ui/analytics/utils'
import { dataApi }             from '@acx-ui/store'

import { ImpactedClientsResult, PieChartResult, RequestPayload, WidgetType } from './config'

export const fieldsMap: Record<WidgetType, string> = {
  cpuUsage: 'cpuUtilization',
  dhcpFailure: 'dhcpFailureCount',
  congestion: 'congestedPortCount',
  portStorm: 'stormPortCount'
}

export const topNQueryMapping: Record<WidgetType, string> = {
  dhcpFailure: 'topNSwitchesByDhcpFailure',
  congestion: 'topNSwitchesByPortCongestion',
  portStorm: 'topNSwitchesByStormPortCount',
  cpuUsage: 'topNSwitchesByCpuUsage'
}

export const wiredDevicesQueryMapping: Record<WidgetType, string> = {
  congestion: 'wiredDevicesExpCongestion',
  portStorm: 'wiredDevicesExpStorm',
  dhcpFailure: '',
  cpuUsage: ''
}

export const wiredDevicesMetricMapping: Record<WidgetType, string> = {
  congestion: 'outUtilization',
  portStorm: 'rxMltCount',
  dhcpFailure: '',
  cpuUsage: ''
}

export const generateQuery = (type: WidgetType, detailed: boolean = false) => {
  const field = fieldsMap[type as keyof typeof fieldsMap]
  if (!field) return ''

  const baseFields = `mac name ${field}`
  const detailedFields = `${field} mac name serial model status firmware numOfPorts`
  const queryName = topNQueryMapping[type as keyof typeof topNQueryMapping]

  return `${queryName}(n: $n) { ${detailed ? detailedFields : baseFields} }`
}

export const moreDetailsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    pieChartData: build.query<PieChartResult, RequestPayload>({
      query: payload => {
        const innerQuery = generateQuery(payload.type)
        return ({
          document: gql`
          query Network(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $filter: FilterInput,
            $n: Int,
            $enableSwitchFirmwareFilter: Boolean
          ) {
            network(start: $start, end: $end, filter: $filter,
              enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter
            ) {
              hierarchyNode(path: $path) {
                ${innerQuery}
              }
            }
          }`,
          variables: {
            ...payload,
            path: getSelectedNodePath(payload.filter),
            enableSwitchFirmwareFilter: true
          }
        })
      },
      transformResponse: (response: {
        network: { hierarchyNode: PieChartResult } }) => response.network.hierarchyNode
    }),
    impactedSwitchesData: build.query<PieChartResult, RequestPayload>({
      query: payload => {
        const innerQuery = generateQuery(payload.type, true)
        return ({
          document: gql`
          query Network(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $filter: FilterInput,
            $n: Int,
            $enableSwitchFirmwareFilter: Boolean
          ) {
            network(start: $start, end: $end, filter: $filter,
              enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter
            ) {
              hierarchyNode(path: $path) {
                ${innerQuery}
              }
            }
          }`,
          variables: {
            ...payload,
            path: getSelectedNodePath(payload.filter),
            enableSwitchFirmwareFilter: true
          }
        })
      },
      transformResponse: (response: {
        network: { hierarchyNode: PieChartResult } }) => response.network.hierarchyNode
    }),
    impactedClientsData: build.query<ImpactedClientsResult, RequestPayload>({
      query: payload => {
        const { type, isMlisaVersion4110 } = payload
        const queryName = wiredDevicesQueryMapping[type]

        return ({
          document: gql`
          query SwitchClients(
            $path: [HierarchyNodeInput]
            $end: DateTime
            $start: DateTime
            $filter: FilterInput
            $metric: String
            $switchIds: [String]
            $enableSwitchFirmwareFilter: Boolean
          ) {
            network(
              end: $end
              start: $start
              filter: $filter
              enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter
            ) {
              hierarchyNode(path: $path) {
                ${queryName}(metric: $metric, switchIds: $switchIds) {
                  switchName
                  switchId
                  ${isMlisaVersion4110 ? 'switchSerial' : ''}
                  deviceName
                  deviceMac
                  devicePort
                  devicePortMac
                  devicePortType
                  isRuckusAp
                  localPortName
                  metricValue
                  metricName
                }
              }
            }
          }`,
          variables: {
            ...payload,
            path: getSelectedNodePath(payload.filter),
            metric: wiredDevicesMetricMapping[payload.type]
          }
        })
      },
      transformResponse: (response: {
        network: { hierarchyNode: ImpactedClientsResult } }) => response.network.hierarchyNode
    })
  })
})

export const {
  usePieChartDataQuery,
  useImpactedSwitchesDataQuery,
  useImpactedClientsDataQuery
} = moreDetailsApi
