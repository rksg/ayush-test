import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

function VideoCallQoePage () {
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'Video Call QoE' })}
      breadcrumb={[
        {
          text: $t({ defaultMessage: 'Service Validation' }),
          link: '/serviceValidation'
        }
      ]}
    />
  )
}
export default VideoCallQoePage
