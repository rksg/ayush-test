import { useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                          from 'antd/lib/form/Form'
import { useIntl }                                          from 'react-intl'

import { Modal }              from '@acx-ui/components'
import { UpgradePreferences } from '@acx-ui/rc/utils'

import { ChangeSlotDialog } from './ChangeSlotDialog'
import * as UI              from './styledComponents'

enum ScheduleMode {
  Automatically,
  Manually
}

interface PreferencesDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpgradePreferences) => void,
  data: UpgradePreferences
}

export function PreferencesDialog (props: PreferencesDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  const { visible, onSubmit, onCancel, data } = props
  const [scheduleMode, setScheduleMode] = useState(ScheduleMode.Automatically)
  const [valueDays, setValueDays] = useState<string[]>(['Saturday'])
  const [valueTimes, setValueTimes] = useState<string[]>(['00:00-02:00'])
  const [modelVisible, setModelVisible] = useState(false)
  const [disableSave, setDisableSave] = useState(false)

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line max-len
      data.autoSchedule ? setScheduleMode(ScheduleMode.Automatically) : setScheduleMode(ScheduleMode.Manually)
    }
    if (data && data.days) {
      setValueDays([...data.days])
    }
    if (data && data.times) {
      setValueTimes([...data.times])
    }
  }, [])

  const showSlotModal = () => {
    setModelVisible(true)
  }

  const handleModalCancel = () => {
    setModelVisible(false)
  }

  const handleModalSubmit = (data: { valueDays: string[], valueTimes: string[] }) => {
    setValueDays(data.valueDays)
    setValueTimes(data.valueTimes)
    if (data.valueDays.length === 0 || data.valueTimes.length ===0) {
      setDisableSave(true)
    } else {
      setDisableSave(false)
    }
  }

  const createRequest = (): UpgradePreferences => {
    return {
      days: valueDays,
      times: valueTimes,
      autoSchedule: scheduleMode === ScheduleMode.Automatically,
      betaProgram: data.betaProgram
    }
  }

  const triggerSubmit = () => {
    onSubmit(createRequest())
    onCancel()
  }

  const onScheduleModeChange = (e: RadioChangeEvent) => {
    setScheduleMode(e.target.value)
  }

  const onModalCancel = () => {
    form.resetFields()
    // eslint-disable-next-line max-len
    data.autoSchedule ? setScheduleMode(ScheduleMode.Automatically) : setScheduleMode(ScheduleMode.Manually)
    setValueDays([...data.days as string[]])
    setValueTimes([...data.times as string[]])
    onCancel()
  }

  return (
    <>
      <Modal
        title={$t({ defaultMessage: 'Preferences' })}
        visible={visible}
        width={560}
        okText={$t({ defaultMessage: 'Save Preferences' })}
        onOk={triggerSubmit}
        onCancel={onModalCancel}
        okButtonProps={{ disabled: disableSave }}
      >
        <Form
          form={form}
          name={'preferencesModalForm'}
        >
          <Form.Item
            initialValue={ScheduleMode.Automatically}
          >
            <div>
              <Typography>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Choose update schedule method:' })}
              </Typography>
              <Radio.Group onChange={onScheduleModeChange} value={scheduleMode}>
                <Space direction={'vertical'}>
                  <Radio value={ScheduleMode.Automatically}>
                    {$t({ defaultMessage: 'Schedule Automatically' })}
                    { // eslint-disable-next-line max-len
                      <div>Upgrade preference saved for each venue based on venue’s local time-zone</div>}
                    <UI.PreferencesSection>
                      <div>Preferred update slot(s):</div>
                      <div>{valueDays.join(', ')}</div>
                      <div>{valueTimes.join(', ')}</div>
                    </UI.PreferencesSection>
                    <UI.ChangeButton type='link' onClick={showSlotModal} block>
                      Change
                    </UI.ChangeButton>
                  </Radio>
                  <Radio value={ScheduleMode.Manually}>
                    {$t({ defaultMessage: 'Schedule Manually' })}
                    <div>Manually update firmware per venue</div>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <ChangeSlotDialog
        visible={modelVisible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        days={data.days as string[]}
        times={data.times as string[]}
      />
    </>
  )
}
