import {
  Row,
  Col,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle } from '@acx-ui/components'

import * as UI from '../../styledComponents'

interface PreDownloadProps {
  checked: boolean,
  setChecked: (checked: boolean) => void
}

export function PreDownload (props: PreDownloadProps) {
  const { $t } = useIntl()
  const { checked, setChecked } = props

  return (
    <Row align='middle' justify='space-between'>
      <Col span={16}>
        <Subtitle level={4} style={{ marginTop: '10px' }}>
          {$t({ defaultMessage: 'Pre-download the firmware:' })}
          <Switch checked={checked} onChange={setChecked} style={{ marginLeft: '50px' }} />
        </Subtitle>
      </Col>
      <Col>
        <UI.TitleActive>
          {$t({ defaultMessage: `If enabled, the firmware will be downloaded to the
          switch in the background before the scheduled upgrade time,
          leading to a shorter update time` })}
        </UI.TitleActive>
      </Col>
    </Row>
  )
}
