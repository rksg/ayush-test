import { OltCageTable } from '@acx-ui/olt/components'
import { Olt, OltCage } from '@acx-ui/olt/utils'

export const OltOLineCardTab = ({ oltDetails, oltCages, isLoading, isFetching }:
  {
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
