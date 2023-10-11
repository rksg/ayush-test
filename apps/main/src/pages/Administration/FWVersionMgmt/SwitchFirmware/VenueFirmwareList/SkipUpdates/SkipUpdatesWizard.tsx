
import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import {
  Modal, ModalType, StepsForm, Subtitle, showActionModal
} from '@acx-ui/components'
import {
  FirmwareCategory,
  FirmwareSwitchVenue,
  UpdateScheduleRequest
} from '@acx-ui/rc/utils'

import { NestedSwitchFirmwareTable } from '../NestedSwitchFirmwareTable'
import { useState } from 'react'


export interface SkipUpdatesWizardProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateScheduleRequest) => void,
  data: FirmwareSwitchVenue[],
}

export function SkipUpdatesWizard (props: SkipUpdatesWizardProps) {
  const [form] = Form.useForm()
  const { $t } = useIntl()
  const handleAddCli = async () => {
    try {
      // await addCliTemplate({
      //   params, payload: {
      //     ..._.omit(data, ['applyNow', 'cliValid', 'applySwitch']),
      //     applyLater: !data.applyNow,
      //     venueSwitches: transformVenueSwitches(
      //       data.venueSwitches as unknown as Map<string, string[]>[]
      //     )
      //   }
      // }).unwrap()
      // navigate(linkToNetworks, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  const [skipModalVisible, setSkipModalVisible] = useState(true)

  return <Modal
    title={$t({ defaultMessage: 'Update Now' })}
    type={ModalType.ModalStepsForm}
    visible={props.visible}
    mask={true}
    children={
      <StepsForm
        form={form}
        editMode={false}
        onCancel={props.onCancel}
        onFinish={handleAddCli}
      >
        <StepsForm.StepForm
          key='selectSwitches'
          name='selectSwitches'
          title={$t({ defaultMessage: 'Select Switch(es)' })}
          layout='horizontal'
        >
          <NestedSwitchFirmwareTable
            data={props.data as FirmwareSwitchVenue[]}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name='firmware'
          title={$t({ defaultMessage: 'Select Firmware' })}
        >
          TBC (..•˘_˘•..)<br/><br/>
          {/* <Modal
            visible={skipModalVisible}
            onCancel={() => { setSkipModalVisible(false) }}
            title={'test'}>'wewe</Modal> */}

        </StepsForm.StepForm>

      </StepsForm>

    }
  />
}
