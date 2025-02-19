import { useEffect, useState } from 'react'

import { Form, InputNumber, Space, Switch } from 'antd'
import Checkbox, { CheckboxChangeEvent }    from 'antd/lib/checkbox'
import { useIntl }                          from 'react-intl'

import { GridCol, GridRow, Subtitle, Tooltip } from '@acx-ui/components'
import { QuestionMarkCircleOutlined }          from '@acx-ui/icons'

import { messageMapping } from './messageMapping'

// eslint-disable-next-line import/order
import { Ipsec, IpSecAdvancedOptionEnum } from '@acx-ui/rc/utils'

interface GatewayConnectionSettingsFormProps {
  initIpSecData?: Ipsec,
  loadGwSettings: boolean,
  setLoadGwSettings: (state: boolean) => void
}

export default function GatewayConnectionSettings (props: GatewayConnectionSettingsFormProps) {
  const { $t } = useIntl()
  const { initIpSecData, loadGwSettings, setLoadGwSettings } = props
  const form = Form.useFormInstance()
  const [retryLimitEnabled, setRetryLimitEnabled] = useState(false)
  const [espReplayWindowEnabled, setEspReplayWindowEnabled] = useState(false)
  const [deadPeerDetectionDelayEnabled, setDeadPeerDetectionDelayEnabled] = useState(false)
  const [nattKeepAliveIntervalEnabled, setNattKeepAliveIntervalEnabled] = useState(false)
  const [ipCompressionEnabled, setIpCompressionEnabled] = useState(false)
  const [forceNATTEnabled, setForceNATTEnabled] = useState(false)

  useEffect(() => {
    console.log('initIpSecData', initIpSecData)
    const ipCompEnabled = form.getFieldValue(['advancedOption', 'ipcompEnable'])
    if (ipCompEnabled === IpSecAdvancedOptionEnum.ENABLED) {
      setIpCompressionEnabled(true)
    } else if (ipCompEnabled === IpSecAdvancedOptionEnum.DISABLED) {
      setIpCompressionEnabled(false)
    }
    const enforceNatt = form.getFieldValue(['advancedOption', 'enforceNatt'])
    if (enforceNatt === IpSecAdvancedOptionEnum.ENABLED) {
      setForceNATTEnabled(true)
    } else if (enforceNatt === IpSecAdvancedOptionEnum.DISABLED) {
      setForceNATTEnabled(false)
    }
    if (loadGwSettings && initIpSecData) {
      if (IpSecAdvancedOptionEnum.ENABLED === initIpSecData.advancedOption?.ipcompEnable) {
        setIpCompressionEnabled(true)
      } else if(IpSecAdvancedOptionEnum.DISABLED === initIpSecData.advancedOption?.ipcompEnable) {
        setIpCompressionEnabled(false)
      }
      if (IpSecAdvancedOptionEnum.ENABLED === initIpSecData.advancedOption?.enforceNatt) {
        setForceNATTEnabled(true)
      }
    }
    setLoadGwSettings(false)
  }, [initIpSecData])

  const onForceNattChange = (value: boolean) => {
    setForceNATTEnabled(value)
    if (value) {
      form.setFieldValue(['advancedOption', 'enforceNatt'], IpSecAdvancedOptionEnum.ENABLED)
    } else {
      form.setFieldValue(['advancedOption', 'enforceNatt'], IpSecAdvancedOptionEnum.DISABLED)
    }
  }

  const onIpCompChange = (value: boolean) => {
    setIpCompressionEnabled(value)
    if (value) {
      form.setFieldValue(['advancedOption', 'ipcompEnable'], IpSecAdvancedOptionEnum.ENABLED)
    } else {
      form.setFieldValue(['advancedOption', 'ipcompEnable'], IpSecAdvancedOptionEnum.DISABLED)
    }
  }

  return (
    <>
      <Subtitle level={3}>
        { $t({ defaultMessage: 'Gateway' }) }
      </Subtitle>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            label={
              <>
                {$t({ defaultMessage: 'DHCP Option 43 Sub Code for Security Gateway' })}
                <Tooltip title={$t(messageMapping.gateway_dhcp_option_tooltip)} placement='bottom'>
                  <QuestionMarkCircleOutlined />
                </Tooltip>
              </>
            }
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          <Form.Item name={['advancedOption','dhcpOpt43Subcode']}
            style={{ marginTop: '-4px' }}
            initialValue={7}
            children={
              <InputNumber min={3} max={243} />
            }
          />
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            initialValue={false}
            style={{ lineHeight: '50px' }}
            children={
              <>
                <Checkbox data-testid='retryLimitEnabled'
                  onChange={async (e: CheckboxChangeEvent) => {
                    setRetryLimitEnabled(e.target.checked)
                  }}
                  children={$t({ defaultMessage: 'Retry Limit' })} />
                <Tooltip.Question
                  title={$t(messageMapping.gateway_retry_tooltip)}
                  placement='bottom' />
              </>
            }
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          {retryLimitEnabled &&
            <Form.Item
              initialValue={false}
              style={{ lineHeight: '50px', marginTop: '-30px' }}
              children={
                <Space>
                  <Form.Item
                    label={' '}
                    data-testid='advOpt-retryLimit'
                    name={['advancedOption','retryLimit']}
                    initialValue={5}
                    children={
                      <InputNumber min={1} max={16} />
                    } />
                  <span> {$t({ defaultMessage: 'retries' })} </span>
                </Space>
              } />
          }
        </GridCol>
      </GridRow>
      <Subtitle level={3}>
        { $t({ defaultMessage: 'Connection' }) }
      </Subtitle>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            valuePropName='checked'
            initialValue={false}
            style={{ lineHeight: '50px' }}
            children={
              <>
                <Checkbox data-testid='espReplayWindowEnabled'
                  onChange={async (e: CheckboxChangeEvent) => {
                    setEspReplayWindowEnabled(e.target.checked)
                  }}
                  children={$t({ defaultMessage: 'ESP Replay Window' })} />
                <Tooltip.Question
                  title={$t(messageMapping.connection_esp_replay_window_tooltip)}
                  placement='bottom' />
              </>
            }
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          {espReplayWindowEnabled &&
            <Form.Item
              style={{ lineHeight: '50px', marginTop: '-30px' }}
              children={
                <Space>
                  <Form.Item
                    label={' '}
                    data-testid='advOpt-replayWindow'
                    name={['advancedOption','replayWindow']}
                    initialValue={32}
                    children={
                      <InputNumber min={1} max={32} />
                    } />
                  <span> {$t({ defaultMessage: 'packets' })} </span>
                </Space>
              }
            />
          }
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            label={
              <>
                {$t({ defaultMessage: 'IP Compression' })}
                <Tooltip
                  title={$t(messageMapping.connection_ip_compression_tooltip)}
                  placement='bottom'>
                  <QuestionMarkCircleOutlined />
                </Tooltip>
              </>
            }
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            label={' '}
            name={['advancedOption','ipcompEnable']}
            style={{ marginTop: '-28px' }}
            initialValue={false}
            children={
              <Switch
                checked={ipCompressionEnabled}
                data-testid='advOpt-ipcompEnable'
                onChange={async (checked: boolean) => {
                  onIpCompChange(checked)
                }}
              />
            }
          />
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            valuePropName='checked'
            style={{ lineHeight: '50px' }}
            children={
              <>
                <Checkbox data-testid='deadPeerDetectionDelayEnabled'
                  onChange={async (e: CheckboxChangeEvent) => {
                    setDeadPeerDetectionDelayEnabled(e.target.checked)
                  }}
                  children={$t({ defaultMessage: 'Dead Peer Detection Delay' })} />
                <Tooltip.Question
                  title={$t(messageMapping.connection_dead_peer_detection_delay_tooltip)}
                  placement='bottom' />
              </>
            }
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          {deadPeerDetectionDelayEnabled &&
            <Form.Item
              style={{ lineHeight: '50px', marginTop: '-30px' }}
              children={
                <Space>
                  <Form.Item
                    label={' '}
                    data-testid='advOpt-dpdDelay'
                    name={['advancedOption','dpdDelay']}
                    initialValue={1}
                    children={<InputNumber min={1} max={65536} />} />
                  <span> {$t({ defaultMessage: 'second(s)' })} </span>
                </Space>
              }
            />
          }
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            label={
              <>
                {$t({ defaultMessage: 'Force NAT-T' })}
                <Tooltip
                  title={$t(messageMapping.connection_force_nat_tooltip)}
                  placement='bottom'>
                  <QuestionMarkCircleOutlined />
                </Tooltip>
              </>
            }
            initialValue={false}
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            label={' '}
            name={['advancedOption','enforceNatt']}
            style={{ marginTop: '-28px' }}
            initialValue={false}
            children={
              <Switch
                // eslint-disable-next-line max-len
                data-testid='advOpt-enforceNatt'
                checked={forceNATTEnabled}
                onChange={async (checked: boolean) => {
                  onForceNattChange(checked)
                }} />
            } />
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            valuePropName='checked'
            style={{ lineHeight: '50px' }}
            children={
              <>
                <Checkbox data-testid='nattKeepAliveIntervalEnabled'
                  onChange={async (e: CheckboxChangeEvent) => {
                    setNattKeepAliveIntervalEnabled(e.target.checked)
                  }}
                  children={$t({ defaultMessage: 'NAT-T Keep Alive Interval' })} />
                <Tooltip.Question
                  title={$t(messageMapping.connection_nat_keep_alive_interval_tooltip)}
                  placement='bottom' />
              </>
            }
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          {nattKeepAliveIntervalEnabled &&
            <Form.Item
              style={{ lineHeight: '50px', marginTop: '-30px' }}
              children={
                <Space>
                  <Form.Item
                    label={' '}
                    data-testid='advOpt-keepAliveInterval'
                    initialValue={20}
                    name={['advancedOption','keepAliveInterval']}
                    children={<InputNumber min={1} max={65536}/>} />
                  <span> {$t({ defaultMessage: 'second(s)' })} </span>
                </Space>
              }
            />}
        </GridCol>
      </GridRow>
    </>
  )
}