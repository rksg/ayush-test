import type { TimeStamp } from '@acx-ui/types'

export interface NodeStatusData {
  key: string;
  nodeId: string;
  nodeName: string;
  data: [TimeStamp, string, TimeStamp, number | null, string][];
}