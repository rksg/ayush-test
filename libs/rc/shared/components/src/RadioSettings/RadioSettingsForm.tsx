/* eslint-disable max-len */
import { useEffect } from 'react'

import { Form, Slider, InputNumber, Space, Switch, Checkbox } from 'antd'
import { CheckboxChangeEvent }                                from 'antd/lib/checkbox'
import { useIntl }                                            from 'react-intl'

import { cssStr, Tooltip }        from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { InformationOutlined }    from '@acx-ui/icons'


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
import { Label, FieldLabel, FormItemNoLabel, RadioFormSelect } from './styledComponents'

const { useWatch } = Form

export function RadioSettingsForm (props:{
  radioType: ApRadioTypeEnum,
  radioDataKey: string[],
  disabled?: boolean,
  channelBandwidthOptions: SelectItemOption[],
  context?: string
  isUseVenueSettings?: boolean,
  onGUIChanged?: (fieldName: string) => void
}) {

  const { $t } = useIntl()
  const radio6GRateControlFeatureFlag = useIsSplitOn(Features.RADIO6G_RATE_CONTROL)
  const { radioType,
    disabled = false,
    radioDataKey,
    channelBandwidthOptions,
    context = 'venue',
    isUseVenueSettings = false,
    onGUIChanged
  } = props

  const methodFieldName = [...radioDataKey, 'method']
  const changeIntervalFieldName = [...radioDataKey, 'changeInterval']
  const scanIntervalFieldName = [...radioDataKey, 'scanInterval']
  const channelBandwidthFieldName = [...radioDataKey, 'channelBandwidth']
  const txPowerFieldName = [...radioDataKey, 'txPower']
  const bssMinRate6gFieldName = [...radioDataKey, 'bssMinRate6G']
  const mgmtTxRate6gFieldName = [...radioDataKey, 'mgmtTxRate6G']
  const enableMulticastRateLimitingFieldName = [...radioDataKey, 'enableMulticastRateLimiting']
  const enableUploadLimitFieldName = [...radioDataKey, 'enableMulticastUplinkRateLimiting']
  const enableDownloadLimitFieldName = [...radioDataKey, 'enableMulticastDownlinkRateLimiting']
  const uploadLimitFieldName = [...radioDataKey, 'multicastUplinkRateLimiting']
  const downloadLimitFieldName = [...radioDataKey, 'multicastDownlinkRateLimiting']

  const channelSelectionOpts = (context === 'venue') ?
    channelSelectionMethodsOptions :
    (radioType === ApRadioTypeEnum.Radio6G) ?
      apChannelSelectionMethods6GOptions : apChannelSelectionMethodsOptions

  const [channelMethod] = [useWatch<string>(methodFieldName)]
  const form = Form.useFormInstance()
  const [
    enableMulticastRateLimiting,
    enableUploadLimit,
    enableDownloadLimit,
    channelBandwidth
  ] = [
    useWatch<boolean>(enableMulticastRateLimitingFieldName),
    useWatch<boolean>(enableUploadLimitFieldName),
    useWatch<boolean>(enableDownloadLimitFieldName),
    useWatch<string>(['radioParams6G', 'channelBandwidth'])
  ]

  useEffect(() => {
    form.setFieldValue(enableMulticastRateLimitingFieldName,
      form.getFieldValue(enableUploadLimitFieldName) || form.getFieldValue(enableDownloadLimitFieldName))

  }, [] )


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatter (value: any) {
    return `${value}%`
  }

  const onChangedByCustom = (fieldName: string) => {
    onGUIChanged?.(fieldName)
  }

  const getDownloadMaxValue = () => getDLMax(form.getFieldValue(bssMinRate6gFieldName))
  const multicastRateLimitFlag = useIsSplitOn(Features.MULTICAST_RATE_LIMIT_TOGGLE)

  const handleBSSMinRateOnChange = (value: unknown) => {
    if (value) {
      form.setFieldValue(downloadLimitFieldName, getDownloadMaxValue())
    }
    onChangedByCustom('bssMinRate')
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
          onChange={() => onChangedByCustom('method')}
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
          onChange={() => onChangedByCustom('changeInterval')}
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
            <InputNumber disabled={disabled}
              min={1}
              max={65535}
              onChange={() => onChangedByCustom('scanInterval')}/>
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
          onChange={() => onChangedByCustom('bandwidth')}
        />
      </Form.Item>
      {(channelBandwidth === '320MHz' && radioType === ApRadioTypeEnum.Radio6G)?
        <div style={{ color: cssStr('--acx-neutrals-50'), fontSize: '12px', marginBottom: '14px' }}>
          <InformationOutlined style={{
            height: '14px',
            marginBottom: '-2px',
            marginRight: '2px'
          }}/>
          {$t(
            // eslint-disable-next-line max-len
            { defaultMessage: '320 MHz applies only to R770. The other AP models will enable 160 MHz.' }
          )}
        </div>
        : '' }
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
          onChange={() => onChangedByCustom('txPower')}
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
            onChange={handleBSSMinRateOnChange}
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
            onChange={() => onChangedByCustom('mgmtTxRate')}
          />
        </Form.Item>

        {multicastRateLimitFlag && <>
          <FieldLabel width='175px'>
            <Space>
              {$t({ defaultMessage: 'Multicast Rate Limiting' })}
              <Tooltip.Question
                title={$t({ defaultMessage: 'Note that enabling Directed Multicast in Venue/AP settings, which converting multicast packets to unicast, will impact the functionality of Multicast Rate Limiting.' })}
                placement='right'
                iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
              />
            </Space>
            <Form.Item
              name={enableMulticastRateLimitingFieldName}
              style={{ marginBottom: '10px' }}
              valuePropName='checked'
              initialValue={form.getFieldValue(enableUploadLimitFieldName)||form.getFieldValue(enableDownloadLimitFieldName)}
            >
              { isUseVenueSettings && !(form.getFieldValue(enableUploadLimitFieldName)||form.getFieldValue(enableDownloadLimitFieldName)) ?
                <span>OFF</span>
                : <Switch
                  disabled={disabled || isUseVenueSettings}
                  defaultChecked={form.getFieldValue(enableUploadLimitFieldName)||form.getFieldValue(enableDownloadLimitFieldName)}
                  onChange={function (checked: boolean) {
                    if (!checked) {
                      form.setFieldValue(
                        enableDownloadLimitFieldName, false)
                      form.setFieldValue(
                        enableUploadLimitFieldName, false)
                    }
                  }} />
              }
            </Form.Item>
          </FieldLabel>

          {enableMulticastRateLimiting && <>
            <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
              <FormItemNoLabel
                name={enableUploadLimitFieldName}
                valuePropName='checked'
                initialValue={enableUploadLimit || enableDownloadLimit}
                style={{ lineHeight: '50px' }}
              >
                {
                  <Checkbox data-testid='enableUploadLimit'
                    onChange={function (e: CheckboxChangeEvent) {
                      const value = e.target.checked ? 20 : 0
                      form.setFieldValue(
                        uploadLimitFieldName, value)
                    }}
                    children={$t({ defaultMessage: 'Upload Limit' })}
                    disabled={disabled || isUseVenueSettings}/>}
              </FormItemNoLabel>
              {
                enableUploadLimit ?
                  <FormItemNoLabel
                    name={uploadLimitFieldName}
                    children={
                      <Slider
                        disabled={disabled || isUseVenueSettings}
                        tooltipVisible={false}
                        style={{ width: '245px' }}
                        defaultValue={20}
                        min={1}
                        max={100}
                        marks={{
                          1: { label: '1 Mbps' },
                          100: { label: '100 Mbps' }
                        }}
                      />
                    }
                  /> :
                  <Unlimited />
              }
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
              <FormItemNoLabel
                name={enableDownloadLimitFieldName}
                valuePropName='checked'
                initialValue={false}
                style={{ lineHeight: '50px' }}
                children={
                  <Checkbox data-testid='enableDownloadLimit'
                    disabled={disabled || isUseVenueSettings}
                    onChange={function (e: CheckboxChangeEvent) {
                      const value = e.target.checked ? getDLMax(form.getFieldValue(bssMinRate6gFieldName)) : 0
                      form.setFieldValue(
                        downloadLimitFieldName, value)
                    }}
                    children={$t({ defaultMessage: 'Download Limit' })} />}
              />
              {
                enableDownloadLimit ?
                  <FormItemNoLabel
                    name={downloadLimitFieldName}
                    children={
                      <Slider
                        disabled={disabled || isUseVenueSettings}
                        tooltipVisible={false}
                        style={{ width: '245px' }}
                        defaultValue={getDownloadMaxValue()}
                        min={1}
                        max={getDLMax(form.getFieldValue(bssMinRate6gFieldName))}
                        marks={{
                          1: { label: '1 Mbps' },
                          [`${getDownloadMaxValue()}`]: { label: getDownloadMaxValue().toString() + ' Mbps' }
                        }}
                      />
                    }
                  /> : <Unlimited />
              }
            </div>
          </>}
        </>}
      </>
      }
    </>
  )
}

function Unlimited () {
  const { $t } = useIntl()
  return (
    <Label
      style={{ lineHeight: '50px' }}>
      {$t({ defaultMessage: 'Unlimited' })}
    </Label>
  )
}

function getDLMax (value : string) : number {
  switch (value) {
    case 'HE_MCS_0':
      return 3
    case 'HE_MCS_1':
      return 7
    case 'HE_MCS_2':
      return 10
    case 'HE_MCS_3':
      return 14
    default:
      return 100
  }
}