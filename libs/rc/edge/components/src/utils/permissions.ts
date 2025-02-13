import { EdgeDhcpUrls, EdgeHqosProfilesUrls, EdgeMdnsProxyUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { getOpsApi }                                                           from '@acx-ui/utils'

export const EdgePermissions = {
  addEdgeNode: [
    [
      getOpsApi(EdgeUrlsInfo.addEdge),
      getOpsApi(EdgeUrlsInfo.addEdgeCluster)
    ]
  ],
  editEdgeNode: [
    getOpsApi(EdgeUrlsInfo.updateEdge),
    getOpsApi(EdgeUrlsInfo.updatePortConfig),
    getOpsApi(EdgeUrlsInfo.addEdgeLag),
    getOpsApi(EdgeUrlsInfo.updateEdgeLag),
    getOpsApi(EdgeUrlsInfo.deleteEdgeLag),
    getOpsApi(EdgeUrlsInfo.addSubInterfaces),
    getOpsApi(EdgeUrlsInfo.updateSubInterfaces),
    getOpsApi(EdgeUrlsInfo.deleteSubInterfaces),
    getOpsApi(EdgeUrlsInfo.importSubInterfacesCSV),
    getOpsApi(EdgeUrlsInfo.addLagSubInterfaces),
    getOpsApi(EdgeUrlsInfo.updateLagSubInterfaces),
    getOpsApi(EdgeUrlsInfo.deleteLagSubInterfaces),
    getOpsApi(EdgeUrlsInfo.importLagSubInterfacesCSV),
    getOpsApi(EdgeUrlsInfo.updateDnsServers),
    getOpsApi(EdgeUrlsInfo.updateStaticRoutes)
  ],
  editEdgeCluster: [
    getOpsApi(EdgeUrlsInfo.updateEdge),
    getOpsApi(EdgeUrlsInfo.updatePortConfig),
    getOpsApi(EdgeUrlsInfo.addEdgeLag),
    getOpsApi(EdgeUrlsInfo.updateEdgeLag),
    getOpsApi(EdgeUrlsInfo.deleteEdgeLag),
    getOpsApi(EdgeUrlsInfo.addSubInterfaces),
    getOpsApi(EdgeUrlsInfo.updateSubInterfaces),
    getOpsApi(EdgeUrlsInfo.deleteSubInterfaces),
    getOpsApi(EdgeUrlsInfo.importSubInterfacesCSV),
    getOpsApi(EdgeUrlsInfo.addLagSubInterfaces),
    getOpsApi(EdgeUrlsInfo.updateLagSubInterfaces),
    getOpsApi(EdgeUrlsInfo.deleteLagSubInterfaces),
    getOpsApi(EdgeUrlsInfo.importLagSubInterfacesCSV),
    getOpsApi(EdgeUrlsInfo.updateDnsServers),
    getOpsApi(EdgeUrlsInfo.updateStaticRoutes),
    getOpsApi(EdgeUrlsInfo.patchEdgeCluster),
    getOpsApi(EdgeUrlsInfo.patchEdgeClusterNetworkSettings),
    getOpsApi(EdgeUrlsInfo.patchEdgeClusterSubInterfaceSettings),
    getOpsApi(EdgeUrlsInfo.updatePortConfig)
  ],
  editEdgeClusterConfigWizard: [
    getOpsApi(EdgeUrlsInfo.patchEdgeClusterNetworkSettings),
    getOpsApi(EdgeUrlsInfo.patchEdgeClusterSubInterfaceSettings),
    getOpsApi(EdgeUrlsInfo.updatePortConfig)
  ],
  editEdgeClusterNetworkControl: [
    getOpsApi(EdgeDhcpUrls.activateDhcpService),
    getOpsApi(EdgeDhcpUrls.deactivateDhcpService),
    getOpsApi(EdgeHqosProfilesUrls.activateEdgeCluster),
    getOpsApi(EdgeHqosProfilesUrls.deactivateEdgeCluster),
    getOpsApi(EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster),
    getOpsApi(EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster),
    getOpsApi(EdgeUrlsInfo.updateEdgeClusterArpTerminationSettings)
  ],
  switchEdgeClusterDhcp: [
    [
      getOpsApi(EdgeDhcpUrls.activateDhcpService),
      getOpsApi(EdgeDhcpUrls.deactivateDhcpService)
    ]
  ],
  switchEdgeClusterHqos: [
    [
      getOpsApi(EdgeHqosProfilesUrls.activateEdgeCluster),
      getOpsApi(EdgeHqosProfilesUrls.deactivateEdgeCluster)
    ]
  ],
  switchEdgeClusterMdns: [
    [
      getOpsApi(EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster),
      getOpsApi(EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster)
    ]
  ]
}