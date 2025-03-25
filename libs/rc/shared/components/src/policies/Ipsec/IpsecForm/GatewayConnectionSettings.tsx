import { useEffect, useState } from 'react'

import { Form, InputNumber, Space, Switch } from 'antd'
import Checkbox, { CheckboxChangeEvent }    from 'antd/lib/checkbox'
import { useIntl }                          from 'react-intl'

import { GridCol, GridRow, Subtitle, Tooltip } from '@acx-ui/components'
import { QuestionMarkCircleOutlined }          from '@acx-ui/icons'
import { Ipsec, IpSecAdvancedOptionEnum }      from '@acx-ui/rc/utils'

import { messageMapping } from './messageMapping'


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
  const [ipCompressionEnabled, setIpCompressionEnabled] = useState(IpSecAdvancedOptionEnum.DISABLED)
  const [forceNATTEnabled, setForceNATTEnabled] = useState(IpSecAdvancedOptionEnum.DISABLED)

  useEffect(() => {
    const ipCompEnabled = form.getFieldValue(['advancedOption', 'ipcompEnable'])
    setIpCompressionEnabled(ipCompEnabled)

    const enforceNatt = form.getFieldValue(['advancedOption', 'enforceNatt'])
    setForceNATTEnabled(enforceNatt)

    const retryLimitEnabledChk = form.getFieldValue('retryLimitEnabledCheckbox')
    setRetryLimitEnabled(retryLimitEnabledChk)

    const espReplayWindowEnabledChk = form.getFieldValue('espReplayWindowEnabledCheckbox')
    setEspReplayWindowEnabled(espReplayWindowEnabledChk)

    const deadPeerDetectionDelayEnabledChk =
      form.getFieldValue('deadPeerDetectionDelayEnabledCheckbox')
    setDeadPeerDetectionDelayEnabled(deadPeerDetectionDelayEnabledChk)

    const keepAliveIntvalEnabledChk = form.getFieldValue('nattKeepAliveIntervalEnabledCheckbox')
    setNattKeepAliveIntervalEnabled(keepAliveIntvalEnabledChk)
    if (loadGwSettings && initIpSecData) {
      if (initIpSecData.advancedOption?.ipcompEnable) {
        setIpCompressionEnabled(initIpSecData.advancedOption?.ipcompEnable)
      }
      if (initIpSecData.advancedOption?.enforceNatt) {
        setForceNATTEnabled(initIpSecData.advancedOption?.enforceNatt)
      }
      if (initIpSecData.advancedOption?.retryLimit
          && initIpSecData.advancedOption?.retryLimit !== 0) {
        setRetryLimitEnabled(true)
        form.setFieldValue('retryLimitEnabledCheckbox', true)
      }
      if (initIpSecData.advancedOption?.replayWindow
        && initIpSecData.advancedOption?.replayWindow !== 0) {
        setEspReplayWindowEnabled(true)
        form.setFieldValue('espReplayWindowEnabledCheckbox', true)
      }
      if (initIpSecData.advancedOption?.dpdDelay
        && initIpSecData.advancedOption?.dpdDelay !== 0) {
        setDeadPeerDetectionDelayEnabled(true)
        form.setFieldValue('deadPeerDetectionDelayEnabledCheckbox', true)
      }
      if (initIpSecData.advancedOption?.keepAliveInterval
        && initIpSecData.advancedOption?.keepAliveInterval !== 0) {
        setNattKeepAliveIntervalEnabled(true)
        form.setFieldValue('nattKeepAliveIntervalEnabledCheckbox', true)
      }

    }
    setLoadGwSettings(false)
  }, [initIpSecData])

  const onForceNattChange = (value: boolean) => {
    if (value) {
      setForceNATTEnabled(IpSecAdvancedOptionEnum.ENABLED)
      form.setFieldValue(['advancedOption', 'enforceNatt'], IpSecAdvancedOptionEnum.ENABLED)
    } else {
      setForceNATTEnabled(IpSecAdvancedOptionEnum.DISABLED)
      form.setFieldValue(['advancedOption', 'enforceNatt'], IpSecAdvancedOptionEnum.DISABLED)
    }
  }

  const onIpCompChange = (value: boolean) => {
    if (value) {
      setIpCompressionEnabled(IpSecAdvancedOptionEnum.ENABLED)
      form.setFieldValue(['advancedOption', 'ipcompEnable'], IpSecAdvancedOptionEnum.ENABLED)
    } else {
      setIpCompressionEnabled(IpSecAdvancedOptionEnum.DISABLED)
      form.setFieldValue(['advancedOption', 'ipcompEnable'], IpSecAdvancedOptionEnum.DISABLED)
    }
  }

  return (
    <>
      <Subtitle level={3} style={{ height: '40px' }}>
        { $t({ defaultMessage: 'Gateway' }) }
      </Subtitle>
      <GridRow style={{ height: '60px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            style={{ marginTop: 'px' }}
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
      <GridRow style={{ height: '60px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            style={{ marginTop: '-5px' }}
            children={
              <>
                <Checkbox
                  checked={retryLimitEnabled}
                  data-testid='retryLimitEnabled'
                  onChange={async (e: CheckboxChangeEvent) => {
                    setRetryLimitEnabled(e.target.checked)
                    form.setFieldValue('retryLimitEnabledCheckbox', e.target.checked)
                  }}
                  children={
                    <div style={{ color: 'var(--acx-neutrals-60)' }}>
                      {$t({ defaultMessage: 'Retry Limit' })}
                    </div>
                  } />
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
              style={{ marginTop: '-27px' }}
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
      <Subtitle level={3} style={{ height: '40px' }}>
        { $t({ defaultMessage: 'Connection' }) }
      </Subtitle>
      <GridRow style={{ height: '60px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            valuePropName='checked'
            initialValue={false}
            // style={{ lineHeight: '50px' }}
            children={
              <>
                <Checkbox data-testid='espReplayWindowEnabled'
                  checked={espReplayWindowEnabled}
                  onChange={async (e: CheckboxChangeEvent) => {
                    setEspReplayWindowEnabled(e.target.checked)
                    form.setFieldValue('espReplayWindowEnabledCheckbox', e.target.checked)
                  }}
                  children={
                    <div style={{ color: 'var(--acx-neutrals-60)' }}>
                      {$t({ defaultMessage: 'ESP Replay Window' })}
                    </div>
                  } />
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
              style={{ marginTop: '-22px' }}
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
      <GridRow style={{ height: '60px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            style={{ marginTop: '8px' }}
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
            style={{ marginTop: '-19px' }}
            initialValue={ipCompressionEnabled}
            children={
              <Switch
                checked={ipCompressionEnabled === IpSecAdvancedOptionEnum.ENABLED ? true : false}
                data-testid='advOpt-ipcompEnable'
                onChange={async (checked: boolean) => {
                  onIpCompChange(checked)
                }}
              />
            }
          />
        </GridCol>
      </GridRow>
      <GridRow style={{ height: '60px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            valuePropName='checked'
            initialValue={false}
            style={{ marginTop: '5px' }}
            children={
              <>
                <Checkbox data-testid='deadPeerDetectionDelayEnabled'
                  checked={deadPeerDetectionDelayEnabled}
                  onChange={async (e: CheckboxChangeEvent) => {
                    setDeadPeerDetectionDelayEnabled(e.target.checked)
                    form.setFieldValue('deadPeerDetectionDelayEnabledCheckbox', e.target.checked)
                  }}
                  children={
                    <div style={{ color: 'var(--acx-neutrals-60)' }}>
                      {$t({ defaultMessage: 'Dead Peer Detection Delay' })}
                    </div>
                  } />
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
              style={{ marginTop: '-17px' }}
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
      <GridRow style={{ height: '60px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            style={{ marginTop: '10px' }}
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
            style={{ marginTop: '-17px' }}
            initialValue={forceNATTEnabled}
            children={
              <Switch
                // eslint-disable-next-line max-len
                data-testid='advOpt-enforceNatt'
                checked={forceNATTEnabled===IpSecAdvancedOptionEnum.ENABLED ? true : false}
                onChange={async (checked: boolean) => {
                  onForceNattChange(checked)
                }} />
            } />
        </GridCol>
      </GridRow>
      <GridRow style={{ height: '60px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            style={{ marginTop: '5px' }}
            valuePropName='checked'
            children={
              <>
                <Checkbox data-testid='nattKeepAliveIntervalEnabled'
                  checked={nattKeepAliveIntervalEnabled}
                  onChange={async (e: CheckboxChangeEvent) => {
                    setNattKeepAliveIntervalEnabled(e.target.checked)
                    form.setFieldValue('nattKeepAliveIntervalEnabledCheckbox', e.target.checked)
                  }}
                  children={
                    <div style={{ color: 'var(--acx-neutrals-60)' }}>
                      {$t({ defaultMessage: 'NAT-T Keep Alive Interval' })}
                    </div>
                  } />
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
              style={{ marginTop: '-17px' }}
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