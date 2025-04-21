import React, { useEffect, useState } from 'react'

import { Form, Col, List, Row, Space, Typography, Input } from 'antd'
import { EChartsOption }                                  from 'echarts'
import ReactECharts                                       from 'echarts-for-react'
import { useIntl }                                        from 'react-intl'
import { useParams }                                      from 'react-router-dom'

import {
  Button,
  Card,
  cssNumber,
  cssStr,
  PasswordInput,
  showActionModal,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  administrationApi,
  useGetNotificationSmsProviderQuery,
  useGetNotificationSmsQuery,
  useUpdateNotificationSmsMutation
} from '@acx-ui/rc/services'
import {
  AdministrationUrlsInfo,
  NotificationSmsConfig,
  NotificationSmsUsage,
  SmsProviderType }
  from '@acx-ui/rc/utils'
import { store }     from '@acx-ui/store'
import { RolesEnum } from '@acx-ui/types'
import {
  getUserProfile,
  hasAllowedOperations,
  hasCrossVenuesPermission,
  hasRoles
} from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

import { ButtonWrapper }  from '../AuthServerFormItem/styledComponents'
import { MessageMapping } from '../MessageMapping'
import * as UI            from '../styledComponents'

import { SetupSmsProviderDrawer } from './SetupSmsProviderDrawer'

export interface SmsProviderData {
  providerType: SmsProviderType,
  providerData: NotificationSmsConfig
}

export const getProviderQueryParam = (providerType: SmsProviderType) => {
  switch(providerType) {
    case SmsProviderType.TWILIO:
      return 'twilios'
    case SmsProviderType.ESENDEX:
      return 'esendexes'
    case SmsProviderType.OTHERS:
      return 'others'
  }
  return ''
}

export const reloadSmsNotification = (timeoutSec?: number) => {
  const milisec = timeoutSec ? timeoutSec*1000 : 1000
  setTimeout(() => {
    store.dispatch(
      administrationApi.util.invalidateTags([
        { type: 'Administration', id: 'SMS_PROVIDER' }
      ]))
  }, milisec)
}

export const isTwilioFromNumber = (trilioValue: string) => {
  return (trilioValue[trilioValue.length-1] !== ']')
}

