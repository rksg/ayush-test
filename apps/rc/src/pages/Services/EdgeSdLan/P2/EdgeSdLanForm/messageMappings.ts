/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMappings = {
  diagram_legend_ap_se: defineMessage({ defaultMessage: 'Traffic tunneled to SmartEdge from APs' }),
  diagram_legend_physical: defineMessage({ defaultMessage: 'Physical connection path' }),
  diagram_legend_se_dmz: defineMessage({ defaultMessage: 'Guest WLAN traffic tunneled to SmartEdge in DMZ' }),
  setting_cluster_tooltip: defineMessage({ defaultMessage: 'Select the cluster that all traffic will be tunneled to in the selected <venueSingular></venueSingular>. Make sure SmartEdges have already set the core port' }),
  setting_cluster_helper: defineMessage({ defaultMessage: 'To use the SD-LAN service, each SmartEdge within the selected cluster must set up a Core port or LAG. {infoLink}' }),
  setting_dmz_cluster_tooltip: defineMessage({ defaultMessage: 'Select the cluster that the guest traffic will be destined on the DMZ' }),
  scope_network_table_description: defineMessage({ defaultMessage: 'Enable the networks that will tunnel the traffic to the selected cluster:' }),
  scope_dmz_tunnel_tooltip: defineMessage({ defaultMessage: 'The tunnel between clusters only supports manual Gateway Path MTU.' })
}
