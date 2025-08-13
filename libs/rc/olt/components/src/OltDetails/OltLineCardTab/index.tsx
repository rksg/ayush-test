import { Olt, OltCage } from '@acx-ui/olt/utils'

import { OltCageTable } from '../OltCageTable'

export const OltLineCardTab = ({ oltDetails, oltCages, isLoading, isFetching }: {
  oltDetails: Olt,
  oltCages?: OltCage[],
  isLoading: boolean,
  isFetching: boolean
}) => {
  return <OltCageTable
    oltDetails={oltDetails}
    oltCages={oltCages}
    isLoading={isLoading}
    isFetching={isFetching}
  />
}
