import { Form, Select, Switch } from 'antd'
import { replace }              from 'lodash'
import { useIntl }              from 'react-intl'

import { Tooltip }                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { CapabilitiesApModel, VenueLanPorts, WifiApSetting } from '@acx-ui/rc/utils'

export function LanPortPoeSettings (props: {
  context?: string,
  selectedModel: VenueLanPorts | WifiApSetting,
  selectedModelCaps: CapabilitiesApModel,
  onGUIChanged?: (fieldName: string) => void,
  useVenueSettings?: boolean,
  disabled?: boolean
}) {
  const isAllowUseApUsbSupport = useIsSplitOn(Features.AP_USB_PORT_SUPPORT_TOGGLE)
  const { $t } = useIntl()
  const {
    context = 'venue',
    selectedModel,
    selectedModelCaps,
    onGUIChanged,
    useVenueSettings,
    disabled
  } = props

  const poeModeTooltipsInfo = $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'Please avoid 802.3af or 802.3at PoE if using the USB port, as power may be insufficient'
  })
  const onChangedByCustom = (fieldName: string) => {
    onGUIChanged?.(fieldName)
  }

  // waiting for backend support AP PoE Mode
  const isPoeModeImplemented = (context === 'venue')

  return (<>
    { (isPoeModeImplemented && selectedModelCaps?.canSupportPoeMode) &&
    <Form.Item
      name='poeMode'
      label={<>
        {$t({ defaultMessage: 'PoE Operating Mode' })}
        {isAllowUseApUsbSupport && <Tooltip.Question title={poeModeTooltipsInfo}
          iconStyle={{ width: 16, height: 16 }}/>
        }
      </>}
      initialValue={selectedModel?.poeMode || 'Auto'}
      style={{ paddingTop: '20px' }}
      children={<Select
        options={selectedModelCaps?.poeModeCapabilities?.map(item => ({
          label: toReadablePoeMode(item), value: item
        }))}
        disabled={disabled || useVenueSettings}
        onChange={() => onChangedByCustom('poeMode')}
      />}
    /> }
    { selectedModelCaps?.canSupportPoeOut &&
    <Form.Item
      hidden={true}
      name='poeOut'
      valuePropName='checked'
      initialValue={selectedModel?.poeOut}
      children={<Switch />}
    />}
  </>)
}

export function toReadablePoeMode (poeMode:string) {
  const replaced = replace(poeMode, '-', '/')
  return replace(replaced, '_', ' ')
}
