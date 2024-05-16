import { useState } from 'react'

import { Space, Switch } from 'antd'
import { useIntl }       from 'react-intl'

import { FirmwareVenuePerApModel } from '@acx-ui/rc/utils'

import { UpdateFirmwarePerApModelGroupPanel }      from './UpdateFirmwarePerApModelGroupPanel'
import { UpdateFirmwarePerApModelIndividualPanel } from './UpdateFirmwarePerApModelIndividualPanel'

import { UpdateFirmwarePerApModelFirmware } from '.'

enum UpdateMode {
  GROUP,
  INDIVIDUAL
}
const panelMap: Record<UpdateMode, Function> = {
  [UpdateMode.GROUP]: UpdateFirmwarePerApModelGroupPanel,
  [UpdateMode.INDIVIDUAL]: UpdateFirmwarePerApModelIndividualPanel
}
export interface UpdateFirmwarePerApModelPanelProps {
  selectedVenuesFirmwares: FirmwareVenuePerApModel[]
  updatePayload: (targetFirmwares: UpdateFirmwarePerApModelFirmware) => void
  initialPayload?: UpdateFirmwarePerApModelFirmware
  isUpgrade?: boolean
}
export function UpdateFirmwarePerApModelPanel (props: UpdateFirmwarePerApModelPanelProps) {
  const { $t } = useIntl()
  const { selectedVenuesFirmwares, updatePayload, initialPayload } = props
  const [ updateMode, setUpdateMode ] = useState<UpdateMode>(UpdateMode.GROUP)

  const ActivePanel = panelMap[updateMode]

  const onUpdateModeChange = (checked: boolean) => {
    setUpdateMode(checked ? UpdateMode.INDIVIDUAL : UpdateMode.GROUP)
  }

  return (<>
    <Space style={{ marginBottom: 24 }}>
      <Switch
        checked={updateMode === UpdateMode.INDIVIDUAL}
        onClick={onUpdateModeChange}
      />
      <span>{$t({ defaultMessage: 'Update firmware by AP model' })}</span>
    </Space>
    <ActivePanel
      selectedVenuesFirmwares={selectedVenuesFirmwares}
      updatePayload={updatePayload}
      initialPayload={initialPayload}
    />
  </>)
}
