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

export interface UpdateNowPerApModelDialogProps {
  onCancel: () => void
  afterSubmit: () => void
  selectedVenuesFirmwares: FirmwareVenuePerApModel[]
}

export function UpdateNowPerApModelDialog (props: UpdateNowPerApModelDialogProps) {
  const { $t } = useIntl()
  const { onCancel, afterSubmit, selectedVenuesFirmwares } = props
  const [ disableSave, setDisableSave ] = useState(false)
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

  const updateUpdateRequestPayload = (targetFirmwares: ApFirmwareUpdateRequestPayload = []) => {
    const compactedTargetFirmwares = targetFirmwares.filter(fw => fw.firmware)
    setUpdateRequestPayload(compactedTargetFirmwares)
    setDisableSave(compactedTargetFirmwares.length === 0)
  }

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
      <UpdateFirmwarePerApModelPanel
        selectedVenuesFirmwares={selectedVenuesFirmwares}
        updateUpdateRequestPayload={updateUpdateRequestPayload}
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

enum UpdateMode {
  GROUP,
  INDIVIDUAL
}
const panelMap: Record<UpdateMode, Function> = {
  [UpdateMode.GROUP]: ApFirmwareUpdateGroupPanel,
  [UpdateMode.INDIVIDUAL]: ApFirmwareUpdateIndividualPanel
}
export interface UpdateFirmwarePerApModelPanelProps {
  selectedVenuesFirmwares: FirmwareVenuePerApModel[]
  updateUpdateRequestPayload: (targetFirmwares: ApFirmwareUpdateRequestPayload) => void
  initialUpdateRequestPayload?: ApFirmwareUpdateRequestPayload
}
export function UpdateFirmwarePerApModelPanel (props: UpdateFirmwarePerApModelPanelProps) {
  const { $t } = useIntl()
  const { selectedVenuesFirmwares, updateUpdateRequestPayload, initialUpdateRequestPayload } = props
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
      updateUpdateRequestPayload={updateUpdateRequestPayload}
      initialUpdateRequestPayload={initialUpdateRequestPayload}
    />
  </>)
}
