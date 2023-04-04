import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

function VideoCallQoeListPage () {
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'Video Call QoE' })}
    />
  )
}
export default VideoCallQoeListPage
