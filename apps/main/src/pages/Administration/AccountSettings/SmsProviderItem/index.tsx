import { useEffect, useState } from 'react'

import { Form, Col, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'


import { Button, Card, showActionModal, Tooltip } from '@acx-ui/components'
import {
  useDeleteTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import { TenantAuthentications, TenantAuthenticationType } from '@acx-ui/rc/utils'

import { reloadAuthTable } from '../AppTokenFormItem/'
import { ButtonWrapper }   from '../AuthServerFormItem/styledComponents'

import { SetupSmsProviderDrawer } from './SetupSmsProviderDrawer'

interface SmsProviderProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
}

const SmsProviderItem = (props: SmsProviderProps) => {
  const { $t } = useIntl()
  const { tenantAuthenticationData } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [hasSmsConfigured, setSmsConfigured] = useState(false)
  const [authenticationData, setAuthenticationData] = useState<TenantAuthentications>()

  const [deleteTenantAuthentications]
  = useDeleteTenantAuthenticationsMutation()


  const onSetUpValue = () => {
    setEditMode(false)
    setDrawerVisible(true)
  }

  const ssoData = tenantAuthenticationData?.filter(n =>
    n.authenticationType === TenantAuthenticationType.saml ||
    n.authenticationType === TenantAuthenticationType.google_workspace)
  useEffect(() => {
    if (ssoData && ssoData.length > 0) {
      setSmsConfigured(true)
      setAuthenticationData(ssoData[0])
    } else {
      setSmsConfigured(false)
    }
  }, [ssoData])

  return ( <>
    <Row gutter={24} style={{ marginBottom: '15px' }}>
      <Col span={10}>
        <Form.Item
          colon={false}
          label={<>
            {$t({ defaultMessage: 'SMS Provider' })}
            <Tooltip.Question
              title={<>
                <div>{$t({ defaultMessage: 'The SMS Provider is utilized for SMS functionalities '
                 + 'across several applicable capabilities:' })}</div>
                <div>{$t({ defaultMessage: '- Captive Portal with Host Approval' })}</div>
                <div>{$t({ defaultMessage: '- Captive Portal Self Sign-In' })}</div>
                <div>{$t({ defaultMessage: '- Generating a New Guest User Password' })}</div>
                <div>{$t({ defaultMessage: '- Recipient of System Notifications' })}</div>
                <div>{$t({ defaultMessage: '- AI Notifications  ' })}</div>
              </>}
              placement='right'
            />
          </>}
          children={hasSmsConfigured &&
            <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
              <ButtonWrapper
                style={{ marginLeft: '10px' }}
                size={20}
              >
                <Button type='link'
                  key='editsso'
                  onClick={() => {
                    setEditMode(true)
                    setDrawerVisible(true)
                  }}>
                  {$t({ defaultMessage: 'Change' })}
                </Button>
                <Button type='link'
                  key='deletesso'
                  onClick={() => {
                    showActionModal({
                      title: $t({ defaultMessage: 'Remove SMS Provider' }),
                      type: 'confirm',
                      customContent: {
                        action: 'DELETE',
                        entityName: $t({ defaultMessage: 'sso' }),
                        // entityValue: name,
                        confirmationText: $t({ defaultMessage: 'Yes, Remove Provider' })
                      },
                      onOk: () => {
                        deleteTenantAuthentications({
                          params: { authenticationId: authenticationData?.id } })
                          .then()
                        reloadAuthTable(2)
                      }
                    })
                  }}>
                  {$t({ defaultMessage: 'Remove' })}
                </Button>
              </ButtonWrapper>
            </Space>
          }
        />

        {hasSmsConfigured && <Col style={{ width: '341px', paddingLeft: 0 }}>
          <Card type='solid-bg' >
            <div>
              <Form.Item
                colon={false}
                label={$t({ defaultMessage: 'Provider' })} />
              <h3 style={{ marginTop: '-18px' }}>
                {'Twillo'}</h3>
            </div>
            <div>
              <Form.Item
                colon={false}
                label={$t({ defaultMessage: 'Account SID' })} />
              <h3 style={{ marginTop: '-18px' }}>
                {'1234-5678-999'}</h3>
            </div>
            <div>
              <Form.Item
                colon={false}
                label={$t({ defaultMessage: 'Auth Token' })} />
              <h3 style={{ marginTop: '-18px' }}>
                {'****-****-****-****'}</h3>
            </div>
          </Card>
        </Col>
        }

        {!hasSmsConfigured && <Col style={{ width: '341px', paddingLeft: 0 }}>
          <Card type='solid-bg' >
            <Button
              type='link'
              size='small'
              onClick={onSetUpValue}>{$t({ defaultMessage: 'Set SMS Provider' })}</Button>
          </Card>
        </Col>
        }
      </Col>
    </Row>

    {drawerVisible && <SetupSmsProviderDrawer
      visible={drawerVisible}
      isEditMode={isEditMode}
      //   editData={authenticationsData as TenantAuthentications}
      setVisible={setDrawerVisible}
    />}
  </>
  )
}

export { SmsProviderItem }