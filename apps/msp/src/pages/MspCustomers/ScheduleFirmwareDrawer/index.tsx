import { useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space } from 'antd'
import { useForm }                              from 'antd/lib/form/Form'
import { useIntl }                              from 'react-intl'

import {
  Button,
  Drawer,
  Subtitle
} from '@acx-ui/components'
import {
  useMspEcFirmwareUpgradeSchedulesMutation//,
  // useGetRecommandFirmwareUpgradeQuery
} from '@acx-ui/msp/services'
import {
  MspAdministrator
} from '@acx-ui/msp/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { RolesEnum } from '@acx-ui/types'

import { ChangeSlotDialog } from './ChangeSlotDialog'
import * as UI              from './styledComponents'

interface ScheduleFirmwareDrawerProps {
  visible: boolean
  tenantIds: string[]
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspAdministrator[]) => void
}

interface SelectedMspMspAdmins {
  mspAdminId: string
  mspAdminRole: RolesEnum
}

interface AssignedMultiEcMspAdmins {
  operation: string
  mspEcId: string
  mspAdminRoles: SelectedMspMspAdmins[]
}

enum ScheduleMode {
  Automatically,
  Manually
}

export const ScheduleFirmwareDrawer = (props: ScheduleFirmwareDrawerProps) => {
  const { $t } = useIntl()

  const { visible, tenantIds, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [scheduleUpdatePage, setScheduleUpdatePage] = useState(false)
  const [selectedRows, setSelectedRows] = useState<MspAdministrator[]>([])
  const [scheduleMode, setScheduleMode] = useState(ScheduleMode.Automatically)
  const [valueDays, setValueDays] = useState<string[]>(['Saturday'])
  const [valueTimes, setValueTimes] = useState<string[]>(['00:00 - 02:00'])
  const [modelVisible, setModelVisible] = useState(false)
  const params = useParams()
  const [form] = useForm()

  // const queryResults = useGetRecommandFirmwareUpgradeQuery({ params: useParams() })

  const onClose = () => {
    setVisible(false)
    setSelectedRows([])
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onScheduleModeChange = (e: RadioChangeEvent) => {
    setScheduleMode(e.target.value)
    // setDisableSave(false)
  }

  const showSlotModal = () => {
    setModelVisible(true)
  }

  const handleModalCancel = () => {
    setModelVisible(false)
  }

  const handleModalSubmit = (data: { valueDays: string[], valueTimes: string[] }) => {
    setValueDays(data.valueDays)
    setValueTimes(data.valueTimes)
    // if (data.valueDays.length === 0 || data.valueTimes.length ===0) {
    //   setDisableSave(true)
    // } else {
    //   setDisableSave(false)
    // }
  }

  const [ updateFirmwareUpgradeSchedules ] = useMspEcFirmwareUpgradeSchedulesMutation()

  const handleNextClick = () => {
    setScheduleUpdatePage(true)
  }

  const handleScheduleUpdate = () => {
    let selMspAdmins: SelectedMspMspAdmins[] = []
    let assignedEcMspAdmins: AssignedMultiEcMspAdmins[] = []
    tenantIds.forEach((id: string) => {
      assignedEcMspAdmins.push ({
        operation: 'ADD',
        mspEcId: id,
        mspAdminRoles: selMspAdmins
      })
    })

    updateFirmwareUpgradeSchedules({ params, payload: { associations: assignedEcMspAdmins } })
      .then(() => {
        setSelected(selectedRows)
        setVisible(false)
        resetFields()
      })
    setVisible(false)
  }

  const contentFirmwareVersions =
    <Space size={18} direction='vertical'>
      <Subtitle level={4}>
        {$t({
          defaultMessage: 'Firmware Version: 6.2.0.103.17.10'
        })}
      </Subtitle>

      <h4>{$t({
        defaultMessage:
        `All selected MSP Customers will be upgraded to this firmware version. 
        Tenants that already have this or higher firmware version installed won’t change.`
      })}</h4>
      <h4>{$t({
        defaultMessage:
        `During firmware upgrade all selected network devices will reboot and 
        service may be interrupted for up to 15 minutes.`
      })}</h4>
      <h4>{$t({
        defaultMessage:
        `Are you sure you want to upgrade the firmware version on devices 
        for selected customers?`
      })}</h4>
    </Space>

  const contentScheduleFirmwareUpdate =
  <>
    <Space size={18} direction='vertical'>

      <h4>{$t({
        defaultMessage:
        `Any changes done to the Saved Schedule or a Manual option will overwrite previously 
        scheduled configurations in Preferences.`
      })}</h4>
      <Form
        form={form}
        name={'preferencesModalForm'}
      >
        <Form.Item
          initialValue={ScheduleMode.Automatically}
        >
          <Radio.Group
            onChange={onScheduleModeChange}
            value={scheduleMode}>
            <Space direction={'vertical'}>
              <Radio value={ScheduleMode.Automatically}>
                {$t({ defaultMessage: 'Use saved schedule' })}
                <UI.GreyTextSection>
                  <div>{$t({
                    defaultMessage: '- Schedule is based on venues local time-zone' })}</div>
                  <div>{$t({
                    defaultMessage: '- Applies to all newly added venues automatically' })}</div>
                </UI.GreyTextSection>
                <UI.PreferencesSection>
                  <div>{$t({ defaultMessage: 'Firmware updates occur on:' })}</div>
                  <div>{valueDays.join(', ')}</div>
                  <div style={{ paddingBottom: 8 }}>
                    {$t({ defaultMessage: 'at:' })} {valueTimes.join(', ')}</div>
                </UI.PreferencesSection>
                <UI.ChangeButton type='link' onClick={showSlotModal} block>
                  {$t({ defaultMessage: 'Change' })}
                </UI.ChangeButton>
              </Radio>
              <Radio value={ScheduleMode.Manually}>
                {$t({ defaultMessage: 'Schedule updates manually' })}
                <UI.GreyTextSection>
                  <div>{$t({ defaultMessage:
                  '- Applies only to selected MSP Customers and their tennants.' })}</div>
                </UI.GreyTextSection>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Space>
    {/* </Modal> */}
    <ChangeSlotDialog
      visible={modelVisible}
      onCancel={handleModalCancel}
      onSubmit={handleModalSubmit}
      // days={data.days as string[]}
      // times={data.times as string[]}
    />

  </>

  const footer =<div>
    {!scheduleUpdatePage && <Button
      onClick={() => handleNextClick()}
      type='primary'
    >
      {$t({ defaultMessage: 'Next' })}
    </Button>}
    {scheduleUpdatePage && <Button
      onClick={() => handleScheduleUpdate()}
      type='primary'
    >
      {$t({ defaultMessage: 'Schedule Update' })}
    </Button>}


    <Button onClick={() => {
      setVisible(false)
    }}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Schedule Firmware Update' })}
      visible={visible}
      onClose={onClose}
      footer={footer}
      destroyOnClose={resetField}
      width={452}
    >
      {scheduleUpdatePage ? contentScheduleFirmwareUpdate : contentFirmwareVersions}
    </Drawer>
  )
}
