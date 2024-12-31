import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Modal }                                                    from '@acx-ui/components'
import { usePatchVenueApModelFirmwaresMutation }                    from '@acx-ui/rc/services'
import { FirmwareVenuePerApModel, UpdateFirmwarePerApModelPayload } from '@acx-ui/rc/utils'

import { firmwareNote1, firmwareNote2 } from '../contents'
import * as UI                          from '../styledComponents'

import { UpdateEarlyAccessPerApModelIndividualPanel } from './UpdateEarlyAccessPerApModelIndividualPanel'

export type UpdateFirmwarePerApModelFirmware = UpdateFirmwarePerApModelPayload['targetFirmwares']

export interface UpdateEarlyAccessNowDialogProps {
  onCancel: () => void
  afterSubmit: () => void
  selectedVenuesFirmwares: FirmwareVenuePerApModel[],
  isAlpha: boolean
  isBeta: boolean
}

export function UpdateEarlyAccessNowDialog (props: UpdateEarlyAccessNowDialogProps) {
  const { $t } = useIntl()
  const { onCancel, afterSubmit, selectedVenuesFirmwares, isAlpha, isBeta } = props
  const [ disableSave, setDisableSave ] = useState(false)
  const [ payload, setPayload ] = useState<UpdateFirmwarePerApModelFirmware>([])
  // eslint-disable-next-line max-len
  const [ updateVenueApModelFirmwares, { isLoading: isUpdating } ] = usePatchVenueApModelFirmwaresMutation()

  const triggerSubmit = async () => {
    try {
      await updateVenueApModelFirmwares({ payload: createRequestPayload() }).unwrap()

      onModalCancel()
      afterSubmit()
    } catch (err) {
      console.log(err) // eslint-disable-line no-console
    }
  }

  const createRequestPayload = (): UpdateFirmwarePerApModelPayload => {
    return {
      venueIds: selectedVenuesFirmwares.map(v => v.id),
      targetFirmwares: payload.filter(fw => fw.firmware)
    }
  }

  const onModalCancel = () => {
    onCancel()
  }

  const updatePayload = (targetFirmwares: UpdateFirmwarePerApModelFirmware = []) => {
    const compactedTargetFirmwares = targetFirmwares.filter(fw => fw.firmware)
    setPayload(compactedTargetFirmwares)
    setDisableSave(compactedTargetFirmwares.length === 0)
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Update with Early Access Now' })}
      visible={true}
      width={580}
      okText={$t({ defaultMessage: 'Update Firmware' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      okButtonProps={{ disabled: disableSave, loading: isUpdating }}
      destroyOnClose={true}
    >
      <UpdateEarlyAccessPerApModelIndividualPanel
        selectedVenuesFirmwares={selectedVenuesFirmwares}
        updatePayload={updatePayload}
        isAlpha={isAlpha}
        isBeta={isBeta}
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
