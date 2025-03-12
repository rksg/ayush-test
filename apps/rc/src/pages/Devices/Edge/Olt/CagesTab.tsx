import { EdgeNokiaCageTable }                  from '@acx-ui/edge/components'
import { EdgeNokiaCageData, EdgeNokiaOltData } from '@acx-ui/rc/utils'

export const CagesTab = ({ oltData, cagesList,isLoading, isFetching }:
  {
    oltData: EdgeNokiaOltData,
    cagesList: EdgeNokiaCageData[] | undefined,
    isLoading: boolean,
    isFetching: boolean
  }) => {
  return <EdgeNokiaCageTable
    oltData={oltData}
    cagesList={cagesList}
    isLoading={isLoading}
    isFetching={isFetching}
  />
}