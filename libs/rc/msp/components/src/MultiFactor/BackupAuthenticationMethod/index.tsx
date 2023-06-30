import { useState } from 'react'

import { Row, Col, Form } from 'antd'
import { useIntl }        from 'react-intl'

import { Subtitle } from '@acx-ui/components'

import * as UI from '../styledComponents'

import { RecoveryCodes } from './RecoveryCodes'

export const BackupAuthenticationMethod = (props: { recoveryCodes: string[] }) => {
  const { recoveryCodes } = props
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Row>
        <Col span={24}>
          <Subtitle level={5} style={{ marginTop: '16px' }}>
            { $t({ defaultMessage: 'Backup authentication method' }) }
          </Subtitle>
        </Col>
        <Col span={24}>
          <UI.FieldLabel width='275px'>
            <UI.OtpLabel>
              {$t({ defaultMessage: 'Recovery Codes' })}
              {$t({ defaultMessage:
                  'User recovery codes to log in if you can’t receive a verification code via ' +
                  'email, SMS, or an auth app' })}
            </UI.OtpLabel>
            <Form.Item
              children={<UI.FieldTextLink onClick={()=>setVisible(true)}>
                {$t({ defaultMessage: 'See' })}
              </UI.FieldTextLink>
              }
            />
          </UI.FieldLabel>
        </Col>
      </Row>
      {visible && <RecoveryCodes
        visible={visible}
        setVisible={setVisible}
        recoveryCode={recoveryCodes}
      />}
    </>
  )
}
