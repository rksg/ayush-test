import React from 'react'

import { SplitFactory } from '@splitsoftware/splitio-react'

import { useParams } from '@acx-ui/react-router-dom'

function SplitProvider (props: Readonly<{ children: React.ReactElement }>) {
  const { tenantId } = useParams() as { tenantId: string }
  const config: SplitIO.IBrowserSettings = {
    scheduler: {
      featuresRefreshRate: 5 // 5 sec
    },
    core: {
      authorizationKey: 'mtnoim4p9p9e9h2f21vvgvu1ck3tlgn17vq', // TODO: will be addressed as part of Jira: ACX-8995, need to add secrets file variable SPLITIO_FF_KEY
      key: tenantId
    },
    debug: false // set this value to true for running in debug mode for debugging
  }
  return <SplitFactory config={config} children={props.children} />
}

export { SplitProvider }
