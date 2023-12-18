import { List }    from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { isSwitchPath }                           from '@acx-ui/analytics/utils'
import { Loader, Card, Tooltip, ColorPill }       from '@acx-ui/components'
import { DateFormatEnum, formatter, intlFormats } from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }          from '@acx-ui/react-router-dom'
import type { PathFilter }                        from '@acx-ui/utils'

import { states }                                      from '../Recommendations/config'
import { AiOpsList, useAiOpsListQuery, AiOpsListItem } from '../Recommendations/services'
import { PriorityIcon }                                from '../Recommendations/styledComponents'

import {
  NoAiOpsLicense,
  OptimalConfiguration,
  OptimalConfigurationWithData,
  optimalConfigurationText,
  subtitle
} from './extra'
import * as UI from './styledComponents'

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
    useAiOpsListQuery({ ...pathFilters, n: 20 }, { skip: switchPath })
  const data = switchPath
    ? {
      aiOpsCount: 0,
      recommendations: []
    } as AiOpsList
    : queryResults?.data
  const filteredRecommendations = data?.recommendations.filter(i => i.code !== 'unknown')
  const noData = filteredRecommendations?.length === 0
  const aiOpsCount = data?.aiOpsCount
  const title = {
    title: $t({ defaultMessage: 'AI Operations' }),
    icon: <ColorPill
      color='var(--acx-accents-orange-50)'
      value={$t(countFormat, { value: aiOpsCount })}
    />
  }

  const noLicense = data?.recommendations.length !== 0 ? data?.recommendations.every(
    recommendation => recommendation.status === 'insufficientLicenses'
  ) : false
  const hasNew = data?.recommendations?.some(i => i.status === 'new')

  const newStates = ['new', 'applyscheduled', 'applyscheduleinprogress', 'beforeapplyinterrupted']
  // eslint-disable-next-line max-len
  const appliedStates = ['applied', 'afterapplyinterrupted', 'applywarning', 'revertscheduled', 'revertscheduleinprogress']
  const revertedStates = ['reverted']
  const failedStates = ['applyfailed', 'revertfailed']
  const intervalTypeMapping = [
    { state: 'new', list: newStates },
    { state: 'applied', list: appliedStates, icon: <UI.AppliedIcon /> },
    { state: 'reverted', list: revertedStates, icon: <UI.RevertIcon /> },
    { state: 'failed', list: failedStates, icon: <UI.FailedIcon /> }
  ]

  return <Loader states={[queryResults]}>
    <Card
      title={title}
      onArrowClick={onArrowClick}
      subTitle={(noLicense || noData || !hasNew) ? '' : subtitle($t)}
    >{
        noLicense ? <NoAiOpsLicense />
          : noData
            ? <OptimalConfiguration text={optimalConfigurationText}/>
            : <>
              {!hasNew ? <OptimalConfigurationWithData /> : null}
              <div style={{ flex: 1 }}>
                <AutoSizer style={{ flex: 1 }}>{(style) => <List<AiOpsListItem>
                  style={style}
                  dataSource={filteredRecommendations?.slice(0, style.height / 50 | 0)}
                  renderItem={recommendation => {
                    const {
                      category, priority, updatedAt, id, summary, sliceValue, status
                    } = recommendation
                    const date = formatter(DateFormatEnum.DateFormat)(updatedAt)
                    const statusText = states[status as keyof typeof states].text
                    return <UI.ListItem key={id}>
                      <TenantLink to={`/recommendations/aiOps/${id}`}>
                        <Tooltip
                          placement='top'
                          title={$t(
                            { defaultMessage: '{summary} on {sliceValue}' },
                            { sliceValue, summary }
                          )}
                        >
                          <UI.ListItem.Meta
                            avatar={!hasNew
                              ? intervalTypeMapping.filter(states =>
                                states.list.includes(status))[0].icon
                              : <PriorityIcon value={priority!.order} />
                            }
                            title={category}
                            description={!hasNew
                              ? `${$t(statusText)} ${$t({ defaultMessage: 'on {date}' }, { date })}`
                              : date
                            }
                          />
                        </Tooltip>
                      </TenantLink>
                    </UI.ListItem>
                  }}
                />
                }</AutoSizer>
              </div>
            </>
      }</Card>
  </Loader>
}

export default AIOperationsWidget