const SmsProviderItem = () => {
  const { $t } = useIntl()
  const { rbacOpsApiEnabled } = getUserProfile()
  const params = useParams()
  const [form] = Form.useForm()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [ruckusOneUsed, setRuckusOneUsed] = useState<number>(0)
  const [smsThreshold, setSmsThreshold] = useState<number>(80)
  const [smsProviderType, setSmsProviderType] = useState<SmsProviderType>()
  const [smsProviderData, setSmsProviderData] = useState<SmsProviderData>()
  const [smsProviderConfigured, setSmsProviderConfigured] = useState(false)
  const [isInGracePeriod, setIsInGracePeriod] = useState(false)
  const [isChangeThreshold, setIsChangeThreshold] = useState(false)
  const [submittableThreshold, setSubmittableThreshold] = useState<boolean>(true)
  const isGracePeriodToggleOn = useIsSplitOn(Features.NUVO_SMS_GRACE_PERIOD_TOGGLE)


  const hasPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([
      getOpsApi(AdministrationUrlsInfo.updateNotificationSms)
    ]) : hasCrossVenuesPermission() &&
      hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const FREE_SMS_POOL = 100

  const [ updateNotificationSms ] = useUpdateNotificationSmsMutation()

  const onSetUpValue = () => {
    setEditMode(false)
    setDrawerVisible(true)
  }

  const onSaveUtilization = async () => {
    const payload: NotificationSmsUsage = {
      threshold: form.getFieldValue('threshold'),
      provider: SmsProviderType.RUCKUS_ONE
    }
    updateNotificationSms({ params , payload: payload }).then()
    setIsChangeThreshold(false)
    reloadSmsNotification(2)
  }

  const selectedProvider = (selectedType: SmsProviderType) => {
    const payload: NotificationSmsUsage = {
      threshold: smsThreshold,
      provider: selectedType
    }
    updateNotificationSms({ params , payload: payload }).then()
    setSmsProviderConfigured(false)
    reloadSmsNotification(2)
  }

  const smsUsage = useGetNotificationSmsQuery({ params })
  const smsProvider = useGetNotificationSmsProviderQuery(
    { params: { provider: getProviderQueryParam(smsProviderType as SmsProviderType) } },
    { skip: !smsProviderConfigured })

  useEffect(() => {
    if (smsUsage) {
      const usedSms = smsUsage.data?.ruckusOneUsed || 0
      const providerType = smsUsage.data?.provider
      setRuckusOneUsed(usedSms)
      setSmsThreshold(smsUsage.data?.threshold ?? 80)
      setSmsProviderType(providerType ?? SmsProviderType.SMSProvider_UNSET)
      setSmsProviderConfigured((providerType && providerType !== SmsProviderType.RUCKUS_ONE &&
        providerType !== SmsProviderType.SMSProvider_UNSET) ? true : false)
      setIsInGracePeriod(usedSms >= FREE_SMS_POOL && isGracePeriodToggleOn)
    }
    if(smsProvider && smsProvider.data) {
      setSmsProviderData({
        providerType: smsProviderType as SmsProviderType,
        providerData: smsProvider.data as NotificationSmsConfig
      })
    }

  }, [smsUsage, smsProvider, smsProviderConfigured])

  const data = ruckusOneUsed >= FREE_SMS_POOL
    ? [
      { value: 100, name: 'usage', color: cssStr('--acx-accents-blue-50') }
    ]
    : (smsThreshold > ruckusOneUsed
      ? [
        { value: ruckusOneUsed, name: 'usage', color: cssStr('--acx-accents-blue-50') },
        { value: smsThreshold - ruckusOneUsed,
          name: 'remaining1', color: cssStr('--acx-neutrals-50') },
        { value: 1, name: 'threshold', color: cssStr('--acx-semantics-red-70') },
        { value: FREE_SMS_POOL - smsThreshold,
          name: 'remaining2', color: cssStr('--acx-neutrals-50') }
      ]
      : [
        { value: smsThreshold, name: 'usage', color: cssStr('--acx-semantics-red-70') },
        { value: 1, name: 'threshold', color: cssStr('--acx-neutrals-50') },
        { value: ruckusOneUsed - smsThreshold,
          name: 'remaining1', color: cssStr('--acx-semantics-red-70') },
        { value: FREE_SMS_POOL - ruckusOneUsed,
          name: 'remaining2', color: cssStr('--acx-neutrals-50') }
      ]
    )

  const getOption = (text: string, showTotal: boolean, subtext?: string) => {
    const option: EChartsOption = {
      tooltip: { show: false },
      title: [
        {
          show: true,
          text: text,
          left: showTotal ? 24 : 'center',
          top: 'center',
          textVerticalAlign: 'middle',
          textStyle: {
            color: cssStr('--acx-primary-black'),
            fontFamily: cssStr('--acx-neutral-brand-font'),
            fontSize: cssNumber('--acx-body-2-font-size') }
        },
        {
          show: showTotal,
          text: '/100',
          right: 22,
          top: 'center',
          textVerticalAlign: 'middle',
          textStyle: {
            color: cssStr('--acx-primary-black'),
            fontFamily: cssStr('--acx-neutral-brand-font'),
            fontSize: cssNumber('--acx-body-4-font-size'),
            fontWeight: cssNumber('--acx-body-font-weight') }
        },
        {
          show: true,
          subtext: subtext,
          left: 'center',
          top: 'center',
          itemGap: 8,
          subtextStyle: {
            color: cssStr('--acx-primary-black'),
            fontFamily: cssStr('--acx-neutral-brand-font'),
            fontSize: cssNumber('--acx-body-5-font-size'),
            fontWeight: cssNumber('--acx-body-font-weight'),
            width: 50 }
        }],
      color: data.map(series => series.color),
      series: [
        {
          animation: false,
          data,
          type: 'pie',
          cursor: 'auto',
          center: ['50%', '50%'],
          radius: ['58%', '82%'],
          avoidLabelOverlap: true,
          label: { show: false },
          emphasis: {
            disabled: true
          },
          labelLine: { show: false }
        }
      ]
    }
    return option
  }


  const SmsProviderDualButtons = () => {
    return <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      <ButtonWrapper
        style={{ marginLeft: '10px' }}
        size={20}
      >
        <Button type='link'
          key='editProvider'
          disabled={!hasPermission}
          onClick={() => {
            setEditMode(true)
            setDrawerVisible(true)
          }}>
          {$t({ defaultMessage: 'Change' })}
        </Button>
        <Button type='link'
          key='deleteProvider'
          disabled={!hasPermission}
          onClick={() => {
            showActionModal({
              title: $t({ defaultMessage: 'Remove SMS Provider' }),
              type: 'confirm',
              content: $t(MessageMapping.delete_sms_provider_msg),
              okText: $t({ defaultMessage: 'Yes, Remove Provider' }),
              cancelText: $t({ defaultMessage: 'No, Keep Provider' }),
              onOk: () => {
                const payload: NotificationSmsUsage = {
                  threshold: smsThreshold,
                  provider: SmsProviderType.SMSProvider_UNSET
                }
                updateNotificationSms({ params: params, payload: payload })
                  .then()
                reloadSmsNotification(2)
              }
            })
          }}>
          {$t({ defaultMessage: 'Remove' })}
        </Button>
      </ButtonWrapper>
    </Space>
  }

  const ProviderTwillo = () => {
    return <Col style={{ width: '381px', paddingLeft: 0 }}>
      <Card type='solid-bg' >
        <UI.ProviderWrapper direction='vertical' size={5}>
          <div>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'Provider' })}/>
            <h3>{'Twilio'}</h3>
          </div>
          <div>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'Account SID' })}/>
            <h3>{smsProvider.data?.accountSid}</h3>
          </div>
          <div>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'Auth Token' })}
            />
            <PasswordInput
              bordered={false}
              value={smsProvider.data?.authToken}
              style={{ padding: '0px' }}
            />
          </div>
          <div>
            <Form.Item
              colon={false}
              label={isTwilioFromNumber(smsProvider.data?.fromNumber ?? '')
                ? $t({ defaultMessage: 'Phone Number' })
                : $t({ defaultMessage: 'Message Service' })}/>
            <h3>{smsProvider.data?.fromNumber}</h3>
          </div>
          {smsProvider.data?.enableWhatsapp && <div>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'WhatsApp Authentication Template SID' })}/>
            <h3>{smsProvider.data?.authTemplateSid}</h3>
          </div>}
        </UI.ProviderWrapper>
      </Card>
    </Col>
  }

  const ProviderEsendex = () => {
    return <Col style={{ width: '381px', paddingLeft: 0 }}>
      <Card type='solid-bg'>
        <UI.ProviderWrapper direction='vertical' size={5}>
          <div>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'Provider' })} />
            <h3>{'Esendex'}</h3>
          </div>
          <div>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'API Token' })}
            />
            <PasswordInput
              bordered={false}
              value={smsProvider.data?.apiKey}
              style={{ padding: '0px' }}
            />
          </div>
        </UI.ProviderWrapper>
      </Card>
    </Col>
  }

  const ProviderOthers = () => {
    return <Col style={{ width: '381px', paddingLeft: 0 }}>
      <Card type='solid-bg' >
        <UI.ProviderWrapper direction='vertical' size={5}>
          <div>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'Provider' })} />
            <h3>{'Other'}</h3>
          </div>
          <div>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'API Token' })}
            />
            <PasswordInput
              bordered={false}
              value={smsProvider.data?.apiKey}
              style={{ padding: '0px' }}
            />
          </div>
          <div>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'Send URL' })}
            />
            <h3>{smsProvider.data?.url}</h3>
          </div>
        </UI.ProviderWrapper>
      </Card>
    </Col>
  }

  const DisplaySmsProvider = () => {
    return <Col style={{ width: '381px', paddingLeft: 0 }}>
      {smsProviderType === SmsProviderType.TWILIO && <ProviderTwillo/>}
      {smsProviderType === SmsProviderType.ESENDEX && <ProviderEsendex/>}
      {smsProviderType === SmsProviderType.OTHERS && <ProviderOthers/>}
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
                <Space direction='vertical' size={0}>
                  <ReactECharts
                    {...{
                      style: { width: 100, height: 100 }
                    }}
                    opts={{ renderer: 'svg' }}
                    option={
                      getOption(ruckusOneUsed.toString(),ruckusOneUsed < FREE_SMS_POOL,'SMS Sent')
                    } />
                </Space>
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
                      <Typography.Text className='darkGreyText'>
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
            <Space direction='vertical' size={0}>
              <ReactECharts
                {...{
                  style: { width: 100, height: 100 }
                }}
                opts={{ renderer: 'svg' }}
                option={getOption(ruckusOneUsed.toString(), false, 'SMS Sent')} />
            </Space>
          </div>
          <div style={{ float: 'right', marginTop: '15px' }}>
            <List
              split={false}
              dataSource={[
                $t({ defaultMessage: 'Attention! RUCKUS SMS pool for Captive' }),
                $t({ defaultMessage: 'Portal Self Sign-In is depleted. To avoid' }),
                $t({ defaultMessage: 'service disruption, please set up an SMS' }),
                $t({ defaultMessage: 'Provider before {graceEndDate}.' },
                  { graceEndDate: <b>{'October 31, 2024'}</b> }
                )
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text className='darkGreyText'>
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
        style={{ marginTop: '8px', marginBottom: 0, fontWeight: 600 }}
        colon={false}
        label={$t({ defaultMessage: 'Utilization Alert Threshold' })}
      />
      {!isChangeThreshold && <div>
        <label>{smsThreshold}%</label>
        <Button
          style={{ marginLeft: '40px' }}
          type='link'
          size='small'
          disabled={!hasPermission}
          onClick={() => { setIsChangeThreshold(true) }}>{$t({ defaultMessage: 'Change' })}</Button>
      </div>}
      {isChangeThreshold && <div>
        <Form.Item
          name='threshold'
          noStyle
          initialValue={smsThreshold}
          validateFirst
          rules={[
            { validator: (_, val) => {
              if (val >= 50 && val <= 100) {
                setSubmittableThreshold(true)
                return Promise.resolve()
              } else {
                setSubmittableThreshold(false)
                return Promise.reject()
              }}
            }
          ]}
          children={
            <Input
              type='number'
              min={50}
              max={100}
              style={{ padding: 3, width: '50px', height: '28px' }}
            />
          }
        />
        <Button
          style={{ paddingBottom: 10, marginLeft: '20px' }}
          type='link'
          size='small'
          disabled={submittableThreshold !== true}
          onClick={() => { onSaveUtilization() }}>{$t({ defaultMessage: 'Save' })}</Button>
        <Button
          style={{ paddingBottom: 10, marginLeft: '20px' }}
          type='link'
          size='small'
          onClick={() => {
            setSubmittableThreshold(true)
            form.setFieldValue('threshold', smsThreshold)
            setIsChangeThreshold(false)
          }}>{$t({ defaultMessage: 'Cancel' })}
        </Button>
        {(submittableThreshold !== true) &&
          <div style={{ marginTop: '4px', color: 'var(--acx-semantics-red-60)' }}>
            {$t({ defaultMessage: 'Threshold must be between 50 and 100' })}
          </div>
        }
      </div>}
    </>
  }

  return ( <>
    <Row gutter={24} style={{ marginBottom: '15px' }}>
      <Col span={10}>
        <Form form={form}>
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
                disabled={!hasPermission}
                onClick={onSetUpValue}>{$t({ defaultMessage: 'Set SMS Provider' })}</Button>
            </Card>
          </Col>
          }

          {!isGracePeriodToggleOn && (ruckusOneUsed >= FREE_SMS_POOL ||
            smsProviderType === SmsProviderType.SMSProvider_UNSET ) && !smsProviderConfigured
          && <List
            style={{ marginTop: '15px', marginBottom: 0 }}
            split={false}
            dataSource={[
              $t({ defaultMessage:
                    'The SMS pool provided by RUCKUS has been depleted. We recommend' }),
              $t({ defaultMessage: 'setting up an SMS provider promptly.' })
            ]}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text className='greyText'>
                  {item}
                </Typography.Text>
              </List.Item>
            )}
          />}

          {!smsProviderConfigured && (ruckusOneUsed < FREE_SMS_POOL || isInGracePeriod) &&
           smsProviderType === SmsProviderType.RUCKUS_ONE && <FreeSmsPool/>}
        </Form>
      </Col>
    </Row>

    {drawerVisible && <SetupSmsProviderDrawer
      visible={drawerVisible}
      isEditMode={isEditMode}
      editData={smsProviderData}
      setVisible={setDrawerVisible}
      setSelected={selectedProvider}
    />}
  </>
  )
}

export { SmsProviderItem }
