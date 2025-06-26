/* eslint-disable max-len */
import { useState } from 'react'

import _                             from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'

import { useSwitchFirmwareUtils } from '@acx-ui/rc/components'
import {
  FirmwareSwitchVenueVersionsV1002,
  SwitchModelGroupDisplayText
} from '@acx-ui/rc/utils'

import * as UI                     from './styledComponents'
import { SwitchRequirementsModal } from './switchRequirementsModal'

const modelNeedUpgrade = {
  stack: ['ICX7150-C10ZP', 'ICX7150-24F'],
  switch: ['ICX7150-C10ZP', 'ICX7150-24F', 'ICX7150-C08P', 'ICX7150-C08PT']
}

export enum SWITCH_UPGRADE_NOTIFICATION_TYPE {
    STACK = 'stack',
    SWITCH = 'switch'
}

export function SwitchUpgradeNotification (props: {
    switchModel?: string,
    stackUnitsMinLimitaion?: number,
    isDisplay: boolean,
    isDisplayHeader: boolean,
    type: SWITCH_UPGRADE_NOTIFICATION_TYPE,
    validateModel: string[],
    venueFirmware?: string,
    venueAboveTenFirmware?: string,
    venueFirmwareV1002? : FirmwareSwitchVenueVersionsV1002[]
}) {
  const [modalVisible, setModalVisible] = useState(false)
  const { $t } = useIntl()
  const {
    isDisplay,
    isDisplayHeader,
    type,
    validateModel,
    stackUnitsMinLimitaion,
    venueFirmwareV1002,
    switchModel } = props
  const upgradeDescription = {
    stack: [{
      // normal
      minFirmwareVersion: '08.0.90d',
      description: $t({ defaultMessage: 'All members must be running 08.0.90d (UFI) at a minimum (or) they should have ‘Cloud Ready’ mentioned on the label. If not, upgrade their FW to the <venueSingular></venueSingular>’s firmware version mentioned above before onboarding.' }),
      warning: $t({ defaultMessage: 'Do not proceed unless all the members meet FW requirements. All members must be running the same FW version.' })
    }, {
      // need upgrade
      minFirmwareVersion: '08.0.92d',
      description: $t({ defaultMessage: 'If the members are not running FI 08.0.92d (UFI), then they must be upgraded to the <venueSingular></venueSingular>’s firmware version. This applies even if there is ‘Cloud Ready’ listed on the switch label.' }),
      warning: $t({ defaultMessage: 'Do not proceed unless all the switches have the minimum FW version running (or) have been manually upgraded. All members must be running the same FW version.' })
    }],
    switch: [{
      // normal
      minFirmwareVersion: '08.0.90d',
      description: $t({ defaultMessage: 'Switch must be running 08.0.90d (UFI) at a minimum (or) the switch should have ‘Cloud Ready’ mentioned on the label. If not, upgrade the switch FW to the <venueSingular></venueSingular>’s firmware version mentioned above before onboarding.' }),
      warning: $t({ defaultMessage: 'Do not proceed unless this switch meets the firmware requirements.' })
    }, {
      // need upgrade
      minFirmwareVersion: '08.0.92d',
      description: $t({ defaultMessage: 'If the switch is not running FI 08.0.92d (UFI), then the switch must be upgraded to the <venueSingular></venueSingular>’s firmware version. This applies even if there is ‘Cloud Ready’ listed on the switch label.' }),
      warning: $t({ defaultMessage: 'Do not proceed unless the switch has minimum FW version running or is manually upgraded.' })
    }]
  }

  const linkMessage = $t({ defaultMessage: 'Click here for information about the upgrade procedure' })

  const isNeedUpgrade = modelNeedUpgrade[type].filter(model => validateModel.indexOf(model) > -1).length > 0
  const isRodanModel = switchModel?.includes('8200') || (validateModel[0]?.includes('8200') && isDisplayHeader)
  const isBabyRodanModel = switchModel?.includes('8100') || (validateModel[0]?.includes('8100') && isDisplayHeader)

  const descriptionIndex = isNeedUpgrade ? 1 : 0
  //TODO: Check style with UX WarningTriangleSolid or WarningTriangleOutlined
  const icon = isNeedUpgrade ? <UI.WarningTriangle /> : ''
  const content = upgradeDescription[type][descriptionIndex]

  const { parseSwitchVersion, checkSwitchModelGroup } = useSwitchFirmwareUtils()

  const StackUnitsMinLimitaionMsg = () => <FormattedMessage
    defaultMessage='For the {model} series, a stack may hold up to <b>{minStackes} switches</b>'
    values={{
      model: switchModel?.split('-')[0],
      minStackes: stackUnitsMinLimitaion,
      b: (contents) => <UI.MinFwVersion>{contents}</UI.MinFwVersion>
    }}
  />

  if (isRodanModel) {
    if ((Number.isInteger(stackUnitsMinLimitaion) && !_.isEmpty(switchModel))) {
      return <UI.Wrapper>
        <UI.Content style={{ padding: '4px 8px 4px' }}>
          <div><StackUnitsMinLimitaionMsg /></div>
        </UI.Content>
      </UI.Wrapper>
    } else if(isDisplayHeader) {
      return <UI.Wrapper style={{ padding: '8px', marginBottom: '8px' }}>
        {$t({ defaultMessage: 'Switch Model:' })} {icon}
        <UI.ValidateModel>{validateModel[0]}</UI.ValidateModel>
      </UI.Wrapper>
    } else {
      return <></>
    }
  }

  if (isBabyRodanModel) {
    if(isDisplayHeader) {
      return <UI.Wrapper style={{ padding: '8px', marginBottom: '8px' }}>
        {$t({ defaultMessage: 'Switch Model:' })} {icon}
        <UI.ValidateModel>{validateModel[0]}</UI.ValidateModel>
      </UI.Wrapper>
    } else {
      return <></>
    }
  }

  const getVenueFirmware = function () {
    if (!switchModel) return ''

    const model = checkSwitchModelGroup(validateModel[0])
    return venueFirmwareV1002?.find(v=> v.modelGroup === model)?.version || ''
  }

  const getVenueCategory = function () {
    if (!switchModel) return ''

    const model = checkSwitchModelGroup(validateModel[0])

    return SwitchModelGroupDisplayText[model]

  }

  return isDisplay ? <UI.UpgradeNotification >
    <UI.Wrapper>
      {
        isDisplayHeader && <UI.Header>
          {$t({ defaultMessage: 'Switch Model:' })} {icon}
          <UI.ValidateModel>{validateModel[0]}</UI.ValidateModel>
        </UI.Header>
      }
      <UI.Content>
        {Number.isInteger(stackUnitsMinLimitaion) && !_.isEmpty(switchModel) &&
          <div style={{ paddingBottom: '4px' }}><StackUnitsMinLimitaionMsg /></div>
        }

        <UI.FirmwareDescription>
          {$t({ defaultMessage: 'Minimum firmware version: ' })}
          <UI.MinFwVersion>{content.minFirmwareVersion}</UI.MinFwVersion>
        </UI.FirmwareDescription>

        {(getVenueFirmware()) && <UI.FirmwareDescription>
          {$t({ defaultMessage: '<VenueSingular></VenueSingular> firmware version for ICX {venueCategory} Series: ' }, {
            venueCategory: getVenueCategory()
          })}
          <UI.MinFwVersion>{parseSwitchVersion(getVenueFirmware() || '')}</UI.MinFwVersion>
        </UI.FirmwareDescription>}


        {content.description}<br/>
        <UI.Warning> {content.warning}</UI.Warning>

        <UI.LinkButton type='link'
          onClick={() => {
            setModalVisible(true)
          }}
        >
          {linkMessage}
        </UI.LinkButton>

      </UI.Content>
    </UI.Wrapper>
    <SwitchRequirementsModal {...{ setModalVisible, modalVisible }}/>
  </UI.UpgradeNotification> : <></>

}
