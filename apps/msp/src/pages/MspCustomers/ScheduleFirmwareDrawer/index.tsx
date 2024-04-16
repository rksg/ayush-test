import { useState } from 'react'

import { Form, Radio, RadioChangeEvent, Select, Space } from 'antd'
import { useForm }                                      from 'antd/lib/form/Form'
import moment                                           from 'moment'
import { Moment }                                       from 'moment-timezone'
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
  timeSlots: string[]
}

interface ManualSchedule {
  date: string,
  timeSlot: string
}

interface ScheduleData {
  mspEcList: string[],
  autoSchedule?: AutoSchedule,
  manualSchedule?: ManualSchedule
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
  const [valueDays, setValueDays] = useState<string[]>([])
  const [valueTimes, setValueTimes] = useState<string[]>([])
  const [changedValueDays, setChangedValueDays] = useState<string[]>([])
  const [changedValueTimes, setChangedValueTimes] = useState<string[]>([])
  const [onSlotChange, setOnSlotChange] = useState(false)
  const [updateEnabled, setUpdateEnabled] = useState(false)
  const [slotChangeSaveEnabled, setSlotChangeSaveEnabled] = useState(false)
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
    validateValues(e.target.value)
    // setDisableSave(false)
  }

  const onManualDateChange = () => {
    validateValues(ScheduleMode.Manually)
  }

  const onManualTimesChange = () => {
    validateValues(ScheduleMode.Manually)
  }

  const validateValues = (scheduleMode: ScheduleMode) => {
    if (scheduleMode === ScheduleMode.Automatically) {
      setUpdateEnabled(valueDays.length > 0 && valueTimes.length > 0)
    }
    else {
      setUpdateEnabled(form.getFieldValue('manualDate') && form.getFieldValue('manualTimes'))
    }
  }

  const showSlotChange = () => {
    setOnSlotChange(true)
  }

  const [ updateFirmwareUpgradeSchedules ] = useMspEcFirmwareUpgradeSchedulesMutation()

  const handleNextClick = () => {
    setScheduleUpdatePage(true)
  }

  const handleScheduleUpdate = () => {
    let manualSchedule
    let autoSchedule
    if (scheduleMode === ScheduleMode.Manually) {
      const manualDate = form.getFieldValue('manualDate') as Moment
      manualSchedule = {
        date: manualDate.format('YYYY-MM-DD'),
        timeSlot: form.getFieldValue('manualTimes')
      }
    }
    else {
      autoSchedule = {
        days: valueDays,
        timeSlots: valueTimes
      }
    }
    const payload: ScheduleMultiEcFirmware = {
      operation: 'AP_FIRMWARE_UPGRADE',
      data: {
        mspEcList: tenantIds,
        manualSchedule: manualSchedule,
        autoSchedule: autoSchedule
      }
    }

    updateFirmwareUpgradeSchedules({ params, payload })
      .then(() => {
        setVisible(false)
        resetFields()
      })
    setVisible(false)
  }

  const ScheduleFirmware = () => {
    return (
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
                  // eslint-disable-next-line max-len
                  '- Applies only to the selected MSP Customers and their <venuePlural></venuePlural>.' })}</div>
                  </UI.GreyTextSection>
                  {scheduleMode === ScheduleMode.Manually &&
                <div style={{ marginTop: 10 }}>
                  <label>{$t({ defaultMessage: 'Enter Specific Date' })}</label>
                  <label>
                    <Form.Item name='manualDate'>
                      <DatePicker
                        showToday={false}
                        allowClear={false}
                        style={{ marginTop: 8, marginBottom: 15, width: '100%' }}
                        disabledDate={(current) => {
                          return current && current < moment().endOf('day')
                        }}
                        onChange={onManualDateChange}
                      />
                    </Form.Item>
                  </label>
                  <label>{$t({ defaultMessage: 'Scheduled Time Slots' })}</label>
                  <label>
                    <Form.Item name='manualTimes'>
                      <Select style={{ marginTop: 8, width: '100%' }}
                        onChange={onManualTimesChange}>
                        {
                          AVAILABLE_SLOTS.map(item => (
                            <Option
                              key={item.label}
                              value={item.value}>{item.label}
                            </Option>
                          ))
                        }
                      </Select>
                    </Form.Item>
                  </label>
                </div>}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Space>
    )
  }

  const onSlotChangeSave = async () => {
    setValueDays(changedValueDays)
    setValueTimes(changedValueTimes)
    setUpdateEnabled(true)
    setOnSlotChange(false)
  }

  const onSlotChangeCancel = async () => {
    setChangedValueDays(valueDays)
    setChangedValueTimes(valueTimes)
    validateValues(ScheduleMode.Automatically)
    setOnSlotChange(false)
  }

  const contentScheduleFirmwareUpdate =
    onSlotChange ?
      <ChangeSlot
        days={valueDays as string[]}
        times={valueTimes as string[]}
        setChangedValueDays={setChangedValueDays}
        setChangedValueTimes={setChangedValueTimes}
        setSaveEnabled={setSlotChangeSaveEnabled}
      /> : <ScheduleFirmware/>

  const footerSlotChange =<div>
    <Button
      onClick={onSlotChangeSave}
      disabled={!slotChangeSaveEnabled}
      type='primary'>
      {$t({ defaultMessage: 'Save' })}
    </Button>

    <Button onClick={onSlotChangeCancel}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  const footer =<div>
    {scheduleUpdatePage
      ? <Button
        onClick={() => handleScheduleUpdate()}
        disabled={!updateEnabled}
        type='primary'>
        {$t({ defaultMessage: 'Schedule Update' })}
      </Button>
      : <Button
        onClick={() => handleNextClick()}
        type='primary'>
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
      footer={onSlotChange ? footerSlotChange : footer}
      destroyOnClose={resetField}
      width={452}
    >
      {scheduleUpdatePage ? contentScheduleFirmwareUpdate : <RecommandFirmwareVersions/>}
    </Drawer>
  )
}
