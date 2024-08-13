import { snakeCase } from 'lodash'

import { productNames } from '@acx-ui/analytics/utils'
import { get }          from '@acx-ui/config'
import { getIntl }      from '@acx-ui/utils'

import { codes, kpis }                                   from '../../IntentAIForm/AIDrivenRRM'
import { EnhancedIntent, extractBeforeAfter, IntentKpi } from '../../IntentAIForm/services'
import { isDataRetained }                                from '../../utils'

export const kpiBeforeAfter = (intent: EnhancedIntent, key: string) => {
  const config = kpis.find(kpi => kpi.key === key)!
  const prop = `kpi_${snakeCase(key)}`
  const [before, after] = extractBeforeAfter(intent[prop] as IntentKpi[string])
    .map(value => config.format(value))
  return { before, after }
}

export const getValuesText = (
  details: EnhancedIntent,
  isFullOptimization = true
) => {
  const { $t } = getIntl()
  const {
    appliedOnce,
    code,
    status,
    dataEndTime,
    metadata
  } = details

  const {
    appliedReasonText,
    reasonText,
    tradeoffText,
    partialOptimizationAppliedReasonText,
    partialOptimizedTradeoffText
  } = codes[code]

  let parameters: Record<string, string | JSX.Element | boolean> = {
    ...productNames,
    ...metadata as Record<string, string>,
    br: <br />
  }
  parameters = {
    ...parameters,
    ...kpiBeforeAfter(details, 'number-of-interfering-links'),
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
