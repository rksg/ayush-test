import { useIntl } from 'react-intl'

import { isSwitchPath }                                           from '@acx-ui/analytics/utils'
import { Loader, Card, Tooltip, NoRecommendationData, ColorPill } from '@acx-ui/components'
import { DateFormatEnum, formatter, intlFormats }                 from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }                          from '@acx-ui/react-router-dom'
import type { PathFilter }                                        from '@acx-ui/utils'

import * as UI                                         from '../AIDrivenRRM/styledComponents'
import { AiOpsList, useAiOpsListQuery, AiOpsListItem } from '../Recommendations/services'
import { PriorityIcon }                                from '../Recommendations/styledComponents'

export { AIOperationsWidget as AIOperations }

const { countFormat } = intlFormats

type AIOperationsProps = {
  pathFilters: PathFilter
}

function AIOperationsWidget ({
  pathFilters
}: AIOperationsProps) {
  const { $t } = useIntl()
  const switchPath = isSwitchPath(pathFilters.path)
  const onArrowClick = useNavigateToPath('/analytics/recommendations/aiOps')
  const queryResults =
    useAiOpsListQuery({ ...pathFilters, n: 5 }, { skip: switchPath })
  const data = switchPath
    ? {
      aiOpsCount: 0,
      recommendations: []
    } as AiOpsList
    : queryResults?.data
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
        ? <NoRecommendationData
          text={$t({ defaultMessage:
            `Your network is already running in an optimal configuration
            and we dont have any AI Operations to recommend recently.`
          })}
        />
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
