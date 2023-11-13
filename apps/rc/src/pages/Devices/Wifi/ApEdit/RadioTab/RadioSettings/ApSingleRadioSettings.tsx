/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Switch } from 'antd'
import { NamePath }     from 'antd/es/form/interface'
import { useIntl }      from 'react-intl'

import { ApRadioTypeEnum, SelectItemOption, SingleRadioSettings } from '@acx-ui/rc/components'
import { AFCProps }                                               from '@acx-ui/rc/utils'

import { DisabledDiv, FieldLabel } from '../../styledComponents'

export interface ApSingleRadioSettingsPorps {
  isEnabled: boolean,
  radioTypeName: string,
  enabledFieldName: NamePath,
  useVenueSettingsFieldName: NamePath,
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
  supportDfsChannels?: any,
  afcProps? : AFCProps
}

// eslint-disable-max-len
export function ApSingleRadioSettings (props: ApSingleRadioSettingsPorps) {
  const { $t } = useIntl()

  const { isEnabled, enabledFieldName, useVenueSettingsFieldName, radioTypeName, onEnableChanged } = props
  const { radioType, supportChannels, bandwidthOptions,
    handleChanged, supportDfsChannels, isUseVenueSettings, afcProps } = props

  const handleEnableChanged = (checked: boolean) => {
    onEnableChanged(checked)
  }

  return (
    (bandwidthOptions.length > 0)?
      <>
        <Form.Item
          name={useVenueSettingsFieldName}
          hidden
        />
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
            afcProps={afcProps}
          />
        )
        }
      </> : <div>
        {$t({ defaultMessage: 'This band is not supported for APs in current country' })}
      </div>
  )
}
