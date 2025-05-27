import { useContext } from 'react'

import { Form }     from 'antd'
import { NamePath } from 'antd/es/form/interface'
import { useIntl }  from 'react-intl'

import { RadioSettingsContents, SingleRadioSettings } from '../../RadioSettings'
import { ApRadioTypeEnum }                            from '../../RadioSettings/RadioSettingsContents'
// import { DisabledDiv, FieldLabel }                    from '../styledComponents'
const { SupportRadioChannelsContext } = RadioSettingsContents

export interface ApGroupSingleRadioSettingsPorps {
  isEnabled: boolean,
  radioTypeName: string,
  enabledFieldName: NamePath,
  useVenueSettingsFieldName: NamePath,
  onEnableChanged: Function,
  disabled?: boolean,
  inherit5G?: boolean,
  radioType: ApRadioTypeEnum,
  handleChanged?: () => void,
  onResetDefaultValue?: Function,
  testId?: string,
  isUseVenueSettings?: boolean
}

export function ApGroupSingleRadioSettings (props: ApGroupSingleRadioSettingsPorps) {
  const { $t } = useIntl()

  // eslint-disable-next-line max-len
  const { useVenueSettingsFieldName } = props
  const { radioType, handleChanged, isUseVenueSettings, disabled } = props

  const { bandwidthRadioOptions } = useContext(SupportRadioChannelsContext)
  const bandwidthOptions = bandwidthRadioOptions[radioType]

  // const handleEnableChanged = (checked: boolean) => {
  //   onEnableChanged(checked, radioType)
  // }

  return (
    (bandwidthOptions.length > 0)?
      <>
        <Form.Item
          name={useVenueSettingsFieldName}
          hidden
          children={<></>}
        />
        <SingleRadioSettings
          context='apGroup'
          radioType={radioType}
          disabled={disabled}
          handleChanged={handleChanged}
          isUseVenueSettings={isUseVenueSettings}
        />

        {/* Not supported yet*/}
        {/*<FieldLabel width='180px'>*/}
        {/*  {$t({ defaultMessage: 'Enable {radioTypeName} band:' }, { radioTypeName: radioTypeName })}*/}
        {/*  <Form.Item*/}
        {/*    name={enabledFieldName}*/}
        {/*    valuePropName='checked'*/}
        {/*    style={{ marginTop: '16px' }}*/}
        {/*  >*/}
        {/*    {isUseVenueSettings ?*/}
        {/*      <span>{$t({ defaultMessage: 'On' })}</span> :*/}
        {/*      <Switch disabled={disabled} onChange={handleEnableChanged} />*/}
        {/*    }*/}
        {/*  </Form.Item>*/}
        {/*</FieldLabel>*/}
        {/*{ (!isEnabled && !isUseVenueSettings) ? (*/}
        {/*  <DisabledDiv>*/}
        {/*    {$t({ defaultMessage: '{radioTypeName} Radio is disabled' },*/}
        {/*      { radioTypeName: radioTypeName })}*/}
        {/*  </DisabledDiv>) : (*/}
        {/*  <SingleRadioSettings*/}
        {/*    context='apGroup'*/}
        {/*    radioType={radioType}*/}
        {/*    disabled={disabled}*/}
        {/*    handleChanged={handleChanged}*/}
        {/*    isUseVenueSettings={isUseVenueSettings}*/}
        {/*  />*/}
        {/*)*/}
        {/*}*/}
      </> : <div>
        {$t({ defaultMessage: 'This band is not supported for APs in current country' })}
      </div>
  )
}
