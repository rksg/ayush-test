import React, { createContext, useContext } from 'react'

import _                     from 'lodash'
import { MessageDescriptor } from 'react-intl'

import { Loader }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
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
  isDataRetained: boolean
  state: ReturnType<typeof intentState>
  params: ReturnType<typeof useIntentParams>
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
    const loadStatusMetadata = useIsSplitOn(Features.INTENT_AI_CONFIG_CHANGE_TOGGLE)

    const spec = specs[params.code]
    const kpis = spec?.kpis
      // pick only 2 required field
      // which its value is primitive value type
      // to prevent RTK Query unable to use param as cache key
      .map(kpi => _.pick(kpi, ['key', 'deltaSign']))
    const query = useIntentDetailsQuery({ ...params, kpis, loadStatusMetadata }, { skip: !spec })

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
      isDataRetained: (intent && isDataRetained(intent.metadata.dataEndTime))!,
      state: (intent && intentState(intent))!,
      params
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
