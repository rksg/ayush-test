import { useIntl } from 'react-intl'

import { PageHeader }             from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

function VideoCallQoeListPage () {
  const isVideoCallQoeListPageEnabled = useIsSplitOn(Features.VIDEO_CALL_QOE)
  const { $t } = useIntl()

  if (!isVideoCallQoeListPageEnabled) {
    return <span>{ $t({ defaultMessage: 'Video Call QoE is not enabled' }) }</span>
  }

  return (
    <PageHeader
      title={$t({ defaultMessage: 'Video Call QoE' })}
    />
  )
}
export default VideoCallQoeListPage
