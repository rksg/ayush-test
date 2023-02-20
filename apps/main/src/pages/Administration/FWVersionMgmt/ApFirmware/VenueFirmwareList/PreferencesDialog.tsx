import { useEffect, useState } from 'react'

import { Col, Form, FormInstance, Input, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { useForm }                                                             from 'antd/lib/form/Form'
import { useIntl }                                                             from 'react-intl'

import { noDataSymbol }                                               from '@acx-ui/analytics/utils'
import { Button, Modal }                                              from '@acx-ui/components'
import { DeleteOutlinedIcon }                                         from '@acx-ui/icons'
import { useLazyGetMacRegListQuery, useLazyGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
import { MacAddressFilterRegExp, MacRegistrationPool }                from '@acx-ui/rc/utils'

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

export function PreferencesDialog (props: DevicesImportDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  const [importMode, setImportMode] = useState(DevicesImportMode.FromClientDevices)
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [macRegistrationPool, setMacRegistrationPool] = useState<MacRegistrationPool>()
  const { visible, onSubmit, onCancel, personaGroupId } = props
  const subTitle = 'Choose update schedule method:'

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
      title={$t({ defaultMessage: 'Preferences' })}
      subTitle={subTitle}
      visible={visible}
      width={560}
      okText={$t({ defaultMessage: 'Save Preferences' })}
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
            <Space direction={'vertical'}>
              <Radio value={DevicesImportMode.FromClientDevices}>
                {$t({ defaultMessage: 'Schedule Automatically' })}
                <div>Upgrade preference saved for each venue based on venue’s local time-zone</div>
                <UI.PreferencesSection>
                  <div>Preferred update slot(s):</div>
                  <div>Sunday, Saturday</div>
                  <div>00:00-02:00, 02:00-04:00, 04:00-06:00</div>
                </UI.PreferencesSection>
              </Radio>
              <Radio value={DevicesImportMode.Manually}>
                {$t({ defaultMessage: 'Schedule Manually' })}
                <div>Manually update firmware per venue</div>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}
