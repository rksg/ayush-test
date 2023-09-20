/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react'

import { Form, Switch, Row } from 'antd'
import { NamePath }          from 'antd/es/form/interface'
import { useIntl }           from 'react-intl'


import { ApRadioTypeEnum, SelectItemOption, SingleRadioSettings } from '@acx-ui/rc/components'
import { ApViewModel, AFCPowerMode, AFCStatus }                   from '@acx-ui/rc/utils'

import { ApEditContext }           from '../..'
import { DisabledDiv, FieldLabel } from '../../styledComponents'


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

  const {
    apViewContextData
  } = useContext(ApEditContext)

  /* eslint-disable max-len */
  const displayLowPowerMode = (data?: ApViewModel) => {

    if (!data || !data.apStatusData || !data.apStatusData.afcInfo) {}
    if (radioType !== ApRadioTypeEnum.Radio6G) return

    const afcInfo = data?.apStatusData?.afcInfo ?? {}
    const warningMessages = [] as JSX.Element[]

    if(afcInfo.powerMode === AFCPowerMode.LOW_POWER) {
      warningMessages.push(
        <p style={{ color: '#910012', fontSize: '12px', margin: '0px' }} key='main-warning-message'>
          {$t({ defaultMessage: 'AP will only operate in Low Power Mode' })}
        </p>
      )

      if (afcInfo.afcStatus === AFCStatus.WAIT_FOR_LOCATION) {
        warningMessages.push(
          <p style={{ color: '#910012', fontSize: '12px', margin: '0px' }} key='geo-warning-message'>
            {$t({ defaultMessage: 'until its geo-location has been established' })}
          </p>
        )
      }

      if (afcInfo.afcStatus === AFCStatus.REJECTED) {
        warningMessages.push(
          <p style={{ color: '#910012', fontSize: '12px', margin: '0px' }} key='pending-warning-message'>
            {$t({ defaultMessage: 'Wait for AFC server response.' })}
          </p>
        )
      }

      if (afcInfo.afcStatus === AFCStatus.WAIT_FOR_RESPONSE) {
        warningMessages.push(
          <p style={{ color: '#910012', fontSize: '12px', margin: '0px' }} key='pending-warning-message'>
            {$t({ defaultMessage: 'FCC DB replies that there is no channel available.' })}
          </p>
        )
      }
    }
    return warningMessages
  }
  /* eslint-enable max-len */

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
        <Row>
          {/* First div is for padding, match the field label width */}
          <div style={{ width: '180px', height: '30px', float: 'left' }}></div>
          <div style={{ width: '500px', height: '30px', float: 'left' }}>
            { displayLowPowerMode(apViewContextData) }
          </div>
        </Row>

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
          />
        )
        }
      </> : <div>
        {$t({ defaultMessage: 'This band is not supported for APs in current country' })}
      </div>
  )
}
