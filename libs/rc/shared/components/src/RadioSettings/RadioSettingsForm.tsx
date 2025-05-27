/* eslint-disable max-len */
import { useEffect, useContext, useState } from 'react'



import { Form, Slider, InputNumber, Space, Switch, Checkbox, Input } from 'antd'
import { CheckboxChangeEvent }                                       from 'antd/lib/checkbox'
import { isNumber }                                                  from 'lodash'
import { useIntl }                                                   from 'react-intl'

import { cssStr, Tooltip, Button, Alert }                  from '@acx-ui/components'
import { get }                                             from '@acx-ui/config'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { InformationOutlined, QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { useNavigate, useLocation, useParams }             from '@acx-ui/react-router-dom'
import { validationMessages }                              from '@acx-ui/utils'

import {
  ApCompatibilityDrawer,
  ApCompatibilityToolTip,
  ApCompatibilityType,
  InCompatibilityFeatures
} from '../ApCompatibility'
import { usePathBasedOnConfigTemplate } from '../configTemplates'

import {
  ApRadioTypeEnum,
  channelSelectionMethodsOptions,
  SelectItemOption,
  bssMinRate6GOptions,
  mgmtTxRate6GOptions,
  apChannelSelectionMethodsOptions,
  apChannelSelectionMethods6GOptions,
  LPIButtonText
} from './RadioSettingsContents'
import { VenueRadioContext }                                   from './RadioSettingsContents'
import { Label, FieldLabel, FormItemNoLabel, RadioFormSelect } from './styledComponents'

const { useWatch } = Form


export function RadioSettingsForm (props:{
  radioType: ApRadioTypeEnum,
  radioDataKey: string[],
  disabled?: boolean,
  txPowerOptions: SelectItemOption[],
  channelBandwidthOptions: SelectItemOption[],
  context?: string
  isUseVenueSettings?: boolean,
  onGUIChanged?: (fieldName: string) => void,
  isAFCEnabled? : boolean,
  LPIButtonText?: LPIButtonText
}) {
  const { $t } = useIntl()
  const afcFeatureflag = get('AFC_FEATURE_ENABLED').toLowerCase() === 'true'
  const {
    radioType,
    disabled = false,
    radioDataKey,
    txPowerOptions,
    channelBandwidthOptions,
    context = 'venue',
    isUseVenueSettings = false,
    onGUIChanged,
    isAFCEnabled = true,
    LPIButtonText
  } = props

  const showAfcItems = afcFeatureflag && ApRadioTypeEnum.Radio6G === radioType

  const { venue, venueRadio } = useContext(VenueRadioContext)
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
  const enableAfcFieldName = [...radioDataKey, 'enableAfc']
  const minFloorFieldName = [...radioDataKey, 'venueHeight', 'minFloor']
  const maxFloorFieldName = [...radioDataKey, 'venueHeight', 'maxFloor']

  const isApTxPowerToggleEnabled = useIsSplitOn(Features.AP_TX_POWER_TOGGLE)
  const isVenueChannelSelectionManualEnabled = useIsSplitOn(Features.ACX_UI_VENUE_CHANNEL_SELECTION_MANUAL)
  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const { venueId } = useParams()
  const [afcDrawerVisible, setAfcDrawerVisible] = useState(false)
  const [txDrawerVisible, setTxDrawerVisible] = useState(false)
  const [mrlDrawerVisible, setMrlDrawerVisible] = useState(false)
  const [band320DrawerVisible, setBand320DrawerVisible] = useState(false)

  const afcTooltip = $t({ defaultMessage: 'For outdoor APs, AFC will be enabled automatically.' })
  const aggressiveTxTooltip = $t({ defaultMessage: 'Adjust the value based on the calibration TX power on this device' })
  const channelSelectionOpts = (!isVenueChannelSelectionManualEnabled && (context === 'venue' || context ==='apGroup')) ?
    channelSelectionMethodsOptions :
    (radioType === ApRadioTypeEnum.Radio6G) ?
      apChannelSelectionMethods6GOptions : apChannelSelectionMethodsOptions

  const navigate = useNavigate()
  const location = useLocation()
  const detailsPath = usePathBasedOnConfigTemplate(`/venues/${venue?.id}/edit/wifi/radio/Normal6GHz`)
  const [channelMethod] = [useWatch<string>(methodFieldName)]
  const form = Form.useFormInstance()
  const [
    enableMulticastRateLimiting,
    enableUploadLimit,
    enableDownloadLimit,
    channelBandwidth,
    enableAfc,
    minFloor,
    maxFloor
  ] = [
    useWatch<boolean>(enableMulticastRateLimitingFieldName),
    useWatch<boolean>(enableUploadLimitFieldName),
    useWatch<boolean>(enableDownloadLimitFieldName),
    useWatch<string>(channelBandwidthFieldName),
    useWatch<boolean>(enableAfcFieldName),
    useWatch<number>(minFloorFieldName),
    useWatch<number>(maxFloorFieldName)
  ]

  useEffect(() => {
    if (props?.isAFCEnabled === false) {
      form.setFieldValue(enableAfcFieldName, false)
    }
  }, [])

  useEffect(()=> {
    if(LPIButtonText?.LPIModeState !== enableAfc) {
      LPIButtonText?.LPIModeOnChange(enableAfc)
    }
  }, [enableAfc])


  function formatter () {
    return `This configuration controls the responsiveness of ChannelFly technology
    to interference considering the impact on the associated client.
    ChannelFly avoids performing channel changes when a certain number of clients are associated to the AP on a per-radio basis.
    Default CCF value of 33 means the channel changes may occur only when there are three or fewer associated clients.
    For every 10% increase in CCF, AP allows channel change for 1 additional client connected.`
  }

  const onChangedByCustom = (fieldName: string) => {
    onGUIChanged?.(fieldName)
  }

  const getDownloadMaxValue = () => getDLMax(form.getFieldValue(bssMinRate6gFieldName))

  const handleBSSMinRateOnChange = (value: unknown) => {
    if (value) {
      form.setFieldValue(downloadLimitFieldName, getDownloadMaxValue())
    }
    onChangedByCustom('bssMinRate')
  }

  const AFCEnableValidation = (ignoreFloorValidation: boolean) => {
    const { maxFloor, minFloor } = venueRadio?.radioParams6G?.venueHeight || {}

    if (ignoreFloorValidation) {
      return [
        (showAfcItems),
        (context === 'ap'),
        (enableAfc),
        (!LPIButtonText?.isAPOutdoor)
      ].every(Boolean)
    } else {
      return [
        (showAfcItems),
        (context === 'ap'),
        (enableAfc),
        (maxFloor === undefined || minFloor === undefined)
      ].every(Boolean)
    }
  }

  const displayEnableAFCFormItemTag = () => {
    if (context === 'venue') {
      if(isAFCEnabled) {
        return (
          <Space style={{ marginBottom: '10px', marginRight: '20px' }}>
            {$t({ defaultMessage: 'Enable Indoor AFC:' })}
            {!isR370UnsupportedFeatures && <Tooltip
              title={afcTooltip}
              placement='bottom'>
              <QuestionMarkCircleOutlined style={{ width: '14px', marginBottom: '-7px' }}/>
            </Tooltip>}
            {isR370UnsupportedFeatures && <>
              <ApCompatibilityToolTip
                title={afcTooltip}
                showDetailButton
                placement='bottom'
                onClick={() => setAfcDrawerVisible(true)}
              /> <ApCompatibilityDrawer
                visible={afcDrawerVisible}
                type={venueId ? ApCompatibilityType.VENUE : ApCompatibilityType.ALONE}
                venueId={venueId}
                featureName={InCompatibilityFeatures.AFC}
                onClose={() => setAfcDrawerVisible(false)}
              />
            </>}
          </Space>
        )
      } else {
        return (
          <Space style={{ marginBottom: '10px', marginRight: '20px' }}>
            {$t({ defaultMessage: 'Enable Indoor AFC:' })}
          </Space>
        )
      }
    }

    return (
      <Space style={{ marginBottom: '10px', marginRight: '20px' }}>
        {$t({ defaultMessage: 'Enable AFC:' })}
      </Space>
    )
  }



  return (
    <>
      { showAfcItems &&
        <FieldLabel width='180px'
        // Hide the label when afcEnable is false or ap is outdoor under ap context
          style={(context === 'ap' && (LPIButtonText?.isAPOutdoor || props?.isAFCEnabled === false)) ?
            { display: 'none' } : { display: 'flex' }}>
          {displayEnableAFCFormItemTag()}
          <Form.Item
            style={{ width: '50px' }}
            name={enableAfcFieldName}
            valuePropName={'checked'}
            initialValue={false}
            rules={[
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
              { validator: (_, value) => AFCEnableValidation(false) ? Promise.reject($t(validationMessages.EnableAFCButNoVenueHeight)) : Promise.resolve() }
            ]}>
            {isUseVenueSettings ?
              LPIButtonText?.buttonText : (isAFCEnabled ?
                <Switch
                  disabled={disabled || !isAFCEnabled || isUseVenueSettings}
                  onChange={() => {
                    onChangedByCustom('enableAfc')
                    form.validateFields()
                  }}
                /> :
                <Tooltip title={
                  <div style={{ textAlign: 'center' }}>
                    <p>{$t({ defaultMessage: 'Your country does not support AFC.' })}</p>
                  </div>
                }>
                  <Switch disabled={disabled || !isAFCEnabled || isUseVenueSettings} />
                </Tooltip>
              )
            }
          </Form.Item>
        </FieldLabel>
      }
      {
        AFCEnableValidation(true) && (
          <Alert
            type='info'
            message={<>
              <span style={{ marginRight: '30px' }}>
                {$t({ defaultMessage: 'Please ensure that you are familiar with the requirements for AFC Geo-Location.' })}
              </span>
              <a href='https://docs.cloud.ruckuswireless.com/ruckusone/userguide/GUID-C1324048-5F2A-436C-A8BE-9B94BCB5CF14.html'
                target='_blank'
                rel='noreferrer'>
                {$t({ defaultMessage: 'How to configure?' })}
              </a>
            </>
            }
            showIcon={true}
          />
        )
      }
      {
        AFCEnableValidation(false) && (
          <Alert
            type='error'
            message={<>
              <span style={{ marginRight: '30px' }}>
                {$t({ defaultMessage: 'AFC in the 6 GHz band requires a <venueSingular></venueSingular> height to be set for standard power operation.' })}
              </span>
              <Button type='link'
                data-testid='set-it-up-button'
                onClick={() => {
                  navigate(detailsPath, {
                    state: {
                      from: location
                    }
                  })
                }}
              >
                <span style={{
                  fontSize: '12px'
                }}>
                  {$t({ defaultMessage: 'Set it up now' })}
                </span>
              </Button>
            </>
            }
            showIcon={true}
          />
        )
      }
      {showAfcItems && context === 'venue' &&
        <FieldLabel width='150px'
          style={(isAFCEnabled === false) ? { display: 'none' } : {}}
        >
          {$t({ defaultMessage: 'AFC <VenueSingular></VenueSingular> Height:' })}
          <Form.Item>
            <Input.Group compact
              style={{ width: '450px' }}
            >
              <Form.Item
                name={minFloorFieldName}
                dependencies={maxFloorFieldName}
                style={{ width: '150px' }}
                rules={[
                  { validator: (_, value) => (isNumber(value) && value > maxFloor) ? Promise.reject($t(validationMessages.VenueMinFloorGreaterThanMaxFloor)) : Promise.resolve() },
                  { validator: (_, value) => (isNumber(maxFloor) && !isNumber(value)) ? Promise.reject($t({ defaultMessage: 'Minimum floor can not be empty' })) : Promise.resolve() }
                ]}>
                <InputNumber
                  disabled={disabled}
                  style={{ width: '150px' }}
                  controls={false}
                  precision={0}
                  placeholder={$t({ defaultMessage: 'Minimum Floor' })}
                  onChange={() => form.validateFields()}
                />
              </Form.Item>
              <p style={{ margin: '0px 10px', lineHeight: '30px' }}>Floor - </p>
              <Form.Item
                name={maxFloorFieldName}
                dependencies={minFloorFieldName}
                style={{ width: '150px' }}
                rules={[
                  { validator: (_, value) => (isNumber(value) && value < minFloor) ? Promise.reject($t(validationMessages.VenueMaxFloorLessThanMinFloor)) : Promise.resolve() },
                  { validator: (_, value) => (isNumber(minFloor) && !isNumber(value)) ? Promise.reject($t({ defaultMessage: 'Maximum floor can not be empty' })) : Promise.resolve() }
                ]}>
                <InputNumber
                  disabled={disabled}
                  style={{ width: '150px' }}
                  controls={false}
                  precision={0}
                  placeholder={$t({ defaultMessage: 'Maximum Floor' })}
                  onChange={() => {form.validateFields()}}
                />
              </Form.Item>
              <p style={{ margin: '0px 10px', lineHeight: '30px' }}>Floor</p>
              <Tooltip
                title={$t({ defaultMessage: 'Please enter the min and max floors, with the ground floor set to 0.' })}
                placement='bottom'>
                <QuestionMarkCircleOutlined style={{ width: '14px', marginBottom: '-7px' }}/>
              </Tooltip>
            </Input.Group>
          </Form.Item>
        </FieldLabel>
      }
      <Form.Item
        label={$t({ defaultMessage: 'Channel selection method:' })}
        name={methodFieldName}>
        <RadioFormSelect
          disabled={disabled || (!isVenueChannelSelectionManualEnabled && context === 'venue' && radioType === ApRadioTypeEnum.Radio6G)}
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
        label={
          <>
            {$t({ defaultMessage: 'Bandwidth:' })}
            {isR370UnsupportedFeatures && <ApCompatibilityToolTip
              title={''}
              showDetailButton
              placement='right'
              onClick={() => setBand320DrawerVisible(true)}
              icon={<QuestionMarkCircleOutlined
                style={{ height: '16px', width: '16px' }}
              />}
            />}
            {isR370UnsupportedFeatures && <ApCompatibilityDrawer
              visible={band320DrawerVisible}
              type={venueId ? ApCompatibilityType.VENUE : ApCompatibilityType.ALONE}
              venueId={venueId}
              featureName={InCompatibilityFeatures.BANDWIDTH_320MHZ}
              onClose={() => setBand320DrawerVisible(false)}
            />}
          </>
        }
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
      {(channelBandwidth === '320MHz')?
        <div style={{ color: cssStr('--acx-neutrals-50'), fontSize: '12px', marginBottom: '14px' }}>
          <InformationOutlined style={{
            height: '14px',
            marginBottom: '-2px',
            marginRight: '2px'
          }}/>
          {$t(
            // eslint-disable-next-line max-len
            { defaultMessage: '320 MHz applies only to Wi-Fi 7 AP model family. The other AP models will enable 160 MHz.' }
          )}
        </div>
        : '' }
      <Form.Item
        label={<>
          {$t({ defaultMessage: 'Transmit Power adjustment:' })}
          {isApTxPowerToggleEnabled && !isR370UnsupportedFeatures && <Tooltip.Question
            title={aggressiveTxTooltip}
            placement='right'
            iconStyle={{ height: '16px', width: '16px' }}
          />
          }
          {isR370UnsupportedFeatures && <ApCompatibilityToolTip
            title={aggressiveTxTooltip}
            showDetailButton
            placement='right'
            onClick={() => setTxDrawerVisible(true)}
            icon={<QuestionMarkCircleOutlined
              style={{ height: '16px', width: '16px' }}
            />}
          />
          }
          {isR370UnsupportedFeatures && <ApCompatibilityDrawer
            visible={txDrawerVisible}
            type={venueId ? ApCompatibilityType.VENUE : ApCompatibilityType.ALONE}
            venueId={venueId}
            featureName={InCompatibilityFeatures.AUTO_CELL_SIZING}
            onClose={() => setTxDrawerVisible(false)}
          />}
        </>}
        name={txPowerFieldName}>
        <RadioFormSelect
          disabled={disabled}
          bordered={!isUseVenueSettings}
          showArrow={!isUseVenueSettings}
          className={isUseVenueSettings? 'readOnly' : undefined}
          options={txPowerOptions}
          onChange={() => onChangedByCustom('txPower')}
        />
      </Form.Item>
      {radioType === ApRadioTypeEnum.Radio6G &&
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

        <FieldLabel width='175px'>
          <Space style={{ marginBottom: '10px' }}>
            {$t({ defaultMessage: 'Multicast Rate Limiting' })}
            {!isR370UnsupportedFeatures && <Tooltip.Question
              title={$t({ defaultMessage: 'Note that enabling Directed Multicast in <VenueSingular></VenueSingular>/AP settings, which converting multicast packets to unicast, will impact the functionality of Multicast Rate Limiting.' })}
              placement='right'
              iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
            />}
            {isR370UnsupportedFeatures && <>
              <ApCompatibilityToolTip
                title={$t({ defaultMessage: 'Note that enabling Directed Multicast in <VenueSingular></VenueSingular>/AP settings, which converting multicast packets to unicast, will impact the functionality of Multicast Rate Limiting.' })}
                showDetailButton
                placement='right'
                onClick={() => setMrlDrawerVisible(true)}
              />
              <ApCompatibilityDrawer
                visible={mrlDrawerVisible}
                type={venueId ? ApCompatibilityType.VENUE : ApCompatibilityType.ALONE}
                venueId={venueId}
                featureName={InCompatibilityFeatures.VENUE_MULTICAST_RATE_LIMIT}
                onClose={() => setMrlDrawerVisible(false)}
              />
            </>}
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
              <Checkbox data-testid='enableUploadLimit'
                children={$t({ defaultMessage: 'Upload Limit' })}
                disabled={disabled || isUseVenueSettings}
                onChange={function (e: CheckboxChangeEvent) {
                  const value = e.target.checked ? 20 : 0
                  form.setFieldValue(uploadLimitFieldName, value)
                }}
              />
            </FormItemNoLabel>
            {enableUploadLimit ?
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
                  children={$t({ defaultMessage: 'Download Limit' })}
                  disabled={disabled || isUseVenueSettings}
                  onChange={(e: CheckboxChangeEvent) => {
                    const value = e.target.checked ? getDLMax(form.getFieldValue(bssMinRate6gFieldName)) : 0
                    form.setFieldValue(downloadLimitFieldName, value)
                  }}
                />}
            />
            {enableDownloadLimit ?
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
