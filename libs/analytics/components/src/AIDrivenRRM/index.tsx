import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }               from '@acx-ui/analytics/utils'
import { Loader, Card, NoData }          from '@acx-ui/components'
import { TenantLink, useNavigateToPath } from '@acx-ui/react-router-dom'

import { EnhancedRecommendation, useRecommendationDetailsQuery } from '../Recommendations/RecommendationDetails/services'
import { useRecommendationListQuery }                            from '../Recommendations/services'
import { getCrrmLinkText, getOptimized }                         from '../Recommendations/utils'

import * as UI from './styledComponents'

export { AIDrivenRRMWidget as AIDrivenRRM }

type AIDrivenRRMProps = {
  filters: AnalyticsFilter
}

function AIDrivenRRMWidget ({
  filters
}: AIDrivenRRMProps) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/analytics/recommendations/crrm')
  const queryResults = useRecommendationListQuery(filters)
  const crrmData = queryResults?.data?.filter((row) =>
    (true === row.code.includes('crrm'))
  )
  const title = $t({ defaultMessage: 'AI-Driven RRM' })
  const total = crrmData?.length
  const noData = total === 0
  const data = crrmData?.slice(0,5).map(data => {
    return { id: data.id }
  })

  const codeQuery = useRecommendationDetailsQuery(data!, { skip: data ? data.length === 0 : true })
  const detailsQuery = useRecommendationDetailsQuery(
    codeQuery.data?.filter(i => i.code) as EnhancedRecommendation[],
    { skip: codeQuery.data ? codeQuery.data?.filter(i => i.code).length === 0 : true })
  const detailedRecommendation = detailsQuery.data
  const totalOptimized = getOptimized(detailedRecommendation as EnhancedRecommendation[]).total|| 0
  // eslint-disable-next-line max-len
  const subTitle = $t({ defaultMessage: 'AI-Driven RRM has been run on {total} {total, plural, one {zone} other {zones}} and already {totalOptimized}/{total} have been optimized.' }, { total, totalOptimized })

  const items = detailedRecommendation?.map(recommendation => {
    const { sliceValue, id } = recommendation
    const optimized = getOptimized([recommendation]).isOptimized

    return <UI.Detail key={id}>
      <UI.FlexDiv>
        <UI.OptimizedIcon value={optimized ? 0 : 1}/>
        <TenantLink
          to={`/recommendations/crrm/${id}`}
          style={{ textDecoration: 'none', color: 'var(--acx-primary-black)' }}
        >
          <span>{sliceValue}</span>
        </TenantLink>
      </UI.FlexDiv>
      <UI.Subtitle>{getCrrmLinkText(recommendation, $t, optimized)}</UI.Subtitle>
    </UI.Detail>
  })

  return <Loader states={[queryResults, codeQuery, detailsQuery]}>
    <Card title={title} subTitle={noData ? '' : subTitle} onArrowClick={onArrowClick}>
      <AutoSizer>
        {({ width }) => (
          noData
            ? <NoData text={$t({ defaultMessage: 'No recommendations' })} />
            : <UI.Wrapper
              style={{ width }}
              children={items}
            />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}

export default AIDrivenRRMWidget
