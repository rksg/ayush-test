
import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card } from '@acx-ui/components'
import { Demo } from '@acx-ui/rc/utils'

import Photo              from '../../../../assets/images/portal-demo/main-photo.svg'
import Powered            from '../../../../assets/images/portal-demo/powered-logo-img.svg'
import Logo               from '../../../../assets/images/portal-demo/small-logo-img.svg'
import PortalPreviewModal from '../PortalSummary/PortalPreviewModal'
export default function PortalOverview (props: { demoValue: Demo }) {
  const { $t } = useIntl()
  const { demoValue } = props
  const newDemo = { ...demoValue, poweredImg: Powered, logo: Logo, photo: Photo }
  return (
    <Card>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: 40 }}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'Language' })}
          </Typography.Title>
          <Typography.Text>{newDemo?.displayLang}</Typography.Text>
        </div>
        <div style={{ marginRight: 40 }}>
          <Typography.Title level={3}>
            {$t({ defaultMessage: 'WiFi4EU Snippet' })}
          </Typography.Title>
          <Typography.Text>{newDemo?.componentDisplay?.WiFi4EU?
            $t({ defaultMessage: 'ON' }):$t({ defaultMessage: 'OFF' })}</Typography.Text>
        </div>
        <div>
          <Typography.Title level={3}><PortalPreviewModal demoValue={newDemo}/></Typography.Title>
        </div>
      </div>

    </Card>
  )
}
