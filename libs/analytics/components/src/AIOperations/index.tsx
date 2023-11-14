import { useIntl } from 'react-intl'

import { isSwitchPath }                                                           from '@acx-ui/analytics/utils'
import { Loader, Card, Tooltip, NoRecommendationData, ColorPill, NoAiOpsLicense } from '@acx-ui/components'
import { DateFormatEnum, formatter, intlFormats }                                 from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }                                          from '@acx-ui/react-router-dom'
import type { PathFilter }                                                        from '@acx-ui/utils'

import * as UI                                         from '../AIDrivenRRM/styledComponents'
import { states }                                      from '../Recommendations/config'
import { AiOpsList, useAiOpsListQuery, AiOpsListItem } from '../Recommendations/services'
import { PriorityIcon }                                from '../Recommendations/styledComponents'

import { GreenTickIcon, OrangeRevertIcon, RedCancelIcon } from './styledComponents'

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

  const filteredRecommendations = data?.recommendations.slice(0, 5)
  const noLicense = filteredRecommendations?.every(i => i.status === 'insufficientLicenses')
  const checkNew = filteredRecommendations?.filter(i => i.status === 'new').length

  const iconList = {
    applied: <GreenTickIcon />,
    reverted: <OrangeRevertIcon />,
    failed: <RedCancelIcon />
  }

  return <Loader states={[queryResults]}>
    <Card title={title} onArrowClick={onArrowClick} subTitle={subtitle}>{
      noData
        ? <NoRecommendationData
          noData={true}
          text={$t({ defaultMessage:
          `Your network is already running in an optimal configuration
          and we dont have any AI Operations to recommend recently.`
          })}
        /> :
        noLicense ? <NoAiOpsLicense
          text={$t({ defaultMessage:
          `RUCKUS AI cannot analyse your zone due to inadequate licenses.
          Please ensure you have licenses fully applied for the zone for 
          AI Operations optimizations.`
          })}/>
          : <>
            {!checkNew ? <NoRecommendationData
              text={$t({ defaultMessage:
              `Your network is already running in an optimal configuration
              and we dont have any AI Operations to recommend recently.`
              })}
            /> : []}
            <UI.List
              style={{ marginTop: !checkNew ? 120 : 0 }}
              dataSource={!checkNew
                ? filteredRecommendations?.slice(0, 3)
                : filteredRecommendations}
              renderItem={item => {
                const recommendation = item as AiOpsListItem
                const {
                  category, priority, updatedAt, id, summary, sliceValue, status
                } = recommendation
                const date = formatter(DateFormatEnum.DateFormat)(updatedAt)
                const statusText = states[status as keyof typeof states].text
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
                        avatar={!checkNew
                          ? iconList[status as keyof typeof iconList]
                          : <PriorityIcon value={priority!.order} />
                        }
                        title={category}
                        description={!checkNew
                          ? `${$t(statusText)} ${$t({ defaultMessage: 'on {date}' }, { date })}`
                          : date
                        }
                      />
                    </Tooltip>
                  </TenantLink>
                </UI.List.Item>
              }}
            />
          </>
    }</Card>
  </Loader>
}

export default AIOperationsWidget
