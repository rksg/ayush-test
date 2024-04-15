
import { useState } from 'react'

import { useIntl } from 'react-intl'


import { Button }                                    from '@acx-ui/components'
import { useUpdateVenueSchedulesPerApModelMutation } from '@acx-ui/rc/services'
import {
  FirmwareVenuePerApModel,
  UpdateFirmwareSchedulePerApModelPayload
} from '@acx-ui/rc/utils'


import * as UI                              from '../styledComponents'
import { UpdateFirmwarePerApModelFirmware } from '../UpdateNowDialog'

import FirmwareSelectorPanel from './FirmwareSelectorPanel'
import ScheduleSelectorPanel from './ScheduleSelectorPanel'

interface ChangeSchedulePerApModelDialogProps {
  onCancel: () => void
  afterSubmit: () => void
  selectedVenuesFirmwares: FirmwareVenuePerApModel[]
}

export function ChangeSchedulePerApModelDialog (props: ChangeSchedulePerApModelDialogProps) {
  const { $t } = useIntl()
  const [ updateVenueSchedules ] = useUpdateVenueSchedulesPerApModelMutation()
  const { afterSubmit, onCancel, selectedVenuesFirmwares } = props
  const [ step, setStep ] = useState(0)
  const [ payload, setPayload ] = useState<UpdateFirmwarePerApModelFirmware>()
  const [ selectedDate, setSelectedDate ] = useState<string>()
  const [ selectedTime, setSelectedTime ] = useState<string>()

  const triggerSubmit = async () => {
    try {
      const requests = selectedVenuesFirmwares.map(venueFw => {
        return updateVenueSchedules({
          params: { venueId: venueFw.id },
          payload: createRequestPayload()
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

  const createRequestPayload = (): UpdateFirmwareSchedulePerApModelPayload => {
    return { date: selectedDate!, time: selectedTime!, targetFirmwares: payload! }
  }

  const updatePayload = (targetFirmwares: UpdateFirmwarePerApModelFirmware = []) => {
    setPayload(targetFirmwares.filter(fw => fw.firmware))
  }

  const updateDate = (date: string) => {
    setSelectedDate(date)
  }

  const updateTime = (time: string) => {
    setSelectedTime(time)
  }

  const onNext = () => {
    setStep(1)
  }

  const onBack = () => {
    setStep(0)
  }

  return (
    <UI.ScheduleModal
      title={$t({ defaultMessage: 'Change Update Schedule' })}
      visible={true}
      footer={[
        <Button key='cancel' onClick={onModalCancel}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>,
        <Button
          hidden={step === 1}
          key='next'
          type='primary'
          onClick={onNext}
          disabled={!payload || payload.length === 0}
        >
          {$t({ defaultMessage: 'Next' })}
        </Button>,
        <Button hidden={step === 0} key='back' onClick={onBack}>
          {$t({ defaultMessage: 'Back' })}
        </Button>,
        <Button
          hidden={step === 0}
          key='save'
          type='primary'
          onClick={triggerSubmit}
          disabled={!selectedDate || !selectedTime}
        >
          {$t({ defaultMessage: 'Save' })}
        </Button>
      ]}
    >
      {step === 0 &&
        <FirmwareSelectorPanel
          selectedVenuesFirmwares={selectedVenuesFirmwares}
          updatePayload={updatePayload}
          initialPayload={payload}
        />
      }
      {step === 1 &&
        <ScheduleSelectorPanel
          initialDate={selectedDate}
          initialTime={selectedTime}
          updateDate={updateDate}
          updateTime={updateTime}
        />
      }
    </UI.ScheduleModal>
  )
}
