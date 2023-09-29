import { useIntl } from 'react-intl'

import { Loader, Card, Tooltip, NoData, ColorPill } from '@acx-ui/components'
import { DateFormatEnum, formatter, intlFormats }   from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }            from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }                     from '@acx-ui/utils'

import * as UI                              from '../AIDrivenRRM/styledComponents'
import { useAiOpsListQuery, AiOpsListItem } from '../Recommendations/services'
import { PriorityIcon }                     from '../Recommendations/styledComponents'

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
  const queryResults = useAiOpsListQuery({ ...filters, n: 5 })
  const data = queryResults?.data
  const noData = data?.recommendations?.length === 0
  const aiOpsCount = data?.aiOpsCount
  const title = {
    title: $t({ defaultMessage: 'AI Operations' }),
    icon: <ColorPill
      color='var(--acx-accents-orange-50)'
      value={$t(countFormat, { value: aiOpsCount })}
    />
  }
  const subtitle = $t({
    defaultMessage: 'Say goodbye to manual guesswork and hello to intelligent recommendations.' })

  return <Loader states={[queryResults]}>
    <Card title={title} onArrowClick={onArrowClick} subTitle={subtitle}>{
      noData
        ? <NoData text={$t({ defaultMessage: 'No recommendations' })} />
        : <UI.List
          dataSource={data?.recommendations}
          renderItem={item => {
            const recommendation = item as AiOpsListItem
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
                    avatar={<PriorityIcon value={priority!.order} />}
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
