import { useEffect, useState } from 'react'

import { Checkbox, Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import { useWatch }                                                  from 'antd/lib/form/Form'
import _                                                             from 'lodash'
import { useIntl }                                                   from 'react-intl'

import { Button, Drawer, Loader, showToast, StepsForm }                                      from '@acx-ui/components'
import {
  useAddPropertyUnitMutation,
  useApListQuery,
  useGetPropertyUnitByIdQuery,
  useGetVenueLanPortsQuery,
  useLazyGetPersonaByIdQuery,
  useGetPropertyConfigsQuery,
  useUpdatePropertyUnitMutation, useUpdatePersonaMutation, useLazyGetPersonaGroupByIdQuery
} from '@acx-ui/rc/services'
import {
  APExtended,
  PropertyDpskType,
  PropertyUnit,
  PropertyUnitFormFields, PropertyUnitStatus,
  UnitPersonaConfig,
  VenueLanPorts
} from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'
import { validationMessages } from '@acx-ui/utils'

interface PropertyUnitDrawerProps {
  isEdit: boolean,
  visible: boolean,
  onClose: () => void,
  venueId: string,
  unitId?: string
}

export function PropertyUnitDrawer (props: PropertyUnitDrawerProps) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm<PropertyUnitFormFields>()
  const { isEdit, visible, onClose, venueId, unitId } = props
  const [data, setData] = useState<PropertyUnitFormFields|{}>({})
  const [withNsg, setWithNsg] = useState(false)
  const [personaGroupId, setPersonaGroupId] = useState<string>()

  const venueLanPorts = useGetVenueLanPortsQuery({ params: { tenantId, venueId } })
  const [selectedModel, setSelectedModel] = useState({} as VenueLanPorts)
  const accessAp = Form.useWatch<string>('accessAp', form)

  // VLAN fields state
  const enableGuestVlan = useWatch('enableGuestVlan', form)
  const [changeVlanField, setChangeVlanField] = useState(false)
  const [changeGuestVlanField, setChangeGuestVlanField] = useState(false)
  const [vlanCache, setVlanCache] = useState<number>()
  const [guestVlanCache, setGuestVlanCache] = useState<number>()
  // TODO: Fetch default VLAN value from Property?
  const [defaultVlan] = useState(1234 )

  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const unitQuery = useGetPropertyUnitByIdQuery({ params: { venueId, unitId }, skip: !unitId })
  const [getPersonaById, personaResult] = useLazyGetPersonaByIdQuery()

  // Mutation - Create & Update
  const [addUnitMutation] = useAddPropertyUnitMutation()
  const [updateUnitMutation] = useUpdatePropertyUnitMutation()
  const [updatePersonaMutation] = useUpdatePersonaMutation()

  const getVlanDisplayText = (formVlanValue: number) =>
    (formVlanValue === defaultVlan)
      ? `${formVlanValue} (${$t({ defaultMessage: 'Same as Property' })})`
      : `${formVlanValue} (${$t({ defaultMessage: 'Custom' })})`

  useEffect(() => {
    // make sure that reset the form fields while close the Drawer
    if (!visible) {
      setData({})
      form.resetFields()

      setChangeVlanField(false)
      setChangeGuestVlanField(false)
    }
  }, [visible])

  useEffect(() => {
    if (!propertyConfigsQuery.isLoading && propertyConfigsQuery.data) {
      const groupId = propertyConfigsQuery.data.personaGroupId
      setPersonaGroupId(groupId)

      getPersonaGroupById({ params: { groupId } })
        .then(result => setWithNsg(!!result.data?.nsgId))
    }
  }, [propertyConfigsQuery.data])

  useEffect(() => {
    if (data) {
      console.log('[Current data] :: ', data)
      form.resetFields()
      form.setFieldsValue(data)
    }
  }, [data])

  useEffect(() => {
    if (!unitQuery.isLoading && unitQuery.data) {
      console.log('Step 2 >> Get Unit while edit :: ', unitId, unitQuery.data)

      // FIXME: fetch PersonaId/GuestId from Unit data
      const { personaId, guestPersonaId } = unitQuery.data
      // const personaId = 'c86720d7-60f6-40c0-92fc-cba660c3d65d'
      // const guestPersonaId = '93bbca6a-60af-437c-863d-6f783d077928'

      form.setFieldValue('enableGuestVlan', !guestPersonaId)
      setChangeVlanField(false)
      setChangeGuestVlanField(false)

      setData(unitQuery.data)
      fetchPersonaInfo(personaId, guestPersonaId)
    }
  }, [unitQuery.data])

  const fetchPersonaInfo = (personaId?: string, guestPersonaId?: string) => {
    console.log('Step 3 >> Get persona/guestPersona information.')
    // FIXME: close drawer and show error message
    if (!personaGroupId) { }

    if (personaId) {
      getPersonaById({ params: { groupId: personaGroupId, id: personaId } })
        .then(result => {
          if (result.data) {
            console.log('Step 3-1 >> Persona :: ', result.data)
            setVlanCache(result.data.vlan)
            const unitPersona: UnitPersonaConfig = {
              vlan: result.data.vlan,
              dpskPassphrase: result.data.dpskPassphrase
            }

            setData(prev => ({ ...prev, unitPersona }))
          }
        })
    }

    if (guestPersonaId) {
      getPersonaById({ params: { groupId: personaGroupId, id: guestPersonaId } })
        .then(result => {
          if (result.data) {
            console.log('Step 3-2 >> GuestPersona :: ', result.data)
            setGuestVlanCache(result.data.vlan)
            const guestPersona: UnitPersonaConfig = {
              vlan: result.data.vlan,
              dpskPassphrase: result.data.dpskPassphrase
            }

            setData(prev => ({ ...prev, guestPersona }))
          }
        })
    }
  }

  const toDataFormat = (data: PropertyUnitFormFields): PropertyUnit => {
    const { unitPersona, guestPersona, resident, ...others } = data
    const pureResident = _.pickBy(resident, v => v && v.length > 0)
    return {
      ...others,
      resident: _.isEmpty(pureResident) ? undefined : pureResident,
      status: PropertyUnitStatus.ENABLED,
      dpsks: [
        { type: PropertyDpskType.UNIT, passphrase: unitPersona?.dpskPassphrase, ...unitPersona },
        { type: PropertyDpskType.GUEST, passphrase: guestPersona?.dpskPassphrase, ...guestPersona }
      ]

    }
  }

  const patchPersona = async (id?: string, payload?: UnitPersonaConfig) => {
    console.log('handle persona updating ', id, payload)
    if (id) {
      await updatePersonaMutation({ params: { groupId: personaGroupId, id }, payload }).unwrap()
    }
  }

  const handleEditUnit = async (formValues: PropertyUnitFormFields) => {
    // TODO: handle exception and loading state
    console.log('Handle edit unit action with data :: ', formValues)
    const { personaId, guestPersonaId, unitPersona, guestPersona, ...unitPayload } = formValues

    await updateUnitMutation({ params: { venueId, unitId }, payload: unitPayload })
    // .unwrap()

    // FIXME: fetch Persona/GuestId from Unit data
    await patchPersona(personaId, unitPersona)
    await patchPersona(guestPersonaId, guestPersona)
  }

  const handleAddUnit = async (formValues: PropertyUnit) => {
    console.log('Handle add unit action with data :: ', formValues)
    // TODO: if withNsg is true, I need to format the Access ap data.
    return await addUnitMutation({ params: { venueId }, payload: formValues }).unwrap()
  }

  const handleOnFinish = async (values: PropertyUnitFormFields) => {
    const data = toDataFormat(values)

    try {
      isEdit ? await handleEditUnit(values) : await handleAddUnit(data)
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
          name={['unitPersona', 'vlan']}
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
            : <>{getVlanDisplayText(form.getFieldValue(['unitPersona', 'vlan']))}</>
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
              onClick={() => form.setFieldValue(['unitPersona', 'vlan'], defaultVlan)}
            >
              {$t({ defaultMessage: 'Reset to Default' })}
            </Button>
            <Button
              type='link'
              data-testid={'vlanCancel'}
              size={'small'}
              onClick={() => {
                form.setFieldValue(['unitPersona', 'vlan'], vlanCache)
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
              setVlanCache(form.getFieldValue(['unitPersona', 'vlan']))
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
      name={['guestPersona', 'vlan']}
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
        : <>{getVlanDisplayText(form.getFieldValue(['guestPersona', 'vlan']))}</>
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
          onClick={() => form.setFieldValue(['guestPersona', 'vlan'], defaultVlan)}
        >
          {$t({ defaultMessage: 'Reset to Default' })}
        </Button>
        <Button
          type='link'
          size={'small'}
          onClick={() => {
            form.setFieldValue(['guestPersona', 'vlan'], guestVlanCache)
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
          setGuestVlanCache(form.getFieldValue(['guestPersona', 'vlan']))
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
    initialValues={data}
    layout={'vertical'}
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
      name={['unitPersona', 'dpskPassphrase']}
      label={$t({ defaultMessage: 'DPSK Passphrase' })}
      children={<Input />}
    />
    <Form.Item
      name={['guestPersona', 'dpskPassphrase']}
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

  const onSave = async () => {
    try {
      await form.validateFields()
      await handleOnFinish(form.getFieldsValue())
    } catch (e) {
      return Promise.resolve()
    }
  }

  return (
    <Drawer
      forceRender
      title={isEdit
        ? $t({ defaultMessage: 'Edit Unit' })
        : $t({ defaultMessage: 'Add Unit' })
      }
      visible={visible}
      onClose={onClose}
      children={
        <Loader states={[{ isLoading: unitQuery.isLoading }, propertyConfigsQuery, personaResult]}>
          {unitForm}
        </Loader>
      }
      footer={<Drawer.FormFooter
        buttonLabel={{
          save: isEdit
            ? $t({ defaultMessage: 'Save' })
            : $t({ defaultMessage: 'Add' })
        }}
        onSave={onSave}
        onCancel={onClose}
      />}
      width={'400px'}
    />
  )
}
