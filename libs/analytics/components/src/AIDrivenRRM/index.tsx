import { useIntl } from 'react-intl'

import { AnalyticsFilter }               from '@acx-ui/analytics/utils'
import { Loader, Card, NoData }          from '@acx-ui/components'
import { TenantLink, useNavigateToPath } from '@acx-ui/react-router-dom'

import { CrrmListItem, useCrrmListQuery }     from '../Recommendations/services'
import { OptimizedIcon }                      from '../Recommendations/styledComponents'
import { getCrrmLinkText, getOptimizedState } from '../Recommendations/utils'

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
  const queryResults = useCrrmListQuery({ ...filters, n: 5 })
  const data = queryResults?.data
  const title = $t({ defaultMessage: 'AI-Driven RRM' })
  const noData = data?.length === 0

  return <Loader states={[queryResults]}>
    <Card title={title} onArrowClick={onArrowClick}>{
      noData
        ? <NoData text={$t({ defaultMessage: 'No recommendations' })} />
        : <UI.List
          dataSource={data}
          renderItem={item => {
            const recommendation = item as CrrmListItem
            const { sliceValue, id, status } = recommendation
            const optimizedState = getOptimizedState(status)
            return <UI.List.Item key={id}>
              <TenantLink to={`/recommendations/crrm/${id}`}>
                <UI.List.Item.Meta
                  avatar={<OptimizedIcon value={optimizedState.order} />}
                  title={sliceValue}
                  description={getCrrmLinkText(recommendation)}
                />
              </TenantLink>
            </UI.List.Item>
          }}
        />
    }</Card>
  </Loader>
}

export default AIDrivenRRMWidget
