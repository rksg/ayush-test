import { Features, useIsTierAllowed } from '@acx-ui/feature-toggle'

import { RadiusServerForm } from './RadiusServerForm'

const LocalRadiusServer = () => {
  const radiusClientEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  return (
    !radiusClientEnabled ? <></> : <RadiusServerForm/>
  )
}

export default LocalRadiusServer
