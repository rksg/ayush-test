import { useEffect, useState } from 'react'

import { Form, Col, List, Row, Space, Typography } from 'antd'
import { useIntl }                                 from 'react-intl'
import AutoSizer                                   from 'react-virtualized-auto-sizer'


import { Button, Card, cssStr, DonutChart, showActionModal, Tooltip } from '@acx-ui/components'
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

  const data = [
    { value: 30000, name: 'In Setup Phase', color: cssStr('--acx-accents-blue-50') },
    { value: 3322, name: 'Temporarily Degraded', color: cssStr('--acx-neutrals-50') },
    { value: 800, name: 'Requires Attention', color: cssStr('--acx-semantics-red-70') },
    { value: 4322, name: 'Temporarily Degraded', color: cssStr('--acx-neutrals-50') }
  ]

  return ( <>
    <Row gutter={24} style={{ marginBottom: '15px' }}>
      <Col span={10}>
        <Form.Item
          style={{ marginBottom: 0 }}
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

        {/* <Form.Item
          style={{ marginTop: '10px', marginBottom: 0 }}
          colon={false}
          label={$t({ defaultMessage: 'The SMS pool provided by RUCKUS has been depleted. We recommend'
           + 'setting up an SMS provider promptly.' })}
        /> */}
        <List
          style={{ marginTop: '15px', marginBottom: 0 }}
          split={false}
          dataSource={[
            $t({ defaultMessage:
                    'The SMS pool provided by RUCKUS has been depleted. We recommend' }),
            $t({ defaultMessage: 'setting up an SMS provider promptly.' })
          ]}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text className='description greyText'>
                {item}
              </Typography.Text>
            </List.Item>
          )}
        />

        <Form.Item
          style={{ marginTop: '10px', marginBottom: 0 }}
          colon={false}
          label={$t({ defaultMessage: 'Free SMS Pool' })}
        />
        {<Col style={{ width: '341px', paddingLeft: 0 }}>
          <Card type='solid-bg' >
            <div style={{ width: 100, height: 100 }}>
              {/* <Card title='Venues'> */}
              <AutoSizer>
                {({ height, width }) => (
                  <DonutChart
                    showLegend={false}
                    style={{ width, height }}
                    title='66 / 100'
                    // subTitle={'This is very long subtitle and it should go to next line'}
                    //   tooltipFormat={defineMessage({
                    //     defaultMessage: `{name}: <b>{formattedValue} {value, plural,
                    //       one {Client}
                    //       other {Clients}
                    //     }</b> ({formattedPercent})`
                    //   })}
                    // dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
                    data={data}/>
                )}
              </AutoSizer>
              {/* </Card> */}
            </div>
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