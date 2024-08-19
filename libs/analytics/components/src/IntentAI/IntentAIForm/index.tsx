import React from 'react'

import _ from 'lodash'

import { Loader }    from '@acx-ui/components'
import { useParams } from '@acx-ui/react-router-dom'

// TODO: should rename to IntentAIDetails
import * as AIDrivenRRM                           from '../AIDrivenRRM'
import { IntentKPIConfig, useIntentDetailsQuery } from '../IntentAIForm/services'
import { IntentContext }                          from '../IntentContext'

type IntentSpec = {
  kpis: IntentKPIConfig[]
  IntentAIForm: React.ComponentType
  IntentAIDetails: React.ComponentType
}
const specs = {
  'c-crrm-channel24g-auto': AIDrivenRRM as IntentSpec,
  'c-crrm-channel5g-auto': AIDrivenRRM as IntentSpec,
  'c-crrm-channel6g-auto': AIDrivenRRM as IntentSpec
}

export function IntentAIForm () {
  const { code, recommendationId: id } = useParams() as {
    recommendationId: string
    code: keyof typeof specs
  }
  // TODO: fix: handle specs no matching code, i.e. 404

  // TODO: refactor: update query to not require entire IntentKPIConfig
  const kpis = specs[code].kpis.map(kpi => _.pick(kpi, ['key', 'deltaSign'])) as IntentKPIConfig[]
  const query = useIntentDetailsQuery({ id, kpis })

  return <Loader states={[query]}>
    <IntentContext.Provider
      value={{ intent: query.data!, kpis: specs[code].kpis }}
      children={React.createElement(specs[code].IntentAIForm)}
    />
  </Loader>
}
