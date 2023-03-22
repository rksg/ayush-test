import { useIntl } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { RadiusServerForm } from './RadiusServerForm'

const LocalRadiusServer = () => {
  const { $t } = useIntl()
  const radiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)

  return (
    radiusClientEnabled ? <RadiusServerForm/> :
      <span>{ $t({ defaultMessage: 'Local RADIUS Server is not enabled' }) }</span>
  )
}

export default LocalRadiusServer
