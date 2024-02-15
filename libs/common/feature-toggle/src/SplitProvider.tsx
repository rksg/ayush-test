import React from 'react'

import { SplitFactory, SplitSdk, SplitTreatments } from '@splitsoftware/splitio-react'
import SplitIO                                     from '@splitsoftware/splitio-react/types/splitio/splitio'

import { getUserProfile } from '@acx-ui/analytics/utils'
import { get }            from '@acx-ui/config'
import { useParams }      from '@acx-ui/react-router-dom'

import { Features } from './features'

let factory: SplitIO.IBrowserSDK
const splitKey = get('SPLIT_IO_KEY')
const splitProxy = get('SPLIT_PROXY_ENDPOINT')
const isMLISA = get('IS_MLISA_SA')
const suffix = splitKey.substring(0, 5)

const allFeatures = Object.keys(Features).map(k => Features[k as keyof typeof Features])

function SplitProvider (props: Readonly<{ children: React.ReactElement }>) {
  const { tenantId } = useParams() as { tenantId: string }
  const { accountId } = getUserProfile()
  const prefixKey = isMLISA ? 'MLISA' : 'ACX'
  const tenantKey = isMLISA ? accountId : tenantId

  if (!factory && tenantKey) {
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
      storage: {
        type: 'LOCALSTORAGE',
        prefix: `${prefixKey}-${suffix}`
      },
      debug: false // set this value to true for running in debug mode for debugging in local development only
    })
  }
  return tenantKey ? (
    <SplitFactory factory={factory}>
      <SplitTreatments names={allFeatures}>
        {({ isReady }) => isReady
          // bug in splitio: https://github.com/splitio/react-client/issues/13
          ? /* istanbul ignore next */ props.children
          : props.children}
      </SplitTreatments>
    </SplitFactory>
  ) : null
}

export { SplitProvider }
