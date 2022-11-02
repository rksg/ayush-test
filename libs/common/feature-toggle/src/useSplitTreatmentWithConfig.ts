import { useContext, useDebugValue } from 'react'

import { SplitContext } from '@splitsoftware/splitio-react'

import { useParams }          from '@acx-ui/react-router-dom'
import { getJwtTokenPayload } from '@acx-ui/utils'

import { defaultConfig } from './types'

// For MSP flows will be handled in separate jira - ACX-7910

// eslint-disable-next-line max-len
export function useFFList (): { featureList?: string[], betaList?: string[] } {
  const { client } = useContext(SplitContext)
  const isReady = client.ready()
  const jwtPayload = getJwtTokenPayload()
  const { tenantId } = useParams()
  // @ts-ignore
  const tier = jwtPayload.acx_account_tier
  // @ts-ignore
  const region = jwtPayload.acx_account_regions[2]
  // @ts-ignore
  const vertical = jwtPayload.acx_account_vertical
  const splitName = 'ACX-PLM-FF' // This value mostly will be onetime as defined by PLM (need to confirm)
  const attributes = {
    tenantId: tenantId,
    tier: tier,
    region: region,
    vertical: vertical
  }

  let userFFConfig: string[] = []
  let configKeys: string[]
  let ffIdsList: never[] = []
  // eslint-disable-next-line max-len,no-console
  console.log('isReady outside ---------------->', isReady)
  if (isReady) {
    const treatmentValue = client.getTreatmentWithConfig(splitName, attributes)
    // eslint-disable-next-line max-len,no-console
    // console.log('isReady---------------->', isReady, client.ready().then( (data: never) => {console.log(data)}))
    // eslint-disable-next-line max-len,no-console
    console.log('treatmentValue from useSplitTreatmentWithConfig ---> ', tier, region, vertical, treatmentValue, isReady)
    if (JSON.parse(String(treatmentValue?.treatment !== 'control')) ) {
      userFFConfig = JSON.parse(treatmentValue?.config)
    } else {
      // let config = JSON.stringify(defaultConfig)
      userFFConfig = JSON.parse(JSON.stringify(defaultConfig))
    }
    if (userFFConfig) {
      configKeys = Object.keys(userFFConfig)
      // eslint-disable-next-line no-console
      console.log('Config KEYS ---------------->>>>>', configKeys)
      configKeys.forEach(key => {
        if (key !== 'betaList') {
          // ffIdsList.push(userFFConfig?.[key])
          // @ts-ignore
          ffIdsList.push(userFFConfig[key])
          // eslint-disable-next-line no-console
          console.log('Config KEYS VALUES ---------------->>>>>', key,
            Object.values(userFFConfig))
        }
      })
    }
  }
  useDebugValue(`${splitName}: treatment`) // used to display a label for custom hooks in React DevTools
  // @ts-ignore
  // ffIdsList.push(Object.values(userFFConfig))
  // let fIds = new Set(ffIdsList.flat()) as unknown as string[]
  let fIds = ffIdsList.flat()
  // @ts-ignore
  return {
    featureList: fIds
    // betaList: userFFConfig?.['betaList']
  }
}

export function useSplitTreatmentWithConfig (featureId: string): object {
  const {
    featureList = [],
    betaList = []
  } = useFFList()
  // eslint-disable-next-line no-console
  console.log('featureList.includes(featureId): ', featureList.includes(featureId))
  return {
    enable: featureList?.includes(featureId),
    beta: betaList.includes(featureId)
  }
}
