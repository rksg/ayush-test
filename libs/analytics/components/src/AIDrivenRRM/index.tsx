import { useIntl } from 'react-intl'

import { AnalyticsFilter }               from '@acx-ui/analytics/utils'
import { Loader, Card, NoData }          from '@acx-ui/components'
import { formatter }                     from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath } from '@acx-ui/react-router-dom'

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
  const queryResults = useCrrmListQuery({ ...filters, n: 5, m: 10000 })
  const data = queryResults?.data
  const title = $t({ defaultMessage: 'AI-Driven RRM' })
  const noData = data?.recommendations?.length === 0
  const countFormat = formatter('countFormat')

  const total = data?.crrmCount?.total
  const optimized = data?.crrmCount?.optimized
  const totalScenario = countFormat(data?.crrmScenario?.total)
  // eslint-disable-next-line max-len
  const subtitle = $t({ defaultMessage: 'There are recommendations for {total} zones covering {totalScenario} possible RRM combinations. Currently {optimized}/{total} zones have been optimized.' }, { total, optimized, totalScenario })
  // eslint-disable-next-line max-len
  const noCrrmText = $t({ defaultMessage: 'RUCKUS AI has confirmed that all zones are currently operating with the optimal RRM onfigurations and no further recommendation is required.' })

  return <Loader states={[queryResults]}>
    <Card title={title} onArrowClick={onArrowClick}>{
      noData
        ? <NoData text={noCrrmText} />
        : <>
          <UI.subtitle children={subtitle}/>
          <UI.List
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
        </>
    }</Card>
  </Loader>
}

export default AIDrivenRRMWidget
