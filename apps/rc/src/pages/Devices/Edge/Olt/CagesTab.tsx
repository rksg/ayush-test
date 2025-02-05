import { EdgeNokiaCageTable } from '@acx-ui/edge/components'
import { EdgeNokiaOltData }   from '@acx-ui/rc/utils'

export const CagesTab = ({ oltData }: { oltData: EdgeNokiaOltData }) => {
  return (
    <div>
      <EdgeNokiaCageTable
        venueId={oltData.venueId}
        edgeClusterId={oltData.edgeClusterId}
        oltId={oltData.serialNumber}
      />
    </div>
  )
}