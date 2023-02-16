import { useEffect, useState } from 'react'

import { Col, Form, FormInstance, Input, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { useForm }                                                             from 'antd/lib/form/Form'
import moment                                                                  from 'moment-timezone'
import { useIntl }                                                             from 'react-intl'

import { noDataSymbol }                                               from '@acx-ui/analytics/utils'
import { Button, Modal, RangePicker }                                 from '@acx-ui/components'
import { DeleteOutlinedIcon }                                         from '@acx-ui/icons'
import { useLazyGetMacRegListQuery, useLazyGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
import { MacAddressFilterRegExp, MacRegistrationPool }                from '@acx-ui/rc/utils'
import { useDateFilter, dateRangeForLast, useDashboardFilter }        from '@acx-ui/utils'

// import { PersonaDeviceItem } from './PersonaDevicesForm'

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

export function ChangeScheduleDialog (props: DevicesImportDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  const [importMode, setImportMode] = useState(DevicesImportMode.FromClientDevices)
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [macRegistrationPool, setMacRegistrationPool] = useState<MacRegistrationPool>()
  const { visible, onSubmit, onCancel, personaGroupId } = props
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const subTitle = `The devices will be added to MAC Registration List
  (${macRegistrationPool?.name ?? noDataSymbol}) which is associated with this persona`

  useEffect(() => {
    if (!personaGroupId) return

    getPersonaGroupById({ params: { groupId: personaGroupId } })
      .then(result => {
        if (!result.data || !result.data?.macRegistrationPoolId) return

        getMacRegistrationById({
          params: { policyId: result.data.macRegistrationPoolId }
        }).then(result => {
          if (!result.data) return
          setMacRegistrationPool(result.data)
        })
      })
  }, [personaGroupId])

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
    <Modal
      title={$t({ defaultMessage: 'Change Update Schedule' })}
      subTitle={subTitle}
      visible={visible}
      okText={$t({ defaultMessage: 'Add' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      width={importMode === DevicesImportMode.Manually ? 660 : 800}
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
                {$t({ defaultMessage: 'Select from connected devices' })}
              </Radio>
              <Radio value={DevicesImportMode.Manually}>
                {$t({ defaultMessage: 'Add manually' })}
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
      <RangePicker
        key='range-picker'
        selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
        enableDates={dateRangeForLast(3,'months')}
        onDateApply={setDateFilter as CallableFunction}
        showTimePicker
        selectionType={range}
      />
    </Modal>
  )
}
