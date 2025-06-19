import { Form, Select, Switch } from 'antd'
import { replace }              from 'lodash'
import { useIntl }              from 'react-intl'

import { Tooltip }                                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import { CapabilitiesApModel, PoeOutModeEnum, VenueLanPorts, WifiApSetting } from '@acx-ui/rc/utils'

export function LanPortPoeSettings (props: {
  selectedModel: VenueLanPorts | WifiApSetting,
  selectedModelCaps: CapabilitiesApModel,
  onGUIChanged?: (fieldName: string) => void,
  useVenueSettings?: boolean,
  disabled?: boolean
}) {
  const isAllowUseApUsbSupport = useIsSplitOn(Features.AP_USB_PORT_SUPPORT_TOGGLE)
  const isPoeOutModeEnabled = useIsSplitOn(Features.WIFI_POE_OUT_MODE_SETTING_TOGGLE)
  const { $t } = useIntl()
  const {
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

  const { useWatch } = Form
  const [apPoeOut, apPoeOutMode] =[
    useWatch('poeOut'),
    useWatch('poeOutMode')
  ]

  const poeOutModeDescriptions: Record<string, React.ReactNode> = {
    [PoeOutModeEnum._802_3af]:
      $t({ defaultMessage: '{lan1} and {lan2} support 802.3af PoE out (15.4 W).' }, {
        lan1: <span style={{ color: '#000' }}>LAN 1</span>,
        lan2: <span style={{ color: '#000' }}>LAN 2</span>
      }),
    [PoeOutModeEnum._802_3at]:
      $t({ defaultMessage: '{lan1} supports 802.3at PoE out (30 W).' }, {
        lan1: <span style={{ color: '#000' }}>LAN 1</span>
      })
  }

  const poeOutModeLabels: Record<string, string> = {
    [PoeOutModeEnum._802_3af]: '802.3af (15.4 W)',
    [PoeOutModeEnum._802_3at]: '802.3at (30 W)'
  }

  return (<>
    { (selectedModelCaps?.canSupportPoeMode) &&
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
      name='poeOut'
      label={$t({ defaultMessage: 'Enable PoE Out' })}
      valuePropName='checked'
      initialValue={selectedModel?.poeOut}
      children={<Switch
        disabled={disabled || useVenueSettings}
        onChange={() => onChangedByCustom('poeOut')}
      />}
    />}
    { isPoeOutModeEnabled && selectedModelCaps?.canSupportPoeOutMode &&
    <Form.Item
      label={$t({ defaultMessage: 'PoE Out Mode' })}
      name='poeOutMode'
      initialValue={selectedModel?.poeOutMode || '802.3af'}
      hidden={!apPoeOut}
      extra={
        <span style={{ fontSize: 10 }}>
          {poeOutModeDescriptions[apPoeOutMode] || 'Please select a PoE Out mode.'}
        </span>
      }
      children={
        <Select
          data-testid='poeOutModeSelect'
          onChange={() => onChangedByCustom('poeOutMode')}
          options={selectedModelCaps?.poeOutModeCapabilities?.map(p => ({
            label: poeOutModeLabels[p], value: p })) ?? []}
        />
      }
    />
    }
  </>)
}

export function toReadablePoeMode (poeMode:string) {
  const replaced = replace(poeMode, '-', '/')
  return replace(replaced, '_', ' ')
}
