import { Form, Slider, InputNumber, Space } from 'antd'
import { useIntl }                          from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import {
  ApRadioTypeEnum,
  channelSelectionMethodsOptions,
  txPowerAdjustmentOptions,
  SelectItemOption,
  bssMinRate6GOptions,
  mgmtTxRate6GOptions,
  txPowerAdjustment6GOptions,
  apChannelSelectionMethodsOptions,
  apChannelSelectionMethods6GOptions
} from './RadioSettingsContents'
import { RadioFormSelect } from './styledComponents'



const { useWatch } = Form

export function RadioSettingsForm (props:{
  radioType: ApRadioTypeEnum,
  radioDataKey: string[],
  disabled?: boolean,
  channelBandwidthOptions: SelectItemOption[],
  context?: string
  isUseVenueSettings?: boolean
}) {

  const { $t } = useIntl()
  const radio6GRateControlFeatureFlag = useIsSplitOn(Features.RADIO6G_RATE_CONTROL)
  const { radioType,
    disabled = false,
    radioDataKey,
    channelBandwidthOptions,
    context = 'venue',
    isUseVenueSettings = false
  } = props

  const methodFieldName = [...radioDataKey, 'method']
  const changeIntervalFieldName = [...radioDataKey, 'changeInterval']
  const scanIntervalFieldName = [...radioDataKey, 'scanInterval']
  const channelBandwidthFieldName = [...radioDataKey, 'channelBandwidth']
  const txPowerFieldName = [...radioDataKey, 'txPower']
  const bssMinRate6gFieldName = [...radioDataKey, 'bssMinRate6G']
  const mgmtTxRate6gFieldName = [...radioDataKey, 'mgmtTxRate6G']

  const channelSelectionOpts = (context === 'venue') ?
    channelSelectionMethodsOptions :
    (radioType === ApRadioTypeEnum.Radio6G) ?
      apChannelSelectionMethods6GOptions : apChannelSelectionMethodsOptions

  const [channelMethod] = [useWatch<string>(methodFieldName)]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatter (value: any) {
    return `${value}%`
  }

  return (
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Channel selection method:' })}
        name={methodFieldName}>
        <RadioFormSelect
          disabled={disabled || (context === 'venue' && radioType==='6G')}
          bordered={!isUseVenueSettings}
          showArrow={!isUseVenueSettings}
          className={isUseVenueSettings? 'readOnly' : undefined}
          options={channelSelectionOpts?.map(p =>
            ({ label: $t(p.label), value: p.value }))}
        />
      </Form.Item>
      <Form.Item
        label={$t({ defaultMessage: 'Channel Change Frequency:' })}
        name={changeIntervalFieldName}
        style={{ display: channelMethod === channelSelectionMethodsOptions[0].value ?
          'block' : 'none' }}
      >
        <Slider
          disabled={disabled || isUseVenueSettings}
          tipFormatter={formatter}
          style={{ width: '240px' }}
          min={1}
          max={100}
          marks={{ 1: '1%', 100: '100%' }}
        />
      </Form.Item>
      {context === 'venue' &&
        <Space>
          <Form.Item
            label={$t({ defaultMessage: 'Run background scan every:' })}
            name={scanIntervalFieldName}
            rules={[
              { required: true },
              { type: 'number', min: 1 },
              { type: 'number', max: 65535 }
            ]}
          >
            <InputNumber disabled={disabled} min={1} max={65535}/>
          </Form.Item>
          <div style={{ marginLeft: '-72px', paddingTop: '5px' }}>
            {$t({ defaultMessage: 'Seconds' })}
          </div>
        </Space>
      }
      <Form.Item
        label={$t({ defaultMessage: 'Bandwidth:' })}
        name={channelBandwidthFieldName}>
        <RadioFormSelect
          disabled={disabled}
          bordered={!isUseVenueSettings}
          showArrow={!isUseVenueSettings}
          open={isUseVenueSettings? false : undefined}
          className={isUseVenueSettings? 'readOnly' : undefined}
          options={channelBandwidthOptions}
        />
      </Form.Item>
      <Form.Item
        label={$t({ defaultMessage: 'Transmit Power adjustment:' })}
        name={txPowerFieldName}>
        <RadioFormSelect
          disabled={disabled}
          bordered={!isUseVenueSettings}
          showArrow={!isUseVenueSettings}
          className={isUseVenueSettings? 'readOnly' : undefined}
          options={(radioType === ApRadioTypeEnum.Radio6G)?
            txPowerAdjustment6GOptions : txPowerAdjustmentOptions}
        />
      </Form.Item>
      {(radioType === ApRadioTypeEnum.Radio6G && radio6GRateControlFeatureFlag) &&
      <>
        <Form.Item
          label={$t({ defaultMessage: 'BSS Min Rate:' })}
          name={bssMinRate6gFieldName}>
          <RadioFormSelect
            disabled={disabled}
            bordered={!isUseVenueSettings}
            showArrow={!isUseVenueSettings}
            className={isUseVenueSettings? 'readOnly' : undefined}
            options={bssMinRate6GOptions}
          />
        </Form.Item>
        <Form.Item
          label={$t({ defaultMessage: 'Mgmt Tx Rate:' })}
          name={mgmtTxRate6gFieldName}>
          <RadioFormSelect
            disabled={disabled}
            bordered={!isUseVenueSettings}
            showArrow={!isUseVenueSettings}
            className={isUseVenueSettings? 'readOnly' : undefined}
            options={mgmtTxRate6GOptions}
          />
        </Form.Item>
      </>
      }
    </>
  )
}
