import { withSplitFactory } from '@splitsoftware/splitio-react'

import { getTenantId } from '@acx-ui/rc/utils'

const tenantId = getTenantId()
const SDK_CONFIG = {
  scheduler: {
    featuresRefreshRate: 5 // 5 sec
  },
  core: {
    authorizationKey: 'mtnoim4p9p9e9h2f21vvgvu1ck3tlgn17vq', // TODO: will be addressed as part of Jira: ACX-8995, need to add secrets file variable SPLITIO_FF_KEY
    key: `${tenantId}`
  },
  debug: false // set this value to true for running in debug mode for debugging
}
export const splitSDK = withSplitFactory(SDK_CONFIG)
