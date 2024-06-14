import { useEffect, useState } from 'react'

import { Form, Col, List, Row, Space, Typography } from 'antd'
import { useIntl }                                 from 'react-intl'
import { useParams }                               from 'react-router-dom'


import { Button, Card, cssStr, DonutChart, showActionModal, Tooltip } from '@acx-ui/components'
import {
  useGetNotificationSmsQuery,
  useUpdateNotificationSmsMutation
} from '@acx-ui/rc/services'

import { reloadAuthTable } from '../AppTokenFormItem/'
import { ButtonWrapper }   from '../AuthServerFormItem/styledComponents'

import { SetupSmsProviderDrawer } from './SetupSmsProviderDrawer'

const SmsProviderItem = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [ruckusOneUsed, setRuckusOneUsed] = useState<number>(0)
  const [smsThreshold, setSmsThreshold] = useState<number>(80)
  const [smsProvider, setSmsProvider] = useState<string>('')
  const [smsProviderConfigured, setSmsProviderConfigured] = useState(false)
  const [isInGracePeriod, setIsInGracePeriod] = useState(false)
  const [freeSmsPool, setFreeSmsPool] = useState(true)

  const FREE_SMS_POOL = 100

  const [updateNotificationSms] = useUpdateNotificationSmsMutation()

  const onSetUpValue = () => {
    setEditMode(false)
    setDrawerVisible(true)
  }

  const smsUsage = useGetNotificationSmsQuery({ params })

  useEffect(() => {
    if (smsUsage) {
      const usedSms = 12//smsUsage.data?.ruckusOneUsed || 0
      setRuckusOneUsed(usedSms)
      setSmsThreshold(smsUsage.data?.thredshold ?? 80)
      setSmsProvider(smsUsage.data?.provider ?? '')
      setSmsProviderConfigured(smsUsage.data?.provider ? true : false)
      setIsInGracePeriod(usedSms > FREE_SMS_POOL)
      setFreeSmsPool(true)
    }
  }, [smsUsage])

  const data = ruckusOneUsed > FREE_SMS_POOL
    ? [
      { value: 100, name: 'usage', color: cssStr('--acx-accents-blue-50') }
    ]
    : [
      { value: ruckusOneUsed, name: 'usage', color: cssStr('--acx-accents-blue-50') },
      { value: smsThreshold - ruckusOneUsed,
        name: 'remaining1', color: cssStr('--acx-neutrals-50') },
      { value: 2, name: 'threshold', color: cssStr('--acx-semantics-red-70') },
      { value: FREE_SMS_POOL - smsThreshold,
        name: 'remaining2', color: cssStr('--acx-neutrals-50') }
    ]

  const SmsProviderDualButtons = () => {
    return <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      <ButtonWrapper
        style={{ marginLeft: '10px' }}
        size={20}
      >
        <Button type='link'
          key='editProvider'
          onClick={() => {
            setEditMode(true)
            setDrawerVisible(true)
          }}>
          {$t({ defaultMessage: 'Change' })}
        </Button>
        <Button type='link'
          key='deleteProvider'
          onClick={() => {
            showActionModal({
              title: $t({ defaultMessage: 'Remove SMS Provider' }),
              type: 'confirm',
              customContent: {
                action: 'DELETE',
                entityName: $t({ defaultMessage: 'sms' }),
                // entityValue: name,
                confirmationText: $t({ defaultMessage: 'Yes, Remove Provider' })
              },
              onOk: () => {
                updateNotificationSms({ params })
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

  const DisplaySmsProvider = () => {
    return <Col style={{ width: '381px', paddingLeft: 0 }}>
      <Card type='solid-bg' >
        <div>
          <Form.Item
            colon={false}
            label={$t({ defaultMessage: 'Provider' })} />
          <h3 style={{ marginTop: '-18px' }}>
            {smsProvider}</h3>
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

  const FreeSmsPool = () => {
    return <div>
      <Form.Item
        style={{ marginTop: '10px', marginBottom: 0 }}
        colon={false}
        label={$t({ defaultMessage: 'Free SMS Pool' })}
      />
      {isInGracePeriod ? <InGracePeriod/> :
        <Col style={{ width: '381px', paddingLeft: 0 }}>
          <Card type='solid-bg' >
            <div>
              <div style={{ float: 'left' }}>
                <DonutChart
                  showLegend={false}
                  showTotal={false}
                  style={{ width: 100, height: 100 }}
                  title={ruckusOneUsed + '/100'}
                  value={undefined}
                  size='x-large'
                  data={data}
                />
              </div>
              <div style={{ float: 'right', marginTop: '15px' }}>
                <List
                  split={false}
                  dataSource={[
                    $t({ defaultMessage: 'This account has a 100 SMS pool for' }),
                    $t({ defaultMessage: 'testing and trials. Once the pool has' }),
                    $t({ defaultMessage: 'been exhausted, an SMS provider' }),
                    $t({ defaultMessage: 'account must be set up.' })
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Typography.Text className='description darkGreyText'>
                        {item}
                      </Typography.Text>
                    </List.Item>
                  )}
                />
                <UtilizationAlertThreshold/>
              </div>
            </div>
          </Card>
        </Col>}
    </div>
  }

  const InGracePeriod = () => {
    return <Col style={{ width: '381px', paddingLeft: 0 }}>
      <Card type='solid-bg' >
        <div>
          <div style={{ float: 'left' }}>
            <DonutChart
              showLegend={false}
              showTotal={false}
              style={{ width: 100, height: 100 }}
              title={ruckusOneUsed.toString()}
              value={undefined}
              size='x-large'
              data={data}
            />
          </div>
          <div style={{ float: 'right', marginTop: '15px' }}>
            <List
              split={false}
              dataSource={[
                $t({ defaultMessage: 'Attention! RUCKUS SMS pool for Captive' }),
                $t({ defaultMessage: 'Portal Self Sign-In is depleted. To avoid' }),
                $t({ defaultMessage: 'service disruption, please set up an SMS' }),
                $t({ defaultMessage: 'Provider before August 12, 2024.' })
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text className='description darkGreyText'>
                    {item}
                  </Typography.Text>
                </List.Item>
              )}
            />
          </div>
        </div>
      </Card>
    </Col>
  }

  const UtilizationAlertThreshold = () => {
    return <>
      <Form.Item
        style={{ marginTop: '10px', marginBottom: 0 }}
        colon={false}
        label={$t({ defaultMessage: 'Utilization Alert Threshold' })}
      />
      <Button
        type='link'
        size='small'
        onClick={onSetUpValue}>{$t({ defaultMessage: 'Change' })}</Button>
    </>
  }

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
          children={smsProviderConfigured && <SmsProviderDualButtons/>}
        />

        {smsProviderConfigured && <DisplaySmsProvider/>}

        {!smsProviderConfigured &&
          <Col style={{ width: '381px', paddingLeft: 0 }}>
            <Card type='solid-bg' >
              <Button
                type='link'
                size='small'
                onClick={onSetUpValue}>{$t({ defaultMessage: 'Set SMS Provider' })}</Button>
            </Card>
          </Col>
        }

        {!freeSmsPool && <List
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
        />}

        {!smsProviderConfigured && freeSmsPool && <FreeSmsPool/>}
      </Col>
    </Row>

    {drawerVisible && <SetupSmsProviderDrawer
      visible={drawerVisible}
      isEditMode={isEditMode}
      setVisible={setDrawerVisible}
    />}
  </>
  )
}

export { SmsProviderItem }