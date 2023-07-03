import React from 'react'

import { SplitFactory, SplitSdk } from '@splitsoftware/splitio-react'
import SplitIO                    from '@splitsoftware/splitio-react/types/splitio/splitio'

import { get }       from '@acx-ui/config'
import { useParams } from '@acx-ui/react-router-dom'

let factory: SplitIO.IBrowserSDK
const splitKey = get('SPLIT_IO_KEY')
const suffix = splitKey.substring(0, 5)

function SplitProvider (props: Readonly<{ children: React.ReactElement }>) {
  const { tenantId } = useParams() as { tenantId: string }
  if (!factory) {
    factory = SplitSdk({
      scheduler: {
        featuresRefreshRate: 30 // 30 sec
      },
      core: {
        authorizationKey: splitKey,
        key: tenantId
      },
      storage: {
        type: 'LOCALSTORAGE',
        prefix: 'ACX' + suffix
      },
      debug: false // set this value to true for running in debug mode for debugging in local development only
    })
  }
  return <SplitFactory factory={factory} children={props.children}/>
}

export { SplitProvider }
