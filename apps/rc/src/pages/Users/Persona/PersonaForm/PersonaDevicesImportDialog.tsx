import { useEffect, useState } from 'react'

import { Col, Form, FormInstance, Input, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { useForm }                                                             from 'antd/lib/form/Form'
import { useIntl }                                                             from 'react-intl'

import { Button, Modal }                                                from '@acx-ui/components'
import { DeleteOutlinedIcon }                                           from '@acx-ui/icons'
import { SelectConnectedClientsTable }                                  from '@acx-ui/rc/components'
import { useLazyGetMacRegListQuery, useLazyGetPersonaGroupByIdQuery }   from '@acx-ui/rc/services'
import { ClientList, MacRegistrationFilterRegExp, MacRegistrationPool } from '@acx-ui/rc/utils'
import { noDataDisplay }                                                from '@acx-ui/utils'

import { PersonaDeviceItem } from './PersonaDevicesForm'

enum DevicesImportMode {
  FromClientDevices,
  Manually
}

interface DevicesImportDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: Pick<PersonaDeviceItem, 'macAddress' | 'hostname'>[]) => void,
  personaGroupId?: string,
  selectedMacAddress: string[]
}

export function PersonaDevicesImportDialog (props: DevicesImportDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  const [importMode, setImportMode] = useState(DevicesImportMode.FromClientDevices)
  const [selectedClients, setSelectedClients] = useState<ClientList[]>([])
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [macRegistrationPool, setMacRegistrationPool] = useState<MacRegistrationPool>()
  const { visible, onSubmit, onCancel, personaGroupId, selectedMacAddress } = props
  const subTitle = `The devices will be added to MAC Registration List
  (${macRegistrationPool?.name ?? noDataDisplay}) which is associated with this persona`

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
    switch (importMode) {
      case DevicesImportMode.Manually:
        form.validateFields()
          .then(values => {
            // console.log('Current dialog fields value = ', values)
            onSubmit(values.devices ?? [])
          }).catch(error => {
            console.log(error) // eslint-disable-line no-console
          })
        break
      case DevicesImportMode.FromClientDevices:
        const selectedDevices = selectedClients
          .map(({ clientMac, hostname }) => ({ macAddress: clientMac, hostname }))
        onSubmit(selectedDevices)
        break
    }
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

      {importMode === DevicesImportMode.FromClientDevices
        ? <SelectConnectedClientsTable
          onRowChange={(_, selectedRows) => {setSelectedClients(selectedRows)}}
          getCheckboxProps={(row) => ({
            disabled: selectedMacAddress.includes(row.clientMac.toUpperCase())
          })}
        />
        : <ImportManuallyForm form={form}/>
      }
    </Modal>
  )
}

const ImportManuallyForm = (props: { form: FormInstance }) => {
  const { $t } = useIntl()
  const { form } = props

  return (
    <Form
      form={form}
      layout={'vertical'}
      labelCol={{ span: 4, offset: 1 }}
    >
      <Form.List name='devices' initialValue={[{ macAddress: '' }]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Form.Item
                {...restField}
                key={key}
                name={[name, 'macAddress']}
                label={$t({ defaultMessage: 'MAC Address' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => MacRegistrationFilterRegExp(value) }
                ]}
              >
                <Row align={'middle'} gutter={10}>
                  <Col span={1}>{name + 1}.</Col>
                  <Col span={10}>
                    <Input key={key} size={'small'}/>
                  </Col>
                  <Col span={2}>
                    <Button
                      ghost
                      aria-label={`delete-${key}`}
                      key='delete'
                      icon={<DeleteOutlinedIcon />}
                      onClick={() => remove(name)}
                    />
                  </Col>
                </Row>
              </Form.Item>
            ))}
            <Form.Item wrapperCol={{ offset: 1 }}>
              <Button type={'link'} onClick={() => add()}>
                {$t({ defaultMessage: 'Add another device' })}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  )
}
