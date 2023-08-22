import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, nodeTypes } from '@acx-ui/analytics/utils'
import { Loader, Card, NoActiveData } from '@acx-ui/components'
import { TenantLink }                 from '@acx-ui/react-router-dom'
import { NodeType }                   from '@acx-ui/utils'

import { EnhancedRecommendation, useRecommendationDetailsQuery } from '../../RecommendationDetails/services'
import { useRecommendationListQuery }                            from '../../services'
import * as UI                                                   from '../styledComponents'

export { AIDrivenRRMWidget as AIDrivenRRM }

type AIDrivenRRMProps = {
  filters: AnalyticsFilter
}

const checkOptimized = (recommendation: EnhancedRecommendation[]) => {
  const optimizedStates = ['applied', 'applyscheduleinprogress', 'applied']
  return recommendation?.filter(detail => optimizedStates.includes(detail.status))
}

function AIDrivenRRMWidget ({
  filters
}: AIDrivenRRMProps) {
  const intl = useIntl()
  const queryResults = useRecommendationListQuery(filters)
  const crrmData = queryResults?.data?.filter((row) =>
    (true === row.code.includes('crrm'))
  )
  const { $t } = intl
  const title = $t({ defaultMessage: 'AI-Driven RRM' })
  const total = crrmData?.length
  const noData = total === 0
  const data = crrmData?.slice(0,5).map(data => {
    return { id: data.id }
  })

  const codeQuery = useRecommendationDetailsQuery(data!)
  const detailsQuery = useRecommendationDetailsQuery(
    codeQuery.data?.filter(i => i.code) as EnhancedRecommendation[],
    { skip: codeQuery.data?.filter(i => i.code).length === 0 })
  const detailedRecommendation = detailsQuery.data
  const optimized = checkOptimized(detailedRecommendation as EnhancedRecommendation[])?.length
  // eslint-disable-next-line max-len
  const subTitle = $t({ defaultMessage: 'AI-Driven RRM has been run on {total} {total, plural, one {zone} other {zones}} and already {optimized}/{total} have been optimized' }, { total, optimized })

  const items = detailedRecommendation?.slice(0,5).map(props => {
    const {
      sliceType, sliceValue, id, status,
      kpi_number_of_interfering_links, appliedOnce
    } = props
    const type = nodeTypes(sliceType as NodeType)
    const text = `${type}(${sliceValue})`

    const optimized = checkOptimized([props])?.length !== 0 ? true : false
    const applied = appliedOnce && status !== 'reverted'
    const before = (applied
      ? kpi_number_of_interfering_links?.previous
      : kpi_number_of_interfering_links?.current) || 0
    const after = (applied
      ? kpi_number_of_interfering_links?.current
      : kpi_number_of_interfering_links?.projected) || 0

    const optimizedText = $t({
      defaultMessage:
        'From {before} to {after} interfering {after, plural, one {link} other {links}}',
      description: 'Translation string - From, to, interfering, link, links'
    }, { before, after })

    const nonOptimizedText = $t({
      defaultMessage:
      // eslint-disable-next-line max-len
        '{before} interfering {before, plural, one {link} other {links}} can be optimised to {after}',
      description: 'Translation string - interfering, link, links, can be optimised to'
    }, { before, after })

    return <UI.Detail key={id}>
      <div style={{ display: 'flex' }}>
        <UI.OptimizedIcon value={optimized ? 0 : 1}/>
        <TenantLink
          to={`/recommendations/aiOps/${id}`}
          style={{ textDecoration: 'none', color: 'var(--acx-primary-black)' }}
        >
          <span>{text}</span>
        </TenantLink>
      </div>
      <UI.Subtitle>{optimized ? optimizedText : nonOptimizedText}</UI.Subtitle>
    </UI.Detail>
  })

  return <Loader states={[queryResults]}>
    <Card title={title} subTitle={subTitle}>
      <AutoSizer>
        {({ width }) => (
          noData
            ? <NoActiveData text={$t({ defaultMessage: 'No recommendations' })} />
            : <UI.Wrapper
              style={{ width, marginBlock: 20 }}
              children={items}
            />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}

export default AIDrivenRRMWidget
