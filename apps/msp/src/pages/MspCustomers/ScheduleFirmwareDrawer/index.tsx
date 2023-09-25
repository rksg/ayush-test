import { useState } from 'react'

import { Form, Radio, RadioChangeEvent, Select, Space } from 'antd'
import { useForm }                                      from 'antd/lib/form/Form'
import { useIntl }                                      from 'react-intl'

import {
  Button,
  DatePicker,
  Drawer
} from '@acx-ui/components'
import {
  useMspEcFirmwareUpgradeSchedulesMutation
} from '@acx-ui/msp/services'
import { AVAILABLE_SLOTS } from '@acx-ui/rc/utils'
import { useParams }       from '@acx-ui/react-router-dom'

import ChangeSlot                    from './ChangeSlot'
import { RecommandFirmwareVersions } from './RecommandFirmwareVersions'
import * as UI                       from './styledComponents'

interface ScheduleFirmwareDrawerProps {
  visible: boolean
  tenantIds: string[]
  setVisible: (visible: boolean) => void
}

interface AutoSchedule {
  days: string[],
  times: string[]
}

interface ManualSchedule {
  date: string,
  time: string
}

interface ScheduleData {
  mspEcList: string[],
  autoSchedule: AutoSchedule,
  manualSchedule: ManualSchedule
}

interface ScheduleMultiEcFirmware {
  operation: string,
  data: ScheduleData
}

enum ScheduleMode {
  Automatically,
  Manually
}

export const ScheduleFirmwareDrawer = (props: ScheduleFirmwareDrawerProps) => {
  const { $t } = useIntl()

  const { visible, tenantIds, setVisible } = props
  const [resetField, setResetField] = useState(false)
  const [scheduleUpdatePage, setScheduleUpdatePage] = useState(false)
  const [scheduleMode, setScheduleMode] = useState(ScheduleMode.Automatically)
  const [valueDays, setValueDays] = useState<string[]>(['Saturday'])
  const [valueTimes, setValueTimes] = useState<string[]>(['00:00 - 02:00'])
  const [onSlotChange, setOnSlotChange] = useState(false)
  const params = useParams()
  const [form] = useForm()
  const { Option } = Select

  const onClose = () => {
    setVisible(false)
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onScheduleModeChange = (e: RadioChangeEvent) => {
    setScheduleMode(e.target.value)
    // setDisableSave(false)
  }

  const showSlotChange = () => {
    setOnSlotChange(true)
  }

  // const handleModalCancel = () => {
  //   setModelVisible(false)
  // }

  // const handleModalSubmit = (data: { valueDays: string[], valueTimes: string[] }) => {
  //   setValueDays(data.valueDays)
  //   setValueTimes(data.valueTimes)
  //   if (data.valueDays.length === 0 || data.valueTimes.length ===0) {
  //     setDisableSave(true)
  //   } else {
  //     setDisableSave(false)
  //   }
  // }

  const [ updateFirmwareUpgradeSchedules ] = useMspEcFirmwareUpgradeSchedulesMutation()

  const handleNextClick = () => {
    setScheduleUpdatePage(true)
  }

  const handleScheduleUpdate = () => {
    let manual: ManualSchedule = { date: '', time: '' }
    let auto: AutoSchedule = { days: [], times: [] }
    const payload: ScheduleMultiEcFirmware = {
      operation: 'AP_FIRMWARE_UPGRADE',
      data: {
        mspEcList: tenantIds,
        manualSchedule: manual,
        autoSchedule: auto
      }
    }

    updateFirmwareUpgradeSchedules({ params, payload })
      .then(() => {
        setVisible(false)
        resetFields()
      })
    setVisible(false)
  }

  const contentScheduleFirmwareUpdate =
  <>
    {!onSlotChange && <Space size={18} direction='vertical'>
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
                <UI.ChangeButton
                  type='link'
                  disabled={scheduleMode === ScheduleMode.Manually}
                  onClick={showSlotChange}
                  block>
                  {$t({ defaultMessage: 'Change' })}
                </UI.ChangeButton>
              </Radio>
              <Radio value={ScheduleMode.Manually}>
                {$t({ defaultMessage: 'Schedule updates manually' })}
                <UI.GreyTextSection>
                  <div>{$t({ defaultMessage:
                  '- Applies only to selected MSP Customers and their tennants.' })}</div>
                </UI.GreyTextSection>
                {scheduleMode === ScheduleMode.Manually &&
                <div style={{ marginTop: 10 }}>
                  <label>{$t({ defaultMessage: 'Enter Specific Date' })}</label>
                  <DatePicker
                    showToday={false}
                    allowClear={false}
                    style={{ marginTop: 8, marginBottom: 15, width: '100%' }}
                    // disabledDate={disabledDate}
                    // onChange={onChange}
                  />
                  <label>{$t({ defaultMessage: 'Scheduled Time Slots' })}</label>
                  <Select style={{ marginTop: 8, width: '100%' }}>
                    {
                      AVAILABLE_SLOTS.map(item => (
                        <Option
                          key={item.label}
                          value={item.value}>{item.label}
                        </Option>
                      ))
                    }
                  </Select>
                </div>}
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Space>}
    {onSlotChange && <ChangeSlot
      // visible={modelVisible}
      // onCancel={handleModalCancel}
      // onSubmit={handleModalSubmit}
      days={valueDays as string[]}
      times={valueTimes as string[]}
    />}
  </>

  const footer =<div>
    {scheduleUpdatePage
      ? <Button
        onClick={() => handleScheduleUpdate()}
        type='primary'
      >
        {$t({ defaultMessage: 'Schedule Update' })}
      </Button>
      : <Button
        onClick={() => handleNextClick()}
        type='primary'
      >
        {$t({ defaultMessage: 'Next' })}
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
      {scheduleUpdatePage ? contentScheduleFirmwareUpdate : <RecommandFirmwareVersions/>}
    </Drawer>
  )
}
