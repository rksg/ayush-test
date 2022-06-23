import React from 'react'

import { SplitFactory } from '@splitsoftware/splitio-react'

import { get }       from '@acx-ui/config'
import { useParams } from '@acx-ui/react-router-dom'

function SplitProvider (props: Readonly<{ children: React.ReactElement }>) {
  const { tenantId } = useParams() as { tenantId: string }
  const config: SplitIO.IBrowserSettings = {
    scheduler: {
      featuresRefreshRate: 5 // 5 sec
    },
    core: {
      authorizationKey: get('SPLIT_IO_KEY'),
      key: tenantId
    },
    storage: {
      type: 'LOCALSTORAGE',
      prefix: 'ACX'
    },
    debug: false // set this value to true for running in debug mode for debugging in local development only
  }
  return <SplitFactory config={config} children={props.children} />
}

export { SplitProvider }
