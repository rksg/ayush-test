import React, { createContext, useContext } from 'react'

import _                     from 'lodash'
import { MessageDescriptor } from 'react-intl'

import { Loader }    from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

import { Intent, IntentKPIConfig, useIntentDetailsQuery, useIntentParams } from './useIntentDetailsQuery'

export type IntentConfigurationConfig = {
  label: MessageDescriptor
  valueFormatter?: ReturnType<typeof formatter>
  tooltip?: (intent: Intent) => MessageDescriptor
}

type IIntentContext = {
  intent: Intent
  configuration?: IntentConfigurationConfig
  kpis: IntentKPIConfig[]
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

    const spec = specs[params.code]
    const kpis = spec?.kpis
      // pick only 2 required field
      // which its value is primitive value type
      // to prevent RTK Query unable to use param as cache key
      .map(kpi => _.pick(kpi, ['key', 'deltaSign']))
    const query = useIntentDetailsQuery({ ...params, kpis }, { skip: !spec })

    if (!spec) return null // no matching spec
    if (query.isSuccess && !query.data) return null // 404

    return <Loader states={[query]}>
      <IntentContext.Provider
        value={{ intent: query.data!, configuration: spec.configuration, kpis: spec.kpis }}
        children={React.createElement(spec[of])}
      />
    </Loader>
  }
  Component.displayName = of
  return Component
}
