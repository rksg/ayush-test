import { Loader, SuspenseBoundary } from '@acx-ui/components'

import { useCrrmKpiQuery } from '../Recommendations/services'

const { DefaultFallback: Spinner } = SuspenseBoundary

const CrrmKpi: React.FC<{ id: string, code: string }> = ({ id, code }) => {
  const detailsQuery = useCrrmKpiQuery({ id, code })

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
