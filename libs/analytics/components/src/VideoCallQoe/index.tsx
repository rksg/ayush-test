import { useIntl } from 'react-intl'
import { PageHeader } from '@acx-ui/components'

function VideoCallQoePage() {
  const { $t } = useIntl()
  return (
    <>
      <PageHeader
        breadcrumb={[
          { text: $t({ defaultMessage: 'AI Analytics' }), link: '/analytics/incidents' },
          { text: $t({ defaultMessage: 'Service Validation' }), link: '/serviceValidation/videoCallQoe' },
        ]}
        title={$t({ defaultMessage: 'Video Call QoE' })}

      />
    </>
  )
}
export { VideoCallQoePage }