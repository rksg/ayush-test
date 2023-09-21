import { useIntl } from 'react-intl'

import { Loader, Card, Tooltip, NoData, ColorPill } from '@acx-ui/components'
import { DateFormatEnum, formatter, intlFormats }   from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }            from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }                     from '@acx-ui/utils'

import * as UI                                                from '../AIDrivenRRM/styledComponents'
import { useRecommendationListQuery, RecommendationListItem } from '../Recommendations/services'
import { PriorityIcon }                                       from '../Recommendations/styledComponents'

export { AIOperationsWidget as AIOperations }

const { countFormat } = intlFormats

type AIOperationsProps = {
  filters: AnalyticsFilter
}

function AIOperationsWidget ({
  filters
}: AIOperationsProps) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/analytics/recommendations/aiOps')
  const queryResults = useRecommendationListQuery({ ...filters, crrm: false })
  const data = queryResults?.data
  const title = {
    title: $t({ defaultMessage: 'AI Operations' }),
    icon: <ColorPill
      color='var(--acx-accents-orange-50)'
      value={$t(countFormat, { value: data?.length ?? 0 })}
    />
  }
  const noData = data?.length === 0
  const subtitle = $t({
    defaultMessage: 'Say goodbye to manual guesswork and hello to intelligent recommendations.' })

  return <Loader states={[queryResults]}>
    <Card title={title} onArrowClick={onArrowClick} subTitle={subtitle}>{
      noData
        ? <NoData text={$t({ defaultMessage: 'No recommendations' })} />
        : <UI.List
          dataSource={data?.slice(0,5)}
          renderItem={item => {
            const recommendation = item as RecommendationListItem
            const { category, priority, updatedAt, id, summary, sliceValue } = recommendation
            return <UI.List.Item key={id}>
              <TenantLink to={`/recommendations/aiOps/${id}`}>
                <Tooltip
                  placement='top'
                  title={$t(
                    { defaultMessage: '{summary} on {sliceValue}' },
                    { sliceValue, summary }
                  )}
                >
                  <UI.List.Item.Meta
                    avatar={<PriorityIcon value={priority.order} />}
                    title={category}
                    description={formatter(DateFormatEnum.DateFormat)(updatedAt)}
                  />
                </Tooltip>
              </TenantLink>
            </UI.List.Item>
          }}
        />
    }</Card>
  </Loader>
}

export default AIOperationsWidget
