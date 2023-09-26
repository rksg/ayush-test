import { useIntl } from 'react-intl'

import { Loader, Card, Tooltip, NoData } from '@acx-ui/components'
import { TenantLink, useNavigateToPath } from '@acx-ui/react-router-dom'
import type { PathFilter }               from '@acx-ui/utils'

import { CrrmListItem, useCrrmListQuery } from '../Recommendations/services'
import { OptimizedIcon }                  from '../Recommendations/styledComponents'

import * as UI from './styledComponents'

export { AIDrivenRRMWidget as AIDrivenRRM }

type AIDrivenRRMProps = {
  pathFilters: PathFilter
}

function AIDrivenRRMWidget ({
  pathFilters
}: AIDrivenRRMProps) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/analytics/recommendations/crrm')
  const queryResults = useCrrmListQuery({ ...pathFilters, n: 5 })
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
            const { sliceValue, id, crrmOptimizedState, crrmInterferingLinksText, summary }
              = recommendation
            return <UI.List.Item key={id}>
              <TenantLink to={`/recommendations/crrm/${id}`}>
                <Tooltip
                  placement='top'
                  title={summary}
                >
                  <UI.List.Item.Meta
                    avatar={<OptimizedIcon value={crrmOptimizedState!.order} />}
                    title={sliceValue}
                    description={crrmInterferingLinksText}
                  />
                </Tooltip>
              </TenantLink>
            </UI.List.Item>
          }}
        />
    }</Card>
  </Loader>
}

export default AIDrivenRRMWidget
