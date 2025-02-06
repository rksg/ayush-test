import { EdgeNokiaCageTable } from '@acx-ui/edge/components'
import { EdgeNokiaOltData }   from '@acx-ui/rc/utils'

export const CagesTab = ({ oltData }: { oltData: EdgeNokiaOltData }) => {
  return <EdgeNokiaCageTable
    oltData={oltData}
  />
}