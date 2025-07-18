import { NetworkPath } from '@acx-ui/utils'

export interface Mdu360TabProps {
  startDate: string
  endDate: string
}
export interface Mdu360Filter {
  path: NetworkPath
  start: string
  end: string
}

export enum SLAKeys {
  connectionSuccessSLA = 'connectionSuccessSLA',
  clientThroughputSLA = 'clientThroughputSLA',
  timeToConnectSLA = 'timeToConnectSLA',
  channelWidthSLA = 'channelWidthSLA',
  channelChangeExperienceSLA = 'channelChangePerDaySLA',
}