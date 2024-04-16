import { Loader, SuspenseBoundary } from '@acx-ui/components'

import { states }          from '../Recommendations/config'
import { useCrrmKpiQuery } from '../Recommendations/services'

const { DefaultFallback: Spinner } = SuspenseBoundary

type CrrmKpiType = { id: string, code: string, status: keyof typeof states }

const CrrmKpi: React.FC<CrrmKpiType> = ({ id, code, status }) => {
  const detailsQuery = useCrrmKpiQuery({
    id,
    code,
    status
  })

  return <Loader
    states={[detailsQuery]}
    style={{ height: 14 }}
    fallback={<Spinner size='small' />}
  >
    <div>
      {detailsQuery.data?.text}
    </div>
  </Loader>
}

export default CrrmKpi
