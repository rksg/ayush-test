import {
  Row,
  Col,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import * as UI from './styledComponents'

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
        <UI.PreDownloadLabel>
          {$t({ defaultMessage: 'Pre-download the firmware:' })}
        </UI.PreDownloadLabel>
      </Col>
      <Col span={8}>
        <Switch checked={checked} onChange={setChecked} />
      </Col>
      <Col>
        <span>
          {$t({ defaultMessage: `If enabled, the firmware will be downloaded to the
          switch in the background before the scheduled upgrade time,
          leading to a shorter update time` })}
        </span>
      </Col>
    </Row>
  )
}
