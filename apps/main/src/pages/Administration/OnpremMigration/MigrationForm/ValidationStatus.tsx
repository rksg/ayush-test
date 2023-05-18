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

const ValidationStatus = styled((props: SyslogSettingFormProps) => {
  const { $t } = useIntl()
  const { className } = props

  return (
    <Row gutter={20} className={className}>
      <Col>
        <div className='description'>
          <Typography.Text>
            {// eslint-disable-next-line max-len
              $t({ defaultMessage: 'ZoneDirector configurations is being validated and may take a few minutes to complete.' })}
          </Typography.Text>
          <Typography.Text>
            {// eslint-disable-next-line max-len
              $t({ defaultMessage: 'Click Cancel to return to the ZD Migrations list or wait here for the result.' })}
          </Typography.Text>
        </div>
      </Col>
    </Row>
  )
})`${UI.styles}`

export default ValidationStatus
