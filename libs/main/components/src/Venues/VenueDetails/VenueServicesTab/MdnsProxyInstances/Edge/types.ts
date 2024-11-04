import { NewMdnsProxyForwardingRule } from '@acx-ui/rc/utils'

export interface EdgeMdnsProxyInstance {
  edgeClusterId?: string;
  edgeClusterName?: string;
  serviceId?: string;
  serviceName?: string;
  forwardingRules?: NewMdnsProxyForwardingRule[]
}