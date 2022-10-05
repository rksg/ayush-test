import { Anchor, Col, Divider, Form, Row, Select } from 'antd'
import { useIntl }                                 from 'react-intl'

import { Subtitle }              from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { useParams }             from '@acx-ui/react-router-dom'
const { Link } = Anchor
const { Option } = Select

export function RadioTab () {
  const { $t } = useIntl()
  const wifiSettingTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const externalTitle = $t({ defaultMessage: 'External Amtenna' })

  return (
    <Row gutter={20}>
      <Col span={4}>
        <Anchor>
          <Link href='#settings' title={wifiSettingTitle} />
          <Link href='#external' title={externalTitle} />
        </Anchor>
      </Col>
      <Col span={20}>
        <Form layout='vertical'>
          <Subtitle level={3} id='settings'>
            { wifiSettingTitle }
            <Divider style={{ marginTop: '4px' }} />
          </Subtitle>
          <Subtitle level={3} id='external'>
            { externalTitle }
            <Divider style={{ marginTop: '4px' }} />
          </Subtitle>
        </Form>
      </Col>
    </Row>
  )
}