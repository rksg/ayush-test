import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, nodeTypes } from '@acx-ui/analytics/utils'
import { Loader, Card, NoActiveData } from '@acx-ui/components'
import { NodeType }                   from '@acx-ui/utils'

import { Recommendation, useRecommendationListQuery } from '../../services'
import * as UI                        from '../styledComponents'
import { useRecommendationDetailsQuery } from '../../RecommendationDetails/services'

export { AIDrivenRRMWidget as AIDrivenRRM }

type AIDrivenRRMProps = {
  filters: AnalyticsFilter
}

const checkOptimized = (recommendation: Recommendation[]) => {
  const optimizedStates = 'applyscheduled' || 'applyscheduleinprogress' || 'applied'
  return recommendation?.filter(detail => detail.statusEnum.includes(optimizedStates))
}

// const getRecommendationDetails = (recommendation: any) => {
//   const test = recommendation?.map((details: any)=> {
//     const { id } = details
//     const codeQuery = useRecommendationDetailsQuery({ id }, { skip: !Boolean(id) })
//     console.log('codeQuery', codeQuery)
//   })
// }

function AIDrivenRRMWidget ({
  filters
}: AIDrivenRRMProps) {
  const intl = useIntl()
  const queryResults = useRecommendationListQuery(filters)
  const data = queryResults?.data?.filter((row) =>
    (true === row.code.includes('crrm'))
  )
  console.log('aidrivenrrm data', data)
  const { $t } = intl
  const title = $t({ defaultMessage: 'AI-Driven RRM' })
  const total = data?.length
  const optimized = checkOptimized(data as Recommendation[])?.length

  // eslint-disable-next-line max-len
  const subTitle = $t({ defaultMessage: 'AI-Driven RRM has been run on {total} {total, plural, one {zone} other {zones}} and already {optimized}/{total} have been optimized' }, { total, optimized })
  const noData = total === 0

  const items = data?.slice(0,5).map(props => {
    const { sliceType, sliceValue, id, status } = props
    // const codeQuery = useRecommendationDetailsQuery({ id }, { skip: !Boolean(id) })
    // const detailsQuery = useRecommendationDetailsQuery(
    //   { ...(codeQuery.data!) },
    //   { skip: !Boolean(codeQuery.data?.code) })
    // const details = detailsQuery.data!

    // const applied = details.appliedOnce && status !== 'reverted'
    // const before = applied
    //   ? details.kpi_number_of_interfering_links?.previous
    //   : details.kpi_number_of_interfering_links?.current
    // const after = applied
    //   ? details.kpi_number_of_interfering_links?.current
    //   : details.kpi_number_of_interfering_links?.projected || 0

    const type = nodeTypes(sliceType as NodeType)
    const text = `${type}(${sliceValue})`
    const optimized = checkOptimized([props])?.length !== 0 ? true : false
    const before = 1 // need to get correct value
    const after = 0 // need to get correct value
    const optimizedText = $t({
      defaultMessage:
        'From {before} to {after} interfering {after, plural, one {link} other {links}}',
      description: 'Translation string - From, to, interfering, link, links'
    }, { before, after })
    const nonOptimizedText = $t({
      defaultMessage:
        '{before} interfering {before, plural, one {link} other {links}} can be optimised to {after}',
      description: 'Translation string - interfering, link, links, can be optimised to'
    }, { before, after })
    return <UI.Detail key={id}>
      <div style={{ display: 'flex' }}>
        <UI.OptimizedIcon value={optimized ? 0 : 1}/>
        <span>{text}</span>
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
