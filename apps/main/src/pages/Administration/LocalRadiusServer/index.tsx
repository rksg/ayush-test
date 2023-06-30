import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { RadiusServerForm } from './RadiusServerForm'

const LocalRadiusServer = () => {
  const radiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)
  return (
    !radiusClientEnabled ? <></> : <RadiusServerForm/>
  )
}

export default LocalRadiusServer
