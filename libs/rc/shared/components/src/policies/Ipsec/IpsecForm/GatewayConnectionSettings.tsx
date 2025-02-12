import { useEffect, useState } from 'react'

import { InputNumber, Space, Switch }    from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import Form                              from 'antd/lib/form'
import { useIntl }                       from 'react-intl'

import { GridCol, GridRow, Subtitle, Tooltip } from '@acx-ui/components'
import { QuestionMarkCircleOutlined }          from '@acx-ui/icons'

import { messageMapping } from './messageMapping'

// eslint-disable-next-line import/order
import { Ipsec, IpSecAdvancedOptionEnum } from '@acx-ui/rc/utils'

interface GatewayConnectionSettingsFormProps {
  initIpSecData?: Ipsec
}

export default function GatewayConnectionSettings (props: GatewayConnectionSettingsFormProps) {
  const { $t } = useIntl()
  const { initIpSecData } = props
  const [retryLimitEnabled, setRetryLimitEnabled] = useState(false)
  const [espReplayWindowEnabled, setEspReplayWindowEnabled] = useState(false)
  const [deadPeerDetectionDelayEnabled, setDeadPeerDetectionDelayEnabled] = useState(false)
  const [nattKeepAliveIntervalEnabled, setNattKeepAliveIntervalEnabled] = useState(false)
  const [ipCompressionEnabled, setIpCompressionEnabled] = useState(false)
  const [forceNATTEnabled, setForceNATTEnabled] = useState(false)

  useEffect(() => {
    if (initIpSecData) {
      if (IpSecAdvancedOptionEnum.ENABLED === initIpSecData.advancedOption?.ipcompEnable) {
        setIpCompressionEnabled(true)
      }
      if (IpSecAdvancedOptionEnum.ENABLED === initIpSecData.advancedOption?.enforceNatt) {
        setForceNATTEnabled(true)
      }
    }
  }, [initIpSecData])

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
            required={true}
            rules={[{
              required: true
            }]}
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          <Form.Item name={['advancedOption','dhcpOpt43Subcode']}
            style={{ marginTop: '-4px' }}
            initialValue={7}
            children={
              <InputNumber min={1} max={32} />
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
            children={
              <Switch
                checked={ipCompressionEnabled}
                data-testid='advOpt-ipcompEnable'
                onChange={async (checked: boolean) => {
                  setIpCompressionEnabled(checked)
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
            children={
              <Switch
                // eslint-disable-next-line max-len
                data-testid='advOpt-enforceNatt'
                checked={forceNATTEnabled}
                onChange={async (checked: boolean) => {
                  setForceNATTEnabled(checked)
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