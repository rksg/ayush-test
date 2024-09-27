/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMappings = {
  diagram_legend_ap_se: defineMessage({ defaultMessage: 'Traffic tunneled to RUCKUS Edge from APs' }),
  diagram_legend_physical: defineMessage({ defaultMessage: 'Physical connection path' }),
  diagram_legend_se_dmz: defineMessage({ defaultMessage: 'Guest WLAN traffic tunneled to RUCKUS Edge in DMZ' }),
  setting_cluster_tooltip: defineMessage({ defaultMessage: 'Select the cluster that all traffic will be tunneled to in the selected <venueSingular></venueSingular>. Make sure RUCKUS Edges have already set the core port' }),
  setting_cluster_helper: defineMessage({ defaultMessage: 'To use the SD-LAN service, each RUCKUS Edge within the selected cluster must set up a Core port or Core LAG. {infoLink}' }),
  setting_dmz_cluster_tooltip: defineMessage({ defaultMessage: 'Select the cluster that the guest traffic will be destined on the DMZ' }),
  scope_network_table_description: defineMessage({ defaultMessage: 'Select the <venuePlural></venuePlural> and networks where the SD-LAN Service will be applied:' }),
  scope_dmz_tunnel_tooltip: defineMessage({ defaultMessage: 'The tunnel between clusters only supports manual Gateway Path MTU.' }),
  drawer_table_description: defineMessage({ defaultMessage: 'Enable the networks that will tunnel the traffic to the selected cluster:' }),
  drawer_table_help: defineMessage({ defaultMessage: '<b>* Note:</b> Enabling "Tunnel Guest Traffic to DMZ" for any network with a specific VLAN ID will apply this behavior to all networks within the same VLAN in the same SD-LAN service.' })
}
