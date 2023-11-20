import { List }    from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { isSwitchPath }                                      from '@acx-ui/analytics/utils'
import { Loader, Card, Tooltip, ColorPill }                  from '@acx-ui/components'
import { formatter, intlFormats }                            from '@acx-ui/formatter'
import { TenantLink, createSearchParams, useNavigateToPath } from '@acx-ui/react-router-dom'
import type { PathFilter }                                   from '@acx-ui/utils'

import { states }                                   from '../Recommendations/config'
import { CrrmList, CrrmListItem, useCrrmListQuery } from '../Recommendations/services'
import { OptimizedIcon }                            from '../Recommendations/styledComponents'

import { NoRRMLicense, NoRecommendationData } from './extra'
import * as UI                                from './styledComponents'

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
  const queryResults = useCrrmListQuery({ ...pathFilters, n: 12 }, { skip: switchPath })
  const data = switchPath
    ? {
      crrmCount: 0,
      zoneCount: 0,
      optimizedZoneCount: 0,
      crrmScenarios: 0,
      recommendations: []
    } as CrrmList
    : queryResults?.data
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

  const noLicense = data?.recommendations.length !== 0
    && data?.recommendations.filter(i => i.status === 'insufficientLicenses').length
    === data?.recommendations.length

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

  const noLicenseText = $t({ defaultMessage:
    `Currently RUCKUS AI cannot optimize your current zone
    for RRM due to inadequate licenses.`
  })

  return <Loader states={[queryResults]}>
    <Card
      title={title}
      onArrowClick={onArrowClick}
      subTitle={noLicense || !zoneCount ? '' : subtitle}
    >{zoneCount === 0
        ? <NoRecommendationData text={defaultText} details={noZoneText} />
        : noLicense
          ? <NoRRMLicense text={defaultText} details={noLicenseText} />
          : <AutoSizer>{(style) => <List<CrrmListItem>
            style={style}
            dataSource={data?.recommendations.slice(0, style.height / 50 | 0)}
            renderItem={recommendation => {
              const {
                sliceValue,
                id,
                code,
                crrmOptimizedState,
                crrmInterferingLinksText,
                summary,
                status,
                updatedAt,
                metadata
              } = recommendation
              const auditMetadata = metadata as { audit?: [
                { failure: string }
              ] }
              const getMesh = auditMetadata?.audit?.some(
                data => data.failure.hasOwnProperty('mesh'))!
              const getGlobalZone = auditMetadata?.audit?.some(
                data => data.failure.hasOwnProperty('global-zone-checker'))!
              const checkValues = getMesh === true ? 'mesh'
                : getGlobalZone === true ? 'global-zone-checker' : 'null'
              const paramString = createSearchParams({
                status: status,
                date: updatedAt,
                sliceValue: sliceValue,
                extra: checkValues
              }).toString()

              const unknownPath = `unknown?${paramString}`

              return <UI.ListItem key={`${id}${sliceValue}`}>
                <TenantLink to={`/recommendations/crrm/${code === 'unknown' ? unknownPath : id}`}>
                  <Tooltip
                    placement='top'
                    title={code === 'unknown' ? '' : summary}
                  >
                    <UI.ListItem.Meta
                      avatar={<OptimizedIcon value={crrmOptimizedState!.order} />}
                      title={sliceValue}
                      description={code === 'unknown'
                        ? $t(states[status].text)
                        : crrmInterferingLinksText}
                    />
                  </Tooltip>
                </TenantLink>
              </UI.ListItem>
            }}
          />}</AutoSizer>
      }
    </Card>
  </Loader>
}

export { AIDrivenRRMWidget as AIDrivenRRM }
