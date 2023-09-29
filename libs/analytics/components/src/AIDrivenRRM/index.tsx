import { useIntl } from 'react-intl'

import { Loader, Card, NoData, ColorPill } from '@acx-ui/components'
import { formatter, intlFormats }          from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }   from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }            from '@acx-ui/utils'

import { CrrmListItem, useCrrmListQuery } from '../Recommendations/services'
import { OptimizedIcon }                  from '../Recommendations/styledComponents'

import * as UI from './styledComponents'

export { AIDrivenRRMWidget as AIDrivenRRM }

const { countFormat } = intlFormats

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
  const noData = data?.recommendations?.length === 0
  const crrmCount = data?.crrmCount
  const zoneCount = data?.zoneCount
  const optimizedZoneCount = data?.optimizedZoneCount
  const crrmScenarios = formatter('countFormat')(data?.crrmScenarios)
  const title = {
    title: $t({ defaultMessage: 'AI-Driven RRM' }),
    icon: <ColorPill
      color='var(--acx-accents-orange-50)'
      value={$t(countFormat, { value: crrmCount })}
    />
  }

  const subtitle = $t(
    {
      defaultMessage: `There
        {crrmCount, plural, one {is} other {are}}
        {crrmCount}
        {crrmCount, plural, one {recommendation} other {recommendations}}
        for
        {zoneCount}
        {zoneCount, plural, one {zone} other {zones}}
        covering {crrmScenarios} possible RRM combinations. Currently,
        {optimizedZoneCount}
        {optimizedZoneCount, plural, one {zone} other {zones}}
        {optimizedZoneCount, plural, one {is} other {are}}
        optimized.`,
      description: 'Translation strings - is, are, recommendation, recommendations, zone, zones'
    },
    { crrmCount, zoneCount, optimizedZoneCount, crrmScenarios }
  )
  const noCrrmText = $t({ defaultMessage: `RUCKUS AI has confirmed that all zones are currently
    operating with the optimal RRM configurations and no further recommendation is required.` })

  return <Loader states={[queryResults]}>
    <Card
      title={title}
      onArrowClick={onArrowClick}
      subTitle={noData ? noCrrmText : subtitle}
    >{noData
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
      }
    </Card>
  </Loader>
}

export default AIDrivenRRMWidget
