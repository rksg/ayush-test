import { useIntl } from 'react-intl'

import { isSwitchPath }                                                         from '@acx-ui/analytics/utils'
import { Loader, Card, Tooltip, NoRecommendationData, ColorPill, NoRRMLicense } from '@acx-ui/components'
import { formatter, intlFormats }                                               from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }                                        from '@acx-ui/react-router-dom'
import type { PathFilter }                                                      from '@acx-ui/utils'

import { CrrmList, CrrmListItem, useCrrmListQuery } from '../Recommendations/services'
import { OptimizedIcon }                            from '../Recommendations/styledComponents'

import * as UI from './styledComponents'

const { countFormat } = intlFormats

type AIDrivenRRMProps = {
  pathFilters: PathFilter
}

function AIDrivenRRMWidget ({
  pathFilters
}: AIDrivenRRMProps) {
  const { $t } = useIntl()
  const switchPath = isSwitchPath(pathFilters.path)
  const onArrowClick = useNavigateToPath('/analytics/recommendations/crrm')
  const queryResults = useCrrmListQuery({ ...pathFilters, n: 5 }, { skip: switchPath })
  const data = switchPath
    ? {
      crrmCount: 0,
      zoneCount: 0,
      optimizedZoneCount: 0,
      crrmScenarios: 0,
      recommendations: []
    } as CrrmList
    : queryResults?.data
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

  const defaultText = $t({ defaultMessage:
    `This feature is a centralized algorithm that runs in the
    RUCKUS Analytics cloud and guarantees zero interfering links
    for the access points (APs) managed by SmartZone controllers,
    whenever theoretically achievable thus minimizing co-channel
    interference to the lowest level possible.`
  })

  const noZoneText = $t({ defaultMessage:
    `Currently RUCKUS AI cannot provide RRM combinations
    as zones are not found on your network`
  })

  const optimalConfigText = $t({ defaultMessage:
    `Your zone is already running in an optimal configuration
    and we don't have any RRM to recommend currently.`
  })

  const noLicenseText = $t({ defaultMessage:
    `Currently RUCKUS AI cannot optimize your current zone
    for RRM due to inadequate licenses.`
  })

  const noLicense = false // get from API once task is complete

  return <Loader states={[queryResults]}>
    <Card
      title={title}
      onArrowClick={onArrowClick}
      subTitle={noLicense || !zoneCount ? '' : subtitle}
    >{noLicense
        ? <NoRRMLicense
          text={defaultText}
          details={noLicenseText}/>
        : noData
          ? <NoRecommendationData
            noData={true}
            isCrrm={true}
            details={zoneCount ? '' : defaultText}
            text={zoneCount ? optimalConfigText : noZoneText}
          />
          : <UI.List
            dataSource={data?.recommendations}
            renderItem={item => {
              const recommendation = item as CrrmListItem
              const {
                sliceValue,
                id,
                crrmOptimizedState,
                crrmInterferingLinksText,
                summary
              } = recommendation
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
      }
    </Card>
  </Loader>
}

export { AIDrivenRRMWidget as AIDrivenRRM }
