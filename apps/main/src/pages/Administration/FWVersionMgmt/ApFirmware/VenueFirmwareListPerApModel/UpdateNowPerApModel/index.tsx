import { useState } from 'react'

import { Space, Switch } from 'antd'
import { useIntl }       from 'react-intl'

import { Modal }                                                       from '@acx-ui/components'
import { usePatchVenueApModelFirmwaresMutation }                       from '@acx-ui/rc/services'
import { FirmwareVenuePerApModel, VenueApModelFirmwaresUpdatePayload } from '@acx-ui/rc/utils'

import * as UI                          from '../../VenueFirmwareList/styledComponents'
import { firmwareNote1, firmwareNote2 } from '../../VenueFirmwareList/UpdateNowDialog'

import { ApFirmwareUpdateGroupPanel }      from './ApFirmwareUpdateGroupPanel'
import { ApFirmwareUpdateIndividualPanel } from './ApFirmwareUpdateIndividualPanel'


export type ApFirmwareUpdateRequestPayload = VenueApModelFirmwaresUpdatePayload['targetFirmwares']

enum UpdateMode {
  GROUP,
  INDIVIDUAL
}

export interface UpdateNowPerApModelProps {
  onCancel: () => void
  afterSubmit: () => void
  selectedVenuesFirmwares: FirmwareVenuePerApModel[]
}

export function UpdateNowPerApModel (props: UpdateNowPerApModelProps) {
  const { $t } = useIntl()
  const { onCancel, afterSubmit, selectedVenuesFirmwares } = props
  const [ disableSave, setDisableSave ] = useState(false)
  const [ updateMode, setUpdateMode ] = useState<UpdateMode>(UpdateMode.GROUP)
  // eslint-disable-next-line max-len
  const [ updateRequestPayload, setUpdateRequestPayload ] = useState<ApFirmwareUpdateRequestPayload>([])
  const [ updateVenueApModelFirmwares ] = usePatchVenueApModelFirmwaresMutation()

  const triggerSubmit = async () => {
    try {

      const requests = selectedVenuesFirmwares.filter(v => !v.isFirmwareUpToDate).map(venueFw => {
        return updateVenueApModelFirmwares({
          params: { venueId: venueFw.id },
          payload: { targetFirmwares: updateRequestPayload }
        }).unwrap()
      })

      await Promise.all(requests)

      onModalCancel()
      afterSubmit()
    } catch (err) {
      console.log(err) // eslint-disable-line no-console
    }
  }

  const onModalCancel = () => {
    onCancel()
  }

  const onUpdateModeChange = (checked: boolean) => {
    setUpdateMode(checked ? UpdateMode.INDIVIDUAL : UpdateMode.GROUP)
  }

  const updateUpdateRequestPayload = (targetFirmwares: ApFirmwareUpdateRequestPayload = []) => {
    const compactedTargetFirmwares = targetFirmwares.filter(fw => fw.firmware)
    setUpdateRequestPayload(compactedTargetFirmwares)
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
      <ActivePanel
        updateUpdateRequestPayload={updateUpdateRequestPayload}
        selectedVenuesFirmwares={selectedVenuesFirmwares}
      />
      <UI.Section>
        <UI.Ul>
          <UI.Li>{$t(firmwareNote1)}</UI.Li>
          <UI.Li>{$t(firmwareNote2)}</UI.Li>
        </UI.Ul>
      </UI.Section>
    </Modal>
  )
}
