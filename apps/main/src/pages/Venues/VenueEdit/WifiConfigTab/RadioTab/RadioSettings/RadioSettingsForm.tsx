import { Form, Select, Slider, InputNumber, Space } from 'antd'
import { useIntl }                                  from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import {
  ApRadioTypeEnum,
  channelSelectionMethodsOptions,
  txPowerAdjustmentOptions,
  SelectItemOption,
  bssMinRate6GOptions,
  mgmtTxRate6GOptions,
  txPowerAdjustment6GOptions
} from '../contents'


const { useWatch } = Form

export function RadioSettingsForm (props:{
  radioType: ApRadioTypeEnum,
  radioDataKey: string[],
  disabled?: boolean,
  channelBandwidthOptions: SelectItemOption[]
}) {

  const { $t } = useIntl()
  //const form = Form.useFormInstance()
  const radio6GRateControlFeatureFlag = useIsSplitOn(Features.RADIO6G_RATE_CONTROL)
  const { radioType,
    disabled = false,
    radioDataKey,
    channelBandwidthOptions } = props

  /*
  const {
    editContextData,
    setEditContextData
  } = useContext(props.editContext)
  */

  const methodFieldName = [...radioDataKey, 'method']
  const changeIntervalFieldName = [...radioDataKey, 'changeInterval']
  const scanIntervalFieldName = [...radioDataKey, 'scanInterval']
  const channelBandwidthFieldName = [...radioDataKey, 'channelBandwidth']
  const txPowerFieldName = [...radioDataKey, 'txPower']
  const bssMinRate6gFieldName = [...radioDataKey, 'bssMinRate6G']
  const mgmtTxRate6gFieldName = [...radioDataKey, 'mgmtTxRate6G']

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
        <Select
          disabled={disabled || radioType==='6G'}
          options={channelSelectionMethodsOptions?.map(p =>
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
          disabled={disabled}
          tipFormatter={formatter}
          style={{ width: '240px' }}
          min={1}
          max={100}
          marks={{ 1: '1%', 100: '100%' }}
        />
      </Form.Item>
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
      <Form.Item
        label={$t({ defaultMessage: 'Bandwidth:' })}
        name={channelBandwidthFieldName}>
        <Select
          disabled={disabled}
          options={channelBandwidthOptions}
        />
      </Form.Item>
      <Form.Item
        label={$t({ defaultMessage: 'Transmit Power adjustment:' })}
        name={txPowerFieldName}>
        <Select
          disabled={disabled}
          options={(radioType === ApRadioTypeEnum.Radio6G)?
            txPowerAdjustment6GOptions : txPowerAdjustmentOptions}
        />
      </Form.Item>
      {(radioType === ApRadioTypeEnum.Radio6G && radio6GRateControlFeatureFlag) &&
      <>
        <Form.Item
          label={$t({ defaultMessage: 'BSS Min Rate:' })}
          name={bssMinRate6gFieldName}>
          <Select
            disabled={disabled}
            options={bssMinRate6GOptions}
          />
        </Form.Item>
        <Form.Item
          label={$t({ defaultMessage: 'Mgmt Tx Rate:' })}
          name={mgmtTxRate6gFieldName}>
          <Select
            disabled={disabled}
            options={mgmtTxRate6GOptions}
          />
        </Form.Item>
      </>
      }
    </>
  )
}
