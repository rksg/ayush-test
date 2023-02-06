import { useEffect, useState } from 'react'

import { Checkbox, Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import { useWatch }                                                  from 'antd/lib/form/Form'
import _                                                             from 'lodash'
import { useIntl }                                                   from 'react-intl'

import { Button, Drawer, showToast, StepsForm }                                              from '@acx-ui/components'
import { useAddPropertyUnitMutation, useApListQuery, useGetVenueLanPortsQuery }              from '@acx-ui/rc/services'
import { APExtended, PropertyDpskType, PropertyUnit, PropertyUnitFormFields, VenueLanPorts } from '@acx-ui/rc/utils'
import { useParams }                                                                         from '@acx-ui/react-router-dom'
import { validationMessages }                                                                from '@acx-ui/utils'

interface PropertyUnitDrawerProps {
  isEdit: boolean,
  visible: boolean,
  onClose: () => void,
  withNsg: boolean,
  data?: PropertyUnit
}

export function PropertyUnitDrawer (props: PropertyUnitDrawerProps) {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const [form] = Form.useForm()
  const { isEdit, visible, onClose, withNsg, data } = props
  const enableGuestVlan = useWatch('enableGuestVlan', form)

  const venueLanPorts = useGetVenueLanPortsQuery({ params: { tenantId, venueId } })
  const [selectedModel, setSelectedModel] = useState({} as VenueLanPorts)
  const accessAp = Form.useWatch<string>('accessAp', form)

  const [changeVlanField, setChangeVlanField] = useState(false)
  const [changeGuestVlanField, setChangeGuestVlanField] = useState(false)

  // TODO: Fetch default VLAN value from Property?
  const [defaultVlan] = useState(1234 )

  const [vlanCache, setVlanCache] = useState<number>()
  const [guestVlanCache, setGuestVlanCache] = useState<number>()

  const [addUnitMutation] = useAddPropertyUnitMutation()

  const getVlanDisplayText = (formVlanValue: number) =>
    (formVlanValue === defaultVlan)
      ? `${formVlanValue} (${$t({ defaultMessage: 'Same as Property' })})`
      : `${formVlanValue} (${$t({ defaultMessage: 'Custom' })})`

  useEffect(() => {
    // make sure that reset the form fields while close the Drawer
    if (!visible) {
      form.resetFields()
      setChangeVlanField(false)
      setChangeGuestVlanField(false)
    }
  }, [visible])

  useEffect(() => {
    if (data) {
      setChangeVlanField(false)
      setChangeGuestVlanField(false)
      const values = toFormFields(data)
      console.log('Convert props data :: ', data)
      console.log('To form values ::', values)
      form.setFieldsValue(values)
      setVlanCache(values.dpskConfig.vlan)
      setGuestVlanCache(values.guestDpskConfig.vlan)
      form.setFieldValue('enableGuestVlan', !!values.guestDpskConfig.vlan)
    }
  }, [data])

  const toFormFields = (data: PropertyUnit): PropertyUnitFormFields => {
    const unitConfig = _.omit(data.dpsks.find(d => d.type === PropertyDpskType.UNIT), 'type')
    const guestConfig = _.omit(data.dpsks.find(d => d.type === PropertyDpskType.GUEST), 'type')

    return {
      ...data,
      dpskConfig: { ...unitConfig },
      guestDpskConfig: { ...guestConfig }
    }
  }

  const toDataFormat = (data: PropertyUnitFormFields): PropertyUnit => {
    const { dpskConfig, guestDpskConfig, resident, ...others } = data
    const pureResident = _.pickBy(resident, v => v && v.length > 0)
    return {
      ...others,
      resident: _.isEmpty(pureResident) ? undefined : pureResident,
      dpsks: [
        { type: PropertyDpskType.UNIT, ...data.dpskConfig },
        { type: PropertyDpskType.GUEST, ...data.guestDpskConfig }
      ]
    }
  }

  const handleEditUnit = async (data: PropertyUnit) => {
    console.log('Handle edit unit action with data :: ', data)
    // TODO: two steps to update Unit
  }

  const handleAddUnit = async (data: PropertyUnit) => {
    console.log('Handle add unit action with data :: ', data)
    // TODO: if withNsg is true, I need to format the Access ap data.
    return await addUnitMutation({ params: { venueId }, payload: data }).unwrap()
  }

  const handleOnFinish = async (values: PropertyUnitFormFields) => {
    const data = toDataFormat(values)
    console.log('Convert values :: ', values)
    console.log('To data :: ', data)
    try {
      isEdit ? await handleEditUnit(data) : await handleAddUnit(data)
      onClose()
    } catch (e) {
      showToast({
        duration: 3,
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' }),
        // FIXME: Correct the error message
        link: { onClick: () => alert(JSON.stringify(e)) }
      })
    }
  }

  const onSelectApChange = (serialNumber: string) => {
    const selectedAp = apOptions?.find(ap => ap.value === serialNumber)
    const lanPort = venueLanPorts?.data
      ?.find(lan => lan.model === selectedAp?.model) ?? {} as VenueLanPorts
    setSelectedModel(lanPort)
  }

  const apListQueryDefaultPayload = {
    fields: ['name', 'serialNumber', 'model', 'apMac'],
    pageSize: 10000,
    page: 1,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const { apOptions } = useApListQuery({
    params: useParams(),
    payload: {
      ...apListQueryDefaultPayload,
      filters: { venueId: venueId ? [venueId] : [] }
    }
  }, {
    selectFromResult ({ data }) {
      return {
        apOptions: data?.data.map((ap: APExtended) => ({
          value: ap.serialNumber,
          label: ap.name,
          model: ap.model
        }))
      }
    }
  })

  const withNsgForm = <>
    <Form.Item
      name={['vxlan']}
      label={$t({ defaultMessage: 'VxLAN' })}
      children={<Input readOnly bordered={false}/>}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Select AP' })}
      name={'accessAp'}
      children={
        <Select
          allowClear={false}
          placeholder={$t({ defaultMessage: 'Select...' })}
          options={apOptions}
          onChange={onSelectApChange}
        />}
    />
    {accessAp &&
      <Form.Item
        label={$t(
          { defaultMessage: 'Select LAN Ports for ({model})' },
          { model: selectedModel?.model ?? 'null' }
        )}
      >
        {selectedModel.lanPorts &&
          <Checkbox.Group>
            <Space direction={'vertical'}>
              {
                selectedModel?.lanPorts.map((port, index) =>
                  <Checkbox
                    key={index}
                    value={port.portId ?? index}
                    disabled={port.type === 'TRUNK'}
                  >
                    {`LAN${port.portId}`}
                  </Checkbox>
                )
              }
            </Space>
          </Checkbox.Group>
        }
      </Form.Item>
    }
  </>

  const withoutNsgForm = <>
    <Form.Item label={$t({ defaultMessage: 'VLAN' })}>
      <Space>
        <Form.Item
          data-testid={''}
          noStyle
          name={['dpskConfig', 'vlan']}
          rules={[
            {
              type: 'number',
              min: 1,
              max: 4094,
              message: $t(validationMessages.vlanRange)
            }
            // TODO: Add validator to make sure user have saving their change.
            // { validator: () => changeVlanField }
          ]}>
          {changeVlanField
            ? <InputNumber min={1} max={4094} />
            : <>{getVlanDisplayText(form.getFieldValue(['dpskConfig', 'vlan']))}</>
          }
        </Form.Item>
        {changeVlanField
          ? <>
            <Button size={'small'} type='link' onClick={() => setChangeVlanField(false)}>
              {$t({ defaultMessage: 'Save' })}
            </Button>
            <Button
              type='link'
              size={'small'}
              onClick={() => form.setFieldValue(['dpskConfig', 'vlan'], defaultVlan)}
            >
              {$t({ defaultMessage: 'Reset to Default' })}
            </Button>
            <Button
              type='link'
              data-testid={'vlanCancel'}
              size={'small'}
              onClick={() => {
                form.setFieldValue(['dpskConfig', 'vlan'], vlanCache)
                setChangeVlanField(false)
              }}
            >
              {$t({ defaultMessage: 'Cancel' })}
            </Button>
          </>
          : <Button
            type='link'
            size={'small'}
            onClick={() => {
              setVlanCache(form.getFieldValue(['dpskConfig', 'vlan']))
              setChangeVlanField(true)
            }}
          >
            {$t({ defaultMessage: 'Change' })}
          </Button>
        }
      </Space>
    </Form.Item>
    <StepsForm.FieldLabel width={'160px'}>
      {$t({ defaultMessage: 'Separate VLAN for guests' })}
      <Form.Item
        name={'enableGuestVlan'}
        valuePropName={'checked'}
        children={<Switch />}
      />
    </StepsForm.FieldLabel>
    {enableGuestVlan &&
  <Space>
    <Form.Item
      noStyle
      name={['guestDpskConfig', 'vlan']}
      rules={[
        {
          type: 'number',
          min: 1,
          max: 4094,
          message: $t(validationMessages.vlanRange)
        }
        // TODO: Add validator to make sure user have saving their change.
        // { validator: () => changeGuestVlanField }
      ]}>
      {changeGuestVlanField
        ? <InputNumber min={1} max={4094} />
        : <>{getVlanDisplayText(form.getFieldValue(['guestDpskConfig', 'vlan']))}</>
      }
    </Form.Item>
    {changeGuestVlanField
      ? <>
        <Button size={'small'} type='link' onClick={() => setChangeGuestVlanField(false)}>
          {$t({ defaultMessage: 'Save' })}
        </Button>
        <Button
          type='link'
          size={'small'}
          onClick={() => form.setFieldValue(['guestDpskConfig', 'vlan'], defaultVlan)}
        >
          {$t({ defaultMessage: 'Reset to Default' })}
        </Button>
        <Button
          type='link'
          size={'small'}
          onClick={() => {
            form.setFieldValue(['guestDpskConfig', 'vlan'], guestVlanCache)
            setChangeGuestVlanField(false)
          }}
        >
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
      </>
      : <Button
        type='link'
        size={'small'}
        onClick={() => {
          setGuestVlanCache(form.getFieldValue(['guestDpskConfig', 'vlan']))
          setChangeGuestVlanField(true)
        }}
      >
        {$t({ defaultMessage: 'Change' })}
      </Button>
    }
  </Space>
    }
  </>

  const unitForm = <Form
    name='propertyUnitForm'
    form={form}
    initialValues={data
      ?? { dpskConfig: { vlan: defaultVlan }, guestDpskConfig: { vlan: defaultVlan } }}
    layout={'vertical'}
    onFinish={handleOnFinish}
  >
    <Form.Item
      name={'name'}
      label={$t({ defaultMessage: 'Unit Name' })}
      children={<Input />}
      rules={[
        { required: true }
      ]}
    />
    <Form.Item
      name={['dpskConfig', 'passphrase']}
      label={$t({ defaultMessage: 'DPSK Passphrase' })}
      children={<Input />}
    />
    <Form.Item
      name={['guestDpskConfig', 'passphrase']}
      label={$t({ defaultMessage: 'Guest DPSK Passphrase' })}
      children={<Input />}
    />

    {withNsg ? withNsgForm : withoutNsgForm}

    <Form.Item
      name={['resident', 'name']}
      label={$t({ defaultMessage: 'Resident Name' })}
      children={<Input />}
    />
    <Form.Item
      name={['resident', 'email']}
      label={$t({ defaultMessage: 'Resident\'s Email' })}
      children={<Input />}
    />
    <Form.Item
      name={['resident', 'phoneNumber']}
      label={$t({ defaultMessage: 'Resident\'s Phone Number' })}
      children={<Input />}
    />
  </Form>

  return (
    <Drawer
      forceRender
      title={isEdit
        ? $t({ defaultMessage: 'Edit Unit' })
        : $t({ defaultMessage: 'Add Unit' })
      }
      visible={visible}
      onClose={onClose}
      children={unitForm}
      footer={<Drawer.FormFooter
        buttonLabel={{
          save: isEdit
            ? $t({ defaultMessage: 'Save' })
            : $t({ defaultMessage: 'Add' })
        }}
        onSave={async () => form.submit()}
        onCancel={onClose}
      />}
      width={'400px'}
    />
  )
}
