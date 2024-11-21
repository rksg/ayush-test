import { useState } from 'react'

import { Form, Typography } from 'antd'
import { useIntl }          from 'react-intl'

import { Button, Modal }                    from '@acx-ui/components'
import {
  UpdateFirmwarePerApModelFirmware,
  UpdateFirmwarePerApModelIndividualPanel
} from '@acx-ui/rc/components'
import { usePatchVenueApModelFirmwaresMutation }                    from '@acx-ui/rc/services'
import { FirmwareVenuePerApModel, UpdateFirmwarePerApModelPayload } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

enum DowngradeSteps {
  INTRODUCTION,
  VERSION_SELECTION,
  CONFIRMATION,
  CONCLUSION
}

export interface DowngradeDialogProps {
  onCancel: () => void
  afterSubmit: () => void
  selectedVenuesFirmwares: FirmwareVenuePerApModel[]
}

export function DowngradePerApModelDialog (props: DowngradeDialogProps) {
  const { $t } = useIntl()
  const { onCancel, afterSubmit, selectedVenuesFirmwares } = props
  const [ disableSave, setDisableSave ] = useState(false)
  const [ payload, setPayload ] = useState<UpdateFirmwarePerApModelFirmware>([])
  const [ step, setStep ] = useState<DowngradeSteps>(DowngradeSteps.INTRODUCTION)
  // eslint-disable-next-line max-len
  const [ updateVenueApModelFirmwares, { isLoading: isUpdating } ] = usePatchVenueApModelFirmwaresMutation()

  const triggerSubmit = async () => {
    try {
      await updateVenueApModelFirmwares({ payload: createRequestPayload() }).unwrap()

      onNext()
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

  const onModalClose = () => {
    afterSubmit()
    onCancel()
  }

  const onNext = () => {
    setStep(step => step + 1)
  }

  const onBack = () => {
    setStep(step => step - 1)
  }

  const canGoNext = (): boolean => {
    return step !== DowngradeSteps.VERSION_SELECTION || !disableSave
  }

  const isNextBtnVisible = (): boolean => {
    return step === DowngradeSteps.VERSION_SELECTION
  }

  const isBackBtnVisible = (): boolean => {
    return step === DowngradeSteps.CONFIRMATION
  }

  const isDowngradeBtnVisible = (): boolean => {
    return step === DowngradeSteps.CONFIRMATION
  }

  const isCloseBtnVisible = (): boolean => {
    return step === DowngradeSteps.CONCLUSION
  }

  const isContinueBtnVisible = (): boolean => {
    return step === DowngradeSteps.INTRODUCTION
  }

  const isCancelBtnVisible = (): boolean => {
    return step !== DowngradeSteps.CONCLUSION
  }

  const updatePayload = (targetFirmwares: UpdateFirmwarePerApModelFirmware = []) => {
    const compactedTargetFirmwares = targetFirmwares.filter(fw => fw.firmware)
    setPayload(compactedTargetFirmwares)
    setDisableSave(compactedTargetFirmwares.length === 0)
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Firmware Downgrade' })}
      visible={true}
      width={560}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      footer={[
        <Button hidden={!isContinueBtnVisible()} key='continue' onClick={onNext}>
          {$t({ defaultMessage: 'Continue' })}
        </Button>,
        <Button hidden={!isBackBtnVisible()} key='back' onClick={onBack}>
          {$t({ defaultMessage: 'Back' })}
        </Button>,
        // eslint-disable-next-line max-len
        <Button hidden={!isNextBtnVisible()} key='next' type='primary' onClick={onNext} disabled={!canGoNext()}>
          {$t({ defaultMessage: 'Next' })}
        </Button>,
        // eslint-disable-next-line max-len
        <Button hidden={!isDowngradeBtnVisible()} key='downgrade' type='primary' onClick={triggerSubmit} loading={isUpdating}>
          {$t({ defaultMessage: 'Downgrade Firmware' })}
        </Button>,
        <Button hidden={!isCloseBtnVisible()} key='close' onClick={onModalClose}>
          {$t({ defaultMessage: 'Close' })}
        </Button>,
        <Button hidden={!isCancelBtnVisible()} key='cancel' onClick={onModalCancel}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
      ]}
    >
      <>
        { step === DowngradeSteps.INTRODUCTION && <IntroductionView /> }
        { step === DowngradeSteps.VERSION_SELECTION &&
          <UpdateFirmwarePerApModelIndividualPanel
            selectedVenuesFirmwares={selectedVenuesFirmwares}
            updatePayload={updatePayload}
            isUpgrade={false}
          />
        }
        { step === DowngradeSteps.CONFIRMATION && <ConfirmationView /> }
        { step === DowngradeSteps.CONCLUSION && <ConclusionView /> }

      </>
    </Modal>
  )
}

function IntroductionView () {
  const { $t } = useIntl()

  return <Form.Item>
    <Typography style={{ fontWeight: 700 }}>
      {$t({ defaultMessage: 'Downgrading firmware:' })}
    </Typography>
    <UI.Ul>
      { // eslint-disable-next-line max-len
        <UI.Li>{$t({ defaultMessage: 'Will cause network interruption and may impact service delivery;' })}</UI.Li>}
      { // eslint-disable-next-line max-len
        <UI.Li>{$t({ defaultMessage: 'Newly delivered features may no longer work with older firmware versions;' })}</UI.Li>}
      { // eslint-disable-next-line max-len
        <UI.Li>{$t({ defaultMessage: 'May reduce some functionality.' })}</UI.Li>}
    </UI.Ul>
    <Typography>
      { // eslint-disable-next-line max-len
        $t({ defaultMessage: 'Are you sure you want to downgrade the firmware version on devices in selected <venueSingular></venueSingular>?' })}
    </Typography>
  </Form.Item>
}

function ConfirmationView () {
  const { $t } = useIntl()

  return <Typography>
    { // eslint-disable-next-line max-len
      $t({ defaultMessage: 'Are you sure you want to downgrade the firmware version on devices in this <venueSingular></venueSingular>?' })}
  </Typography>
}

function ConclusionView () {
  const { $t } = useIntl()

  return <Form.Item>
    <Typography>
      { // eslint-disable-next-line max-len
        $t({ defaultMessage: 'Firmware downgrade started on devices in the selected <venueSingular></venueSingular>.' })}
    </Typography>
    <Typography>
      { // eslint-disable-next-line max-len
        $t({ defaultMessage: 'When completed, the result will be posted in the notification panel.' })}
    </Typography>
  </Form.Item>
}


