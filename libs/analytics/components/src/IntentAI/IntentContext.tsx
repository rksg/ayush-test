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

type IIntentContext = {
  intent: IntentDetail
  configuration?: IntentConfigurationConfig
  kpis: IntentKPIConfig[]
  state: ReturnType<typeof intentState>
  isDataRetained: boolean
  isHotTierData: boolean
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
    const preventColdTier = [
      useIsSplitOn(Features.RUCKUS_AI_PREVENT_COLD_TIER_QUERY_TOGGLE),
      useIsSplitOn(Features.ACX_UI_PREVENT_COLD_TIER_QUERY_TOGGLE)
    ].some(Boolean)
    const spec = specs[params.code]
    const query = useIntentDetailsQuery({ ...params, preventColdTier }, { skip: !spec })
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
      isDataRetained: preventColdTier
        ? intent?.dataCheck.isDataRetained!
        : isDataRetained(intent?.metadata.dataEndTime),
      isHotTierData: preventColdTier
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
