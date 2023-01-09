import { useState } from 'react'

import { Col, List, Form, Row, Typography, Input } from 'antd'
import _                                           from 'lodash'
import { useIntl }                                 from 'react-intl'
import { useParams }                               from 'react-router-dom'
import styled                                      from 'styled-components/macro'

import { cssStr }       from '@acx-ui/components'
import { SpaceWrapper } from '@acx-ui/rc/components'
// import {
//   useGetRecoveryPassphraseQuery
// } from '@acx-ui/rc/services'
import { RecoveryPassphrase } from '@acx-ui/rc/utils'


import { ChangePassphraseDrawer } from './ChangePassphraseDrawer'
import { MessageMapping }         from './MessageMapping'

interface RecoveryPassphraseFormItemProps {
  className?:string;
  recoveryPassphraseData?: RecoveryPassphrase
}

const RecoveryPassphraseFormItem = styled((props:RecoveryPassphraseFormItemProps) => {
  const { $t } = useIntl()
  const { className, recoveryPassphraseData } = props
  // const params = useParams()
  const [openPassphraseDrawer, setOpenPassphraseDrawer] = useState(false)
  // const RecoveryPassphraseData = useGetRecoveryPassphraseQuery({ params })

  const onClickChangePassphrase = () => {
    setOpenPassphraseDrawer(true)
  }

  const hasAp = !_.isEmpty(recoveryPassphraseData)
  const passphraseData = recoveryPassphraseData?.psk.match(/.{1,4}/g)?.join(' ') ?? ''

  return (
    <>
      <Row gutter={24} className={className}>
        <Col span={12}>
          <Form.Item label={$t({ defaultMessage: 'Recovery Network Passphrase' })}>
            {hasAp ? (
              <SpaceWrapper justifycontent='flex-start'>
                <Form.Item
                  tooltip={$t(MessageMapping.recovery_passphrase_tooltip)}
                  noStyle
                >
                  <Input.Password
                    bordered={false}
                    value={passphraseData}
                  />
                </Form.Item>
                <Typography.Link onClick={onClickChangePassphrase}>
                  {$t({ defaultMessage: 'Change' })}
                </Typography.Link>
              </SpaceWrapper>
            ) :
              $t(MessageMapping.recovery_passphrase_no_aps_message)
            }
          </Form.Item>

          {hasAp && (
            <List
              split={false}
              dataSource={[
                $t(MessageMapping.recovery_passphrase_description_1),
                $t(MessageMapping.recovery_passphrase_description_2)
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text style={{ color: cssStr('--acx-neutrals-50') }}>
                    {item}
                  </Typography.Text>
                </List.Item>
              )}
            />
          )}
        </Col>
      </Row>
      <ChangePassphraseDrawer
        data={passphraseData}
        visible={openPassphraseDrawer}
        setVisible={setOpenPassphraseDrawer}
      />
    </>
  )
})`
  .ant-input-password.ant-input-affix-wrapper-borderless {
    width: 200px;

    & > input {
      text-align: center;
    }
  }
`

export { RecoveryPassphraseFormItem }