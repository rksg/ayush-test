import React, { createContext, useContext } from 'react'

import _ from 'lodash'

import { Loader }    from '@acx-ui/components'
import { useParams } from '@acx-ui/react-router-dom'

import { Intent, IntentKPIConfig, useIntentDetailsQuery } from './useIntentDetailsQuery'

type IIntentContext = {
  intent: Intent
  kpis: IntentKPIConfig[]
}

export const IntentContext = createContext({} as IIntentContext)
export const useIntentContext = () => useContext(IntentContext)

export function createIntentContextProvider (
  of: 'IntentAIDetails' | 'IntentAIForm',
  specs: Record<string, {
    kpis: IntentKPIConfig[]
    IntentAIDetails: React.ComponentType
    IntentAIForm: React.ComponentType
  }>
) {
  const Component: React.FC = function () {
    const { root, sliceId, code } = useParams() as {
      tenantId?: string
      root: Intent['root']
      sliceId: Intent['sliceId']
      code: string
    }
    const id = root || tenantId
    const spec = specs[code]
    const kpis = spec?.kpis
      // pick only 2 required field
      // which its value is primitive value type
      // to prevent RTK Query unable to use param as cache key
      .map(kpi => _.pick(kpi, ['key', 'deltaSign']))
    const query = useIntentDetailsQuery(
      { root: id as string, sliceId, code, kpis }, { skip: !spec })

    if (!spec) return null // no matching spec
    if (query.isSuccess && !query.data) return null // 404

    return <Loader states={[query]}>
      <IntentContext.Provider
        value={{ intent: query.data!, kpis: spec.kpis }}
        children={React.createElement(spec[of])}
      />
    </Loader>
  }
  Component.displayName = of
  return Component
}
