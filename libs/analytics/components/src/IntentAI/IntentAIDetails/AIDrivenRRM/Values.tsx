import { chain, snakeCase } from 'lodash'

import { impactedArea, nodeTypes, productNames } from '@acx-ui/analytics/utils'
import { get }                                   from '@acx-ui/config'
import { DateFormatEnum, formatter }             from '@acx-ui/formatter'
import { NodeType, getIntl }                     from '@acx-ui/utils'

import { StateType, StatusTrail }                    from '../../config'
import { codes }                                     from '../../IntentAIForm/AIDrivenRRM'
import { IconValue }                                 from '../../IntentAIForm/config'
import { EnhancedRecommendation, RecommendationKpi } from '../../IntentAIForm/services'
import { isDataRetained }                            from '../../utils'

export const getKpiConfig = (recommendation: EnhancedRecommendation, key: string) => {
  return codes[recommendation.code]
    .kpis
    .find(kpi => kpi.key === key)
}

export const kpiBeforeAfter = (recommendation: EnhancedRecommendation, key: string) => {
  const config = getKpiConfig(recommendation, key)
  const prop = `kpi_${snakeCase(key)}`
  const [before, after] = extractBeforeAfter(recommendation[prop])
    .map(value => config!.format(value))
  return { before, after }
}

type CrrmListItem = {
  id: string
  code: string
  status: StateType
  sliceValue: string
  statusTrail: StatusTrail
  crrmOptimizedState?: IconValue
  summary?: string
  updatedAt: string
  metadata: {}
} & Partial<RecommendationKpi>

function extractBeforeAfter (value: CrrmListItem['kpis']) {
  const { current, previous, projected } = value!
  const [before, after] = [previous, current, projected]
    .filter(value => value !== null)
  return [before, after]
}

export const translateMetadataValue = (value: unknown) => {
  // TODO: add correct translation for intent ai
  // if (typeof value === 'string') {
  //   switch (value) {
  //     case 'BACKGROUND_SCANNING': return 'Background Scanning'
  //     case 'CHANNEL_FLY': return 'ChannelFly'
  //     default: return value
  //   }
  // }
  return value
}

export const getRecommendationsText = (
  details: EnhancedRecommendation,
  isFullOptimization = true
) => {
  const { $t } = getIntl()
  const {
    path,
    sliceType,
    sliceValue,
    originalValue,
    currentValue,
    recommendedValue,
    appliedOnce,
    code,
    status,
    dataEndTime
  } = details

  const metadata = chain(details.metadata)
    .toPairs()
    .map(([key, value]) => [key, translateMetadataValue(value)])
    .fromPairs()
    .value()

  const recommendationInfo = codes[code]
  const {
    appliedReasonText,
    valueFormatter,
    actionText,
    appliedActionText,
    reasonText,
    tradeoffText,
    partialOptimizedActionText,
    partialOptimizationAppliedReasonText,
    partialOptimizedTradeoffText
  } = recommendationInfo

  let parameters: Record<string, string | JSX.Element | boolean> = {
    ...productNames,
    ...metadata,
    scope: `${nodeTypes(sliceType as NodeType)}: ${impactedArea(path, sliceValue)}`,
    currentValue: appliedOnce ? valueFormatter(originalValue) : valueFormatter(currentValue),
    recommendedValue: valueFormatter(recommendedValue),
    br: <br />
  }
  const link = kpiBeforeAfter(details, 'number-of-interfering-links')
  parameters = {
    ...parameters,
    ...link,
    initialTime: formatter(
      DateFormatEnum.DateTimeFormat)(details.statusTrail.slice(-1)[0].createdAt),
    ...(status === 'applied' && { appliedTime: formatter(DateFormatEnum.DateTimeFormat)(
      details.statusTrail.filter(r => r.status === 'applied')[0].createdAt)
    }),
    isDataRetained: isDataRetained(dataEndTime),
    dataNotRetainedMsg: $t({
      defaultMessage: `The initial optimization graph is no longer available below
        since the {scopeType} recommendation details has crossed the standard RUCKUS
        data retention policy.{isApplied, select, true { However your {scopeType}
        configuration continues to be monitored and adjusted for further optimization.} other {}}`
    }, {
      isApplied: status === 'applied',
      scopeType: get('IS_MLISA_SA') ?
        $t({ defaultMessage: 'zone' }) :
        $t({ defaultMessage: '<venueSingular></venueSingular>' })
    })
  }

  return {
    actionText: $t(
      status === 'applied'
        ? appliedActionText!
        : isFullOptimization ? actionText : partialOptimizedActionText!
      , parameters),
    reasonText: appliedOnce && appliedReasonText
      ? (isFullOptimization
        ? $t(appliedReasonText, parameters)
        : $t(partialOptimizationAppliedReasonText!, parameters)
      )
      : $t(reasonText, parameters),
    tradeoffText: isFullOptimization
      ? $t(tradeoffText, parameters)
      : $t(partialOptimizedTradeoffText!, parameters)
  }
}
