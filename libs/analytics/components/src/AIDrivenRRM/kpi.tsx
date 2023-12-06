import { Loader, SuspenseBoundary } from '@acx-ui/components'

import { useRecommendationCodeQuery } from '../Recommendations/RecommendationDetails/services'
import { useCrrmKpiQuery }            from '../Recommendations/services'

const { DefaultFallback: Spinner } = SuspenseBoundary

export const CrrmKpi = (id: string) => {
  const codeQuery = useRecommendationCodeQuery({ id }, { skip: !Boolean(id) })
  const detailsQuery = useCrrmKpiQuery(
    codeQuery.data!,
    { skip: !Boolean(codeQuery.data?.code) }
  )
  return <Loader
    states={[codeQuery, detailsQuery]}
    style={{ height: 14 }}
    fallback={<Spinner size='small' />}
  >
    <div>
      {detailsQuery.data?.text}
    </div>
  </Loader>
}
