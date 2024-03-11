import { useState } from 'react'

import { Space, Switch } from 'antd'
import { useIntl }       from 'react-intl'

import { Modal }                              from '@acx-ui/components'
import { VenueApModelFirmwaresUpdatePayload } from '@acx-ui/rc/utils'

import * as UI                          from '../styledComponents'
import { firmwareNote1, firmwareNote2 } from '../UpdateNowDialog'

import { ApFirmwareUpdateGroupPanel }      from './ApFirmwareUpdateGroupPanel'
import { ApFirmwareUpdateIndividualPanel } from './ApFirmwareUpdateIndividualPanel'


export type TargetFirmwaresType = VenueApModelFirmwaresUpdatePayload['targetFirmwares']

enum UpdateMode {
  GROUP,
  INDIVIDUAL
}

interface UpdateNowPerApModelProps {
  onCancel: () => void
}

export function UpdateNowPerApModel (props: UpdateNowPerApModelProps) {
  const { $t } = useIntl()
  const { onCancel } = props
  const [disableSave, setDisableSave] = useState(false)
  const [updateMode, setUpdateMode] = useState<UpdateMode>(UpdateMode.GROUP)

  const triggerSubmit = () => {
  }

  const onModalCancel = () => {
    onCancel()
  }

  const onUpdateModeChange = (checked: boolean) => {
    setUpdateMode(checked ? UpdateMode.INDIVIDUAL : UpdateMode.GROUP)
  }

  const updateTargetFirmwares = (targetFirmwares: TargetFirmwaresType = []) => {
    const compactedTargetFirmwares = targetFirmwares.filter(fw => fw.firmware)
    setDisableSave(compactedTargetFirmwares.length === 0)
  }

  const panelMap: Record<UpdateMode, Function> = {
    [UpdateMode.GROUP]: ApFirmwareUpdateGroupPanel,
    [UpdateMode.INDIVIDUAL]: ApFirmwareUpdateIndividualPanel
  }

  const ActivePanel = panelMap[updateMode]

  return (
    <Modal
      title={$t({ defaultMessage: 'Update Now' })}
      visible={true}
      width={560}
      okText={$t({ defaultMessage: 'Update Firmware' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      okButtonProps={{ disabled: disableSave }}
      destroyOnClose={true}
    >
      <Space style={{ marginBottom: 24 }}>
        <Switch
          checked={updateMode === UpdateMode.INDIVIDUAL}
          onClick={onUpdateModeChange}
        />
        <span>{$t({ defaultMessage: 'Update firmware by AP model' })}</span>
      </Space>
      <ActivePanel updateTargetFirmwares={updateTargetFirmwares} />
      <UI.Section>
        <UI.Ul>
          <UI.Li>{$t(firmwareNote1)}</UI.Li>
          <UI.Li>{$t(firmwareNote2)}</UI.Li>
        </UI.Ul>
      </UI.Section>
    </Modal>
  )
}
