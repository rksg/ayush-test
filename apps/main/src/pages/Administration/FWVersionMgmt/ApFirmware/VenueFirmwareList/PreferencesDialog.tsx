import { useEffect, useState } from 'react'

import { Col, Form, FormInstance, Input, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { useForm }                                                             from 'antd/lib/form/Form'
import { useIntl }                                                             from 'react-intl'

import { noDataSymbol }                                               from '@acx-ui/analytics/utils'
import { Button, Modal }                                              from '@acx-ui/components'
import { DeleteOutlinedIcon }                                         from '@acx-ui/icons'
import { useLazyGetMacRegListQuery, useLazyGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
import { MacAddressFilterRegExp, MacRegistrationPool }                from '@acx-ui/rc/utils'

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

export function PreferencesDialog (props: DevicesImportDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  const [importMode, setImportMode] = useState(DevicesImportMode.FromClientDevices)
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [macRegistrationPool, setMacRegistrationPool] = useState<MacRegistrationPool>()
  const { visible, onSubmit, onCancel, personaGroupId } = props
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
      title={$t({ defaultMessage: 'Add Devices' })}
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
    </Modal>
  )
}
