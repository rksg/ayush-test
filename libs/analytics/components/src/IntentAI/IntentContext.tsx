import React, { createContext, useContext } from 'react'

import _                     from 'lodash'
import { MessageDescriptor } from 'react-intl'

import { Loader }                 from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { formatter }              from '@acx-ui/formatter'

import {
  IntentDetail,
  IntentKPIConfig,
  intentState,
  useIntentDetailsQuery,
  useIntentParams
} from './useIntentDetailsQuery'
import { isDataRetained } from './utils'

export type IntentConfigurationConfig = {
  label: MessageDescriptor
  valueFormatter?: ReturnType<typeof formatter>
  tooltip?: (intent: IntentDetail) => MessageDescriptor
}

export type IIntentContext = {
  intent: IntentDetail
  configuration?: IntentConfigurationConfig
  kpis: IntentKPIConfig[]
  state: ReturnType<typeof intentState>
  isDataRetained?: boolean
  isHotTierData?: boolean
}

export const IntentContext = createContext({} as IIntentContext)
export const useIntentContext = () => useContext(IntentContext)

export function createIntentContextProvider (
  of: 'IntentAIDetails' | 'IntentAIForm',
  specs: Record<string, {
    configuration?: IntentConfigurationConfig
    kpis: IntentKPIConfig[]
    IntentAIDetails: React.ComponentType
    IntentAIForm: React.ComponentType
  }>
) {
  const Component: React.FC = function () {
    const params = useIntentParams()
    const isConfigChangeEnabled = useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE)

    const spec = specs[params.code]
    const kpis = spec?.kpis
      // pick only 2 required field
      // which its value is primitive value type
      // to prevent RTK Query unable to use param as cache key
      .map(kpi => _.pick(kpi, ['key', 'deltaSign']))
    const query = useIntentDetailsQuery({ ...params, kpis, isConfigChangeEnabled }, { skip: !spec })

    if (!spec) return null // no matching spec
    if (query.isSuccess && !query.data) return null // 404

    const isDetectError = query.isError && !!_.pick(query.error, ['data'])

    const intent = isDetectError ?
      (_.pick(query.error, ['data']) as { data: IntentDetail }).data
      : query.data

    const context: IIntentContext = {
      intent: intent!,
      configuration: spec.configuration,
      kpis: spec.kpis,
      state: (intent && intentState(intent))!,
      isDataRetained: isConfigChangeEnabled
        ? intent?.dataCheck.isDataRetained!
        : isDataRetained(intent?.metadata.dataEndTime),
      isHotTierData: isConfigChangeEnabled
        ? intent?.dataCheck.isHotTierData!
        : true
    }

    return <Loader states={[isDetectError? _.omit(query, ['error']) : query]}>
      <IntentContext.Provider
        value={context}
        children={React.createElement(spec[of])}
      />
    </Loader>
  }
  Component.displayName = of
  return Component
}
