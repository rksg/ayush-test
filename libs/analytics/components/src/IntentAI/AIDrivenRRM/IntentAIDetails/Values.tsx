// TODO: refactor: change filename to useValuesText later
import _ from 'lodash'

import { productNames } from '@acx-ui/analytics/utils'
import { get }          from '@acx-ui/config'
import { getIntl }      from '@acx-ui/utils'

import { EnhancedIntent, extractBeforeAfter, IntentKpi, IntentKPIConfig } from '../../IntentAIForm/services'
import { useIntentContext }                                               from '../../IntentContext'
import { isDataRetained }                                                 from '../../utils'
import { codes }                                                          from '../IntentAIForm'

export const kpiBeforeAfter = (intent: EnhancedIntent, config: IntentKPIConfig) => {
  const prop = `kpi_${_.snakeCase(config.key)}`
  const [before, after] = extractBeforeAfter(intent[prop] as IntentKpi[string])
    .map(value => config.format(value))
  return { before, after }
}

export const useValuesText = () => {
  const { $t } = getIntl()
  const { intent, kpis } = useIntentContext()
  const isFullOptimization = !!_.get(intent, 'metadata.algorithmData.isCrrmFullOptimization', true)
  const {
    appliedOnce,
    code,
    status,
    dataEndTime,
    metadata
  } = intent

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
    ...kpiBeforeAfter(intent, kpis.find(kpi => kpi.key === 'number-of-interfering-links')!),
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
