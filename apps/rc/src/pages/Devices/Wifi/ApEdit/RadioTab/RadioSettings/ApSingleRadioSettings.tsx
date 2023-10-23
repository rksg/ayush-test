/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useContext } from 'react'


import { Form, Switch } from 'antd'
import { NamePath }     from 'antd/es/form/interface'
import _                from 'lodash'
import { useIntl }      from 'react-intl'

import { ApRadioTypeEnum, SelectItemOption, SingleRadioSettings, LPIButtonText } from '@acx-ui/rc/components'
import { isAPLowPower }                                                          from '@acx-ui/rc/services'
import { AFCStatus }                                                             from '@acx-ui/rc/utils'

import { ApEditContext, ApDataContext } from '../..'
import { DisabledDiv, FieldLabel }      from '../../styledComponents'

export interface ApSingleRadioSettingsPorps {
  isEnabled: boolean,
  radioTypeName: string,
  enabledFieldName: NamePath,
  onEnableChanged: Function,
  disable?: boolean,
  inherit5G?: boolean,
  radioType: ApRadioTypeEnum,
  bandwidthOptions: SelectItemOption[],
  supportChannels: any,
  handleChanged?: () => void,
  onResetDefaultValue?: Function,
  testId?: string,
  isUseVenueSettings?: boolean,
  supportDfsChannels?: any
}

// eslint-disable-max-len
export function ApSingleRadioSettings (props: ApSingleRadioSettingsPorps) {
  const { $t } = useIntl()

  const { isEnabled, enabledFieldName, radioTypeName, onEnableChanged } = props
  const { radioType, supportChannels, bandwidthOptions,
    handleChanged, supportDfsChannels, isUseVenueSettings } = props

  const handleEnableChanged = (checked: boolean) => {
    onEnableChanged(checked)
  }

  const [lowPowerIndoorModeEnabled, setLowPowerIndoorModeEnabled] = useState(false)

  const {
    apViewContextData
  } = useContext(ApEditContext)
  const {
    apCapabilities
  } = useContext(ApDataContext)

  const defaultButtonTextSetting: LPIButtonText = {
    buttonText:
      <p style={{ fontSize: '12px', margin: '0px' }}>
        {$t({ defaultMessage: 'Standard power' })}
      </p>
    ,
    LPIModeOnChange: setLowPowerIndoorModeEnabled,
    LPIModeState: lowPowerIndoorModeEnabled,
    isAPOutdoor: apCapabilities?.isOutdoor
  }

  function setLPIToggleText () {
    let newButtonTextSetting = _.clone(defaultButtonTextSetting)
    const afcInfo = apViewContextData?.apStatusData?.afcInfo || undefined
    let newButtonText : JSX.Element = (<p style={{ fontSize: '12px', margin: '0px' }}> {$t({ defaultMessage: 'Standard power' })} </p>)

    if(isUseVenueSettings){
      newButtonText = ( <p style={{ fontSize: '12px', margin: '0px' }}>
        {lowPowerIndoorModeEnabled ?
          $t({ defaultMessage: 'Low power' }) :
          $t({ defaultMessage: 'Standard power' })
        }
      </p>)
    }
    else {
      if (isAPLowPower(afcInfo) && !lowPowerIndoorModeEnabled) {
        let defaultButtonText = $t({ defaultMessage: 'Standard power' })
        let defaultStyle = { color: '#910012', fontSize: '12px', margin: '0px' }
        switch(afcInfo?.afcStatus) {
          case AFCStatus.WAIT_FOR_LOCATION:
            defaultButtonText = $t({ defaultMessage: 'Standard power [Geo Location not set]' })
            break
          case AFCStatus.WAIT_FOR_RESPONSE:
            defaultButtonText = $t({ defaultMessage: 'Standard power [Pending response from the AFC server]' })
            break
          case AFCStatus.REJECTED:
            defaultButtonText = $t({ defaultMessage: 'Standard power [No channels available]' })
            break
          default:
            defaultStyle = { color: '#000000', fontSize: '12px', margin: '0px' }
        }
        newButtonText = (<p style={defaultStyle}> {defaultButtonText} </p>)
      }
    }

    _.set(newButtonTextSetting, 'buttonText', newButtonText)
    return newButtonTextSetting
  }


  return (
    (bandwidthOptions.length > 0)?
      <>
        <FieldLabel width='180px'>
          {$t({ defaultMessage: 'Enable {radioTypeName} band:' }, { radioTypeName: radioTypeName })}
          <Form.Item
            name={enabledFieldName}
            valuePropName='checked'
            style={{ marginTop: '16px' }}
          >
            {isUseVenueSettings ?
              <span>{$t({ defaultMessage: 'On' })}</span> :
              <Switch onChange={handleEnableChanged} />
            }
          </Form.Item>
        </FieldLabel>
        { (!isEnabled && !isUseVenueSettings) ? (
          <DisabledDiv>
            {$t({ defaultMessage: '{radioTypeName} Radio is disabled' },
              { radioTypeName: radioTypeName })}
          </DisabledDiv>) : (
          <SingleRadioSettings
            context='ap'
            radioType={radioType}
            supportChannels={supportChannels}
            bandwidthOptions={bandwidthOptions}
            supportDfsChannels={supportDfsChannels}
            handleChanged={handleChanged}
            isUseVenueSettings={isUseVenueSettings}
            LPIButtonText={setLPIToggleText()}
          />
        )
        }
      </> : <div>
        {$t({ defaultMessage: 'This band is not supported for APs in current country' })}
      </div>
  )
}
