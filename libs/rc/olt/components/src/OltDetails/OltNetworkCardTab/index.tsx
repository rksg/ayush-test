import { Olt, OltPort } from '@acx-ui/olt/utils'

import { OltPortTable } from '../OltPortTable'

export const OltNetworkCardTab = ({ oltDetails, oltPorts, isLoading, isFetching }: {
  oltDetails: Olt,
  oltPorts?: OltPort[],
  isLoading: boolean,
  isFetching: boolean
}) => {
  return <OltPortTable
    oltDetails={oltDetails}
    oltPorts={oltPorts}
    isLoading={isLoading}
    isFetching={isFetching}
  />
}
