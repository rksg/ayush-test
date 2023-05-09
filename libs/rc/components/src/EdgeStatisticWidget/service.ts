import type { TimeStamp } from '@acx-ui/types'

export type EdgeStatusTimeSeries = {
  time: string[];
  isEdgeUp: number[];
}

export type EdgeStatus = {
  timeSeries: EdgeStatusTimeSeries;
  totalDowntime: number;
  totalUptime: number;
}

export type MultiBarTimeSeriesChartData = {
    color: string;
    key: string;
    name: string;
    show?: boolean;
    data: [TimeStamp, string, TimeStamp, number | null, string][];
}[]