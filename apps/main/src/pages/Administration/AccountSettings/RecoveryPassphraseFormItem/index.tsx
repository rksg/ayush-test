import { useState } from 'react'

import {  EyeOutlined, EyeInvisibleOutlined }      from '@ant-design/icons'
import { Col, List, Form, Row, Typography, Input } from 'antd'
import _                                           from 'lodash'
import { useIntl }                                 from 'react-intl'
import styled                                      from 'styled-components/macro'


import { SpaceWrapper }       from '@acx-ui/rc/components'
import { RecoveryPassphrase } from '@acx-ui/rc/utils'
import { RolesEnum }          from '@acx-ui/types'
import { hasRoles }           from '@acx-ui/user'

import { MessageMapping } from '../MessageMapping'

import { ChangePassphraseDrawer } from './ChangePassphraseDrawer'
import * as UI                    from './styledComponents'

interface RecoveryPassphraseFormItemProps {
  className?:string;
  recoveryPassphraseData?: RecoveryPassphrase
}

const RecoveryPassphraseFormItem = styled((props:RecoveryPassphraseFormItemProps) => {
  const { $t } = useIntl()
  const { className, recoveryPassphraseData } = props
  const [openPassphraseDrawer, setOpenPassphraseDrawer] = useState(false)
  const hasPermission = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const onClickChangePassphrase = () => {
    setOpenPassphraseDrawer(true)
  }

  const passwordIconRender = (visible: boolean) => {
    return visible ? <EyeInvisibleOutlined/> : <EyeOutlined/>
  }

  const hasPassphrase = !_.isEmpty(recoveryPassphraseData)
  const passphraseData = recoveryPassphraseData?.psk.match(/.{1,4}/g)?.join(' ') ?? ''

  return (
    <>
      <Row gutter={24} className={className}>
        <Col span={12}>
          <Form.Item
            label={$t({ defaultMessage: 'Recovery Network Passphrase' })}
            tooltip={$t(MessageMapping.recovery_passphrase_tooltip)}
          >
            {hasPassphrase ? (
              <SpaceWrapper full justifycontent='flex-start'>
                <Form.Item
                  noStyle
                >
                  <Input.Password
                    bordered={false}
                    value={passphraseData}
                    iconRender={passwordIconRender}
                  />
                </Form.Item>
                {hasPermission &&
                  <Typography.Link onClick={onClickChangePassphrase}>
                    {$t({ defaultMessage: 'Change' })}
                  </Typography.Link>
                }
              </SpaceWrapper>
            ) :
              $t(MessageMapping.recovery_passphrase_no_aps_message)
            }
          </Form.Item>

          {hasPassphrase && (
            <List
              split={false}
              dataSource={[
                $t(MessageMapping.recovery_passphrase_description_1),
                $t(MessageMapping.recovery_passphrase_description_2)
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text className='description greyText'>
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
})`${UI.wrapperStyles}`

export { RecoveryPassphraseFormItem }