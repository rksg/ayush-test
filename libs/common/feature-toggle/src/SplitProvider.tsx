import React from 'react'

import { SplitFactory, SplitSdk } from '@splitsoftware/splitio-react'
import SplitIO                    from '@splitsoftware/splitio-react/types/splitio/splitio'

import { get }         from '@acx-ui/config'
import { useTenantId } from '@acx-ui/utils'

let factory: SplitIO.IBrowserSDK
function SplitProvider (props: Readonly<{ children: React.ReactElement }>) {
  const splitKey = get('SPLIT_IO_KEY')
  const splitProxy = get('SPLIT_PROXY_ENDPOINT')
  const tenantKey = useTenantId()
  if (tenantKey) {
    if (!factory || tenantKey !== factory.settings.core.key) {
      factory = SplitSdk({
        scheduler: {
          featuresRefreshRate: 30 // 30 sec
        },
        core: {
          authorizationKey: splitKey,
          key: tenantKey
        },
        ...(splitProxy ? { urls: {
          sdk: splitProxy,
          events: splitProxy,
          auth: splitProxy
        } } : {}),
        debug: false // set this value to true for running in debug mode for debugging in local development only
      })
    }
    return <SplitFactory key={tenantKey} factory={factory} children={props.children} />
  }
  return null
}

export { SplitProvider }
