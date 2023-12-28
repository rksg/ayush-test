import { Form, Select, Switch } from 'antd'
import { replace }              from 'lodash'
import { useIntl }              from 'react-intl'

import { ApModel, CapabilitiesApModel, VenueLanPorts, WifiApSetting } from '@acx-ui/rc/utils'

export function LanPortPoeSettings (props: {
  context?: string,
  selectedModel: VenueLanPorts | WifiApSetting,
  selectedModelCaps: ApModel | CapabilitiesApModel,
  onGUIChanged?: (fieldName: string) => void,
  useVenueSettings?: boolean
}) {

  const { $t } = useIntl()
  const {
    context = 'venue',
    selectedModel,
    selectedModelCaps,
    onGUIChanged,
    useVenueSettings
  } = props

  const onChangedByCustom = (fieldName: string) => {
    onGUIChanged?.(fieldName)
  }

  // waiting for backend support AP PoE Mode
  const isPoeModeImplemented = (context === 'venue')

  return (<>
    { (isPoeModeImplemented && selectedModelCaps?.canSupportPoeMode) &&
    <Form.Item
      name='poeMode'
      label={$t({ defaultMessage: 'PoE Operating Mode' })}
      initialValue={selectedModel?.poeMode || 'Auto'}
      style={{ paddingTop: '20px' }}
      children={<Select
        options={selectedModelCaps?.poeModeCapabilities?.map(item => ({
          label: toReadablePoeMode(item), value: item
        }))}
        disabled={useVenueSettings}
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
