import { EdgeFirewallSetting } from '@acx-ui/rc/utils'

export interface FirewallFormEdge {
  serialNumber: string;
  name: string;
}
export interface FirewallForm extends EdgeFirewallSetting {
  selectedEdges: FirewallFormEdge[]
}
