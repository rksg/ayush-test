import React from 'react'

import { SplitFactory, SplitSdk } from '@splitsoftware/splitio-react'
import SplitIO                    from '@splitsoftware/splitio-react/types/splitio/splitio'

import {
  useUserProfileContext
} from '@acx-ui/analytics/utils'
import { get }       from '@acx-ui/config'
import { useParams } from '@acx-ui/react-router-dom'

let factory: SplitIO.IBrowserSDK
const splitKey = get('SPLIT_IO_KEY')
const splitProxyEndpoint = get('SPLIT_PROXY_ENDPOINT')
const isMLISA = get('IS_MLISA_SA')
const suffix = splitKey.substring(0, 5)

function SplitProvider (props: Readonly<{ children: React.ReactElement }>) {
  const { tenantId } = useParams() as { tenantId: string }
  const { data: userProfile } = useUserProfileContext()
  const prefixKey = isMLISA ? 'MLISA-' : 'ACX-'
  const tenantKey = isMLISA ? userProfile?.accountId as string : tenantId
  /* eslint-disable-next-line no-console */
  console.log(`splitProxyEndpoint: ${splitProxyEndpoint}`)
  if (!factory && tenantKey) {
    factory = SplitSdk({
      scheduler: {
        featuresRefreshRate: 30 // 30 sec
      },
      core: {
        authorizationKey: splitKey,
        key: tenantKey
      },
      urls: {
        sdk: splitProxyEndpoint,
        events: splitProxyEndpoint,
        auth: splitProxyEndpoint
      },
      storage: {
        type: 'LOCALSTORAGE',
        prefix: prefixKey + suffix
      },
      debug: false // set this value to true for running in debug mode for debugging in local development only
    })
  }
  return tenantKey ? (
    <SplitFactory factory={factory} children={props.children} />
  ) : null
}

export { SplitProvider }
