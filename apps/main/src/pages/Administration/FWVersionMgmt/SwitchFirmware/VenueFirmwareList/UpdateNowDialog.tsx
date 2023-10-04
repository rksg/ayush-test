import { useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space } from 'antd'
import { useForm }                              from 'antd/lib/form/Form'
import { useIntl }                              from 'react-intl'

import {
  Modal, ModalType, StepsForm, Subtitle
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  FirmwareSwitchVenue,
  FirmwareVersion,
  UpdateScheduleRequest
} from '@acx-ui/rc/utils'

import {
  getSwitchVersionLabel
} from '../../FirmwareUtils'

import * as UI from './styledComponents'
import { NestedSwitchFirmwareTable } from './NestedSwitchFirmwareTable'

export interface UpdateNowDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateScheduleRequest) => void,
  data: FirmwareSwitchVenue[],
}

export function UpdateNowDialog(props: UpdateNowDialogProps) {
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
        onCancel={() => { }}
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
          // visible={updateModelVisible}
          // data={venues}
          // availableVersions={filterVersions(upgradeVersions)}
          // nonIcx8200Count={nonIcx8200Count}
          // icx8200Count={icx8200Count}
          // onCancel={handleUpdateModalCancel}
          // onSubmit={handleUpdateModalSubmit}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name='firmware'
          title={$t({ defaultMessage: 'Select Firmware' })}
        >
          <div>test</div>
        </StepsForm.StepForm>

      </StepsForm>

      // <NestedSwitchFirmwareTable
      // tableQuery={tableQuery}
      // visible={updateModelVisible}
      // data={venues}
      // availableVersions={filterVersions(upgradeVersions)}
      // nonIcx8200Count={nonIcx8200Count}
      // icx8200Count={icx8200Count}
      // onCancel={handleUpdateModalCancel}
      // onSubmit={handleUpdateModalSubmit}
      // />
    }
  />
}
