import { useIntl } from 'react-intl'

import { Loader, Card, NoData }          from '@acx-ui/components'
import { formatter }                     from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath } from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }          from '@acx-ui/utils'

import { CrrmListItem, useCrrmListQuery } from '../Recommendations/services'
import { OptimizedIcon }                  from '../Recommendations/styledComponents'

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
  const noData = data?.recommendations?.length === 0
  const countFormat = formatter('countFormat')

  const total = data?.totalCount
  const optimized = data?.recommendationCount
  const totalScenarios = countFormat(data?.crrmScenarios)
  // eslint-disable-next-line max-len
  const subtitle = $t({ defaultMessage: 'There are recommendations for {total} {total, plural, one {zone} other {zones}} covering {totalScenarios} possible RRM combinations. Currently {optimized} out of {total} {total, plural, one {zone} other {zones}} have been optimized.' }, { total, optimized, totalScenarios })
  // eslint-disable-next-line max-len
  const noCrrmText = $t({ defaultMessage: 'RUCKUS AI has confirmed that all zones are currently operating with the optimal RRM configurations and no further recommendation is required.' })

  return <Loader states={[queryResults]}>
    <Card title={title} onArrowClick={onArrowClick} subTitle={noData ? noCrrmText :subtitle}>{
      noData
        ? <NoData text={$t({ defaultMessage: 'No recommendations' })} />
        : <UI.List
          dataSource={data?.recommendations}
          renderItem={item => {
            const recommendation = item as CrrmListItem
            const {
              sliceValue, id,
              crrmOptimizedState,
              crrmInterferingLinksText
            } = recommendation
            return <UI.List.Item key={id}>
              <TenantLink to={`/recommendations/crrm/${id}`}>
                <UI.List.Item.Meta
                  avatar={<OptimizedIcon value={crrmOptimizedState!.order} />}
                  title={sliceValue}
                  description={crrmInterferingLinksText}
                />
              </TenantLink>
            </UI.List.Item>
          }}
        />
    }</Card>
  </Loader>
}

export default AIDrivenRRMWidget
