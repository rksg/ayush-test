import {
  Col,
  Row,
  Typography
} from 'antd'
import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import * as UI from './styledComponents'

type SyslogSettingFormProps = {
  className?: string
}

const MigrationStatusForm = styled((props: SyslogSettingFormProps) => {
  const { $t } = useIntl()
  const { className } = props

  return (
    <Row gutter={20} className={className}>
      <Col span={10}>
        <Typography.Text>
          {// eslint-disable-next-line max-len
            $t({ defaultMessage: 'ZoneDirector configurations is being migrated and may take a few minutes to complete.' })}
        </Typography.Text>
        <Typography.Text>
          {// eslint-disable-next-line max-len
            $t({ defaultMessage: 'Click Done to return to the ZD Migrations list or wait here for the result.' })}
        </Typography.Text>
      </Col>
    </Row>
  )
})`${UI.styles}`

export default MigrationStatusForm
