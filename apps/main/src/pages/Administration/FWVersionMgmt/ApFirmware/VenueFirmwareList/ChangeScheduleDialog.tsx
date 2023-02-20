import { useEffect, useState } from 'react'

import { Col, Form, FormInstance, Input, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { useForm }                                                             from 'antd/lib/form/Form'
import moment                                                                  from 'moment-timezone'
import { useIntl }                                                             from 'react-intl'

import { noDataSymbol }                                               from '@acx-ui/analytics/utils'
import { Button, Modal, RangePicker }                                 from '@acx-ui/components'
import { DeleteOutlinedIcon }                                         from '@acx-ui/icons'
import { useLazyGetMacRegListQuery, useLazyGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
import { FirmwareType, FirmwareVenue, MacRegistrationPool }           from '@acx-ui/rc/utils'
import { useDateFilter, dateRangeForLast, useDashboardFilter }        from '@acx-ui/utils'

// import { PersonaDeviceItem } from './PersonaDevicesForm'
import * as UI from './styledComponents'

enum DevicesImportMode {
  FromClientDevices,
  Manually
}

interface DevicesImportDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: []) => void,
  personaGroupId?: string
}

export interface ChangeScheduleDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: []) => void,
  firmwareType: FirmwareType,
  data?: FirmwareVenue[],
  availableVersions?: any,
  eol?: boolean,
  eolName?: string,
  latestEolVersion?: string,
  eolModels?: any
}

export function ChangeScheduleDialog (props: ChangeScheduleDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  const [importMode, setImportMode] = useState(DevicesImportMode.FromClientDevices)
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [macRegistrationPool, setMacRegistrationPool] = useState<MacRegistrationPool>()
  const { visible, onSubmit, onCancel } = props
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const subTitle = 'Choose which version to update the venue to:'

  // useEffect(() => {
  //   if (!personaGroupId) return

  //   getPersonaGroupById({ params: { groupId: personaGroupId } })
  //     .then(result => {
  //       if (!result.data || !result.data?.macRegistrationPoolId) return

  //       getMacRegistrationById({
  //         params: { policyId: result.data.macRegistrationPoolId }
  //       }).then(result => {
  //         if (!result.data) return
  //         setMacRegistrationPool(result.data)
  //       })
  //     })
  // }, [personaGroupId])

  const triggerSubmit = () => {
    // FIXME: need to filter unique device items, but it have type issue
    form.validateFields()
      .then(values => {
        // console.log('Current dialog fields value = ', values)
        onSubmit(values.devices ?? [])
        onModalCancel()
      })
  }

  const onImportModeChange = (e: RadioChangeEvent) => {
    setImportMode(e.target.value)
  }

  const onModalCancel = () => {
    form.resetFields()
    setImportMode(DevicesImportMode.FromClientDevices)
    onCancel()
  }

  return (
    <UI.ScheduleModal
      title={$t({ defaultMessage: 'Change Update Schedule' })}
      subTitle={subTitle}
      visible={visible}
      width={560}
      okText={$t({ defaultMessage: 'Save' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
    >
      <Form
        form={form}
        name={'deviceModalForm'}
      >
        <Form.Item
          name={'importDevicesMode'}
          initialValue={DevicesImportMode.FromClientDevices}
        >
          <Radio.Group onChange={onImportModeChange}>
            <Space direction={'horizontal'}>
              <Radio value={DevicesImportMode.FromClientDevices}>
                {$t({ defaultMessage: '6.2.1.103.1580 (Release - Recommended) - 12/16/2022 02:22 PM' })}
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <UI.TitleActive>When do you want the update to run?</UI.TitleActive>
        <UI.TitleActive>Selected time will apply to each venue according to own time-zone</UI.TitleActive>
      </Form>
      <UI.DateContainer>
        <label>Update time:</label>
        <div>
          <RangePicker
            key='range-picker'
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            enableDates={dateRangeForLast(3,'months')}
            onDateApply={setDateFilter as CallableFunction}
            selectionType={range}
          />
        </div>
      </UI.DateContainer>
    </UI.ScheduleModal>
  )
}
