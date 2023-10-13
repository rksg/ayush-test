
import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  Modal, ModalType, StepsForm
} from '@acx-ui/components'
import {
  FirmwareCategory,
  FirmwareSwitchVenue,
  SwitchFirmwareStatusType,
  UpdateScheduleRequest
} from '@acx-ui/rc/utils'

import { NestedSwitchFirmwareTable } from '../NestedSwitchFirmwareTable'

import { UpdateNowDialog } from './UpdateNowDialog'

export interface UpdateNowWizardProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateScheduleRequest) => void,
  data: FirmwareSwitchVenue[],
}

export function UpdateNowWizard (props: UpdateNowWizardProps) {
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
          <UpdateNowDialog
            visible={true}
            availableVersions={[]}
            onCancel={()=>{}}
            onSubmit={()=>{}}
            data={[ {
              id: '156c8b7daa464b06b4fd59ae38dcce30',
              name: 'kittoVenue',
              switchFirmwareVersion: {
                id: '09010f_b403',
                name: '09010f_b403',
                category: FirmwareCategory.RECOMMENDED
              },
              switchFirmwareVersionAboveTen: {
                id: '10010_b214',
                name: '10010_b214',
                category: FirmwareCategory.RECOMMENDED
              },
              availableVersions: [
                {
                  id: '09010h_cd1_b3',
                  name: '09010h_cd1_b3',
                  category: FirmwareCategory.RECOMMENDED
                },
                {
                  id: '10010_b214',
                  name: '10010_b214',
                  category: FirmwareCategory.RECOMMENDED
                }
              ],
              nextSchedule: {
                timeSlot: {
                  startDateTime: '2023-10-05T00:00:00-07:00',
                  endDateTime: '2023-10-05T02:00:00-07:00'
                },
                version: {
                  id: '09010h_cd1_b3',
                  name: '09010h_cd1_b3',
                  category: FirmwareCategory.RECOMMENDED
                }
              },
              lastScheduleUpdateTime: '2023-09-22T09:00:00.030+00:00',
              preDownload: false,
              switchCount: 0,
              aboveTenSwitchCount: 0,
              status: SwitchFirmwareStatusType.SUCCESS,
              scheduleCount: 1
            }]}
            nonIcx8200Count={1}
            icx8200Count={1}
          />
        </StepsForm.StepForm>

      </StepsForm>

    }
  />
}
