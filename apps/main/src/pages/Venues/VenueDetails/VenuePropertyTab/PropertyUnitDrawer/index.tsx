import { useEffect, useState } from 'react'

import { Checkbox, Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import { useWatch }                                                  from 'antd/lib/form/Form'
import _                                                             from 'lodash'
import { useIntl }                                                   from 'react-intl'

import { Button, Drawer, Loader, showToast, StepsForm } from '@acx-ui/components'
import {
  useAddPropertyUnitMutation,
  useApListQuery,
  useLazyGetPropertyUnitByIdQuery,
  useGetVenueLanPortsQuery,
  useLazyGetPersonaByIdQuery,
  useGetPropertyConfigsQuery,
  useUpdatePropertyUnitMutation,
  useUpdatePersonaMutation,
  useLazyGetPersonaGroupByIdQuery
} from '@acx-ui/rc/services'
import {
  APExtended,
  emailRegExp,
  PropertyDpskType,
  PropertyUnit,
  PropertyUnitFormFields,
  PropertyUnitStatus,
  UnitPersonaConfig,
  VenueLanPorts
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


function AccessPointLanPortSelector (props: { venueId: string, macAddress?: string }) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { venueId, macAddress } = props
  const [selectedModel, setSelectedModel] = useState({} as VenueLanPorts)
  const selectedApMac = Form.useWatch('accessAp')

  const venueLanPorts = useGetVenueLanPortsQuery({ params: { tenantId, venueId } })

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
        apOptions: data?.data
          .filter((ap: APExtended) => ap.apMac && ap.model)
          .map((ap: APExtended) => ({
            value: ap.apMac,
            label: ap.name,
            model: ap.model
          }))
      }
    }
  })

  useEffect(() => {
    if (!selectedApMac || !apOptions || !venueLanPorts) return
    onSelectApChange(selectedApMac)
  }, [selectedApMac, apOptions, venueLanPorts])

  const onSelectApChange = (macAddress: string) => {
    const selectedAp = apOptions?.find(ap => ap.value === macAddress)
    const lanPort = venueLanPorts?.data
      ?.find(lan => lan.model === selectedAp?.model) ?? {} as VenueLanPorts
    setSelectedModel(lanPort)
  }

  return (
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Select AP' })}
        name={'accessAp'}
        initialValue={macAddress}
        children={
          <Select
            placeholder={$t({ defaultMessage: 'Select...' })}
            options={apOptions}
          />}
      />
      <Form.Item
        name={'ports'}
        label={$t(
          { defaultMessage: 'Select LAN Ports for ({model})' },
          { model: selectedModel?.model ?? 'null' }
        )}
      >
        {selectedModel.lanPorts &&
          <Checkbox.Group >
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
    </>
  )
}

export interface PropertyUnitDrawerProps {
  isEdit: boolean,
  visible: boolean,
  onClose: () => void,
  venueId: string
  unitId?: string,
}

export function PropertyUnitDrawer (props: PropertyUnitDrawerProps) {
  const { $t } = useIntl()
  const { isEdit, visible, onClose, venueId, unitId } = props
  const [form] = Form.useForm<PropertyUnitFormFields>()
  const [personaGroupId, setPersonaGroupId] = useState<string>()
  const [withNsg, setWithNsg] = useState(false)

  // VLAN fields state
  const enableGuestVlan = useWatch('enableGuestVlan', form)
  const [changeVlanField, setChangeVlanField] = useState(false)
  const [changeGuestVlanField, setChangeGuestVlanField] = useState(false)
  const [vlanCache, setVlanCache] = useState<number>()
  const [guestVlanCache, setGuestVlanCache] = useState<number>()
  // TODO: Fetch default VLAN value from Property? Venue service not Persona
  const [defaultVlan] = useState(1)

  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })

  const [getUnitById, unitResult] = useLazyGetPropertyUnitByIdQuery()
  const [getPersonaById, personaResult] = useLazyGetPersonaByIdQuery()
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()

  // Mutation - Create & Update
  const [addUnitMutation] = useAddPropertyUnitMutation()
  const [updateUnitMutation] = useUpdatePropertyUnitMutation()
  const [updatePersonaMutation] = useUpdatePersonaMutation()

  useEffect(() => {
    if (!propertyConfigsQuery.isLoading && propertyConfigsQuery.data) {
      const groupId = propertyConfigsQuery.data.personaGroupId
      setPersonaGroupId(groupId)

      getPersonaGroupById({ params: { groupId } })
        .then(result => setWithNsg(!!result.data?.nsgId))
    }
  }, [propertyConfigsQuery.data])

  useEffect(() => {
    if (visible && unitId && venueId) {
      form.resetFields()
      getUnitById({ params: { venueId, unitId } })
        .then(result => {
          if (result.data) {
            const { personaId, guestPersonaId } = result.data
            // TODO: access point need to parsing here
            console.log('Unit :: ', result.data)
            form.setFieldsValue(result.data)
            fetchPersonaInfo(personaId, guestPersonaId)
          }
        })
        .catch(() => {
          errorCloseDrawer()
        })
    }
  }, [visible, unitId])

  const fetchPersonaInfo = (personaId?: string, guestPersonaId?: string) => {
    if (personaId) {
      getPersonaById({ params: { groupId: personaGroupId, id: personaId } })
        .then(result => {
          if (result.data) {
            const { vlan, dpskPassphrase, vni } = result.data
            console.log('Persona :: ', result.data)
            form.setFieldValue(['unitPersona', 'vlan'], vlan)
            form.setFieldValue(['unitPersona', 'dpskPassphrase'], dpskPassphrase)
            form.setFieldValue('vxlan', vni)
          }
        })
    }

    if (guestPersonaId) {
      getPersonaById({ params: { groupId: personaGroupId, id: guestPersonaId } })
        .then(result => {
          if (result.data) {
            const { vlan, dpskPassphrase } = result.data
            console.log('Guest Persona :: ', result.data)
            form.setFieldValue('enableGuestVlan', !!vlan)
            // if no timeout would not render exactly
            setTimeout(() => {
              form.setFieldValue(['guestPersona', 'vlan'], vlan)
            }, 10)
            form.setFieldValue(['guestPersona', 'dpskPassphrase'], dpskPassphrase)
          }
        })
    }
  }

  const errorCloseDrawer = () => {
    console.log('Something wrong so close the Drawer ...')
    onClose()
  }

  const handleEditUnit = async (formValues: PropertyUnitFormFields) => {
    // TODO: handle exception for more detail information
    const { name, resident, personaId, guestPersonaId, unitPersona, guestPersona } = formValues
    console.log('Edit action :: ', formValues)

    // update Unit
    const unitUpdateResult = await updateUnitMutation({
      params: { venueId, unitId },
      payload: { name, resident }
    }).unwrap()

    // update Persona
    const personaUpdateResult = await patchPersona(personaId, unitPersona)
    const guestUpdateResult = await patchPersona(guestPersonaId, guestPersona)

    return Promise.all([unitUpdateResult, personaUpdateResult, guestUpdateResult])
  }

  const patchPersona = async (id?: string, payload?: UnitPersonaConfig) => {
    return (id && payload)
      ? await updatePersonaMutation({ params: { groupId: personaGroupId, id }, payload }).unwrap()
      : Promise.resolve()
  }

  const toCreateUnitPayload = (formValues: PropertyUnitFormFields): PropertyUnit => {
    const { unitPersona, guestPersona, resident, accessAp, ports, ...others } = formValues
    const pureResident = _.pickBy(resident, v => v && v.length > 0)

    const selectedPorts = accessAp
      ? ports?.map(index => ({
        macAddress: accessAp,
        portIndex: index
      }))
      : undefined

    return {
      ...others,
      resident: _.isEmpty(pureResident) ? undefined : pureResident,
      status: PropertyUnitStatus.ENABLED,
      dpsks: [
        {
          type: PropertyDpskType.UNIT,
          passphrase: unitPersona?.dpskPassphrase,
          vlan: unitPersona?.vlan
        },
        {
          type: PropertyDpskType.GUEST,
          passphrase: guestPersona?.dpskPassphrase,
          vlan: guestPersona?.vlan
        }
      ],
      ...selectedPorts
        ? { accessPoint: { selectedPorts } }
        : {}
    }
  }

  const handleAddUnit = async (formValues: PropertyUnitFormFields) => {
    return await addUnitMutation({
      params: { venueId },
      payload: toCreateUnitPayload(formValues)
    }).unwrap()
  }

  const handleOnFinish = async (values: PropertyUnitFormFields) => {
    console.log('Form finish values = ', values)

    try {
      isEdit ? await handleEditUnit(values) : await handleAddUnit(values)
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

  const onSave = async () => {
    try {
      await form.validateFields()
      await handleOnFinish(form.getFieldsValue())
    } catch (e) {
      return Promise.resolve()
    }
  }

  const vlanDescription = (path: string) => {
    const current = form.getFieldValue([path, 'vlan'])
    return current === defaultVlan
      ? '(Same as Property)'
      : '(Custom)'
  }

  const withoutNsgForm = <>
    <Form.Item label={$t({ defaultMessage: 'VLAN' })}>
      <Space>
        <Form.Item
          noStyle
          name={['unitPersona', 'vlan']}
          initialValue={defaultVlan}
        >
          <InputNumber
            min={1}
            max={4094}
            bordered={changeVlanField}
            readOnly={!changeVlanField}
          />
        </Form.Item>
        {
          changeVlanField
            ?
            <>
              <Button
                size={'small'}
                type='link'
                onClick={() => setChangeVlanField(false)}
              >
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
            :
            <>
              {vlanDescription('unitPersona')}
              <Button
                type='link'
                size={'small'}
                onClick={() => {
                  setVlanCache(form.getFieldValue(['unitPersona', 'vlan']))
                  setChangeVlanField(true)
                }}
              >
                {$t({ defaultMessage: 'Change' })}
              </Button>
            </>
        }
      </Space>
    </Form.Item>

    <StepsForm.FieldLabel width={'160px'}>
      {$t({ defaultMessage: 'Separate VLAN for guests' })}
      <Form.Item
        style={{ marginBottom: '10px' }}
        name={'enableGuestVlan'}
        valuePropName={'checked'}
        children={<Switch />}
      />
    </StepsForm.FieldLabel>

    <Space>
      {
        enableGuestVlan &&
        <>
          <Form.Item
            noStyle
            name={['guestPersona', 'vlan']}
            initialValue={defaultVlan}
          >
            <InputNumber
              min={1}
              max={4094}
              bordered={changeGuestVlanField}
              readOnly={!changeGuestVlanField}
            />
          </Form.Item>
          {
            changeGuestVlanField
              ?
              <>
                <Button
                  size={'small'}
                  type='link'
                  onClick={() => setChangeGuestVlanField(false)}
                >
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
                  data-testid={'vlanCancel'}
                  size={'small'}
                  onClick={() => {
                    form.setFieldValue(['guestPersona', 'vlan'], guestVlanCache)
                    setChangeGuestVlanField(false)
                  }}
                >
                  {$t({ defaultMessage: 'Cancel' })}
                </Button>
              </>
              :
              <>
                {vlanDescription('guestPersona')}
                <Button
                  type='link'
                  size={'small'}
                  onClick={() => {
                    setGuestVlanCache(form.getFieldValue(['guestPersona', 'vlan']))
                    setChangeGuestVlanField(true)
                  }}
                >
                  {$t({ defaultMessage: 'Change' })}
                </Button>
              </>
          }
        </>
      }
    </Space>
  </>

  const withNsgForm = (<>
    {isEdit &&
      <Form.Item
        name={['vxlan']}
        label={$t({ defaultMessage: 'VxLAN' })}
        children={<Input readOnly bordered={false}/>}
      />
    }
    <AccessPointLanPortSelector venueId={venueId} />
  </>)

  return (
    <Drawer
      destroyOnClose
      width={'400px'}
      visible={visible}
      title={isEdit
        ? $t({ defaultMessage: 'Edit Unit' })
        : $t({ defaultMessage: 'Add Unit' })
      }
      children={
        <Loader
          states={[
            { isLoading: unitResult.isLoading },
            propertyConfigsQuery,
            personaResult
          ]}
        >
          <Form
            preserve={false}
            name='propertyUnitForm'
            form={form}
            layout={'vertical'}
          >
            <Form.Item name='id' noStyle><Input type='hidden' /></Form.Item>
            <Form.Item name='personaId' noStyle><Input type='hidden' /></Form.Item>
            <Form.Item name='guestPersonaId' noStyle><Input type='hidden' /></Form.Item>

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
              rules={[{ validator: (_, value) => emailRegExp(value) }]}
              children={<Input />}
            />
            <Form.Item
              name={['resident', 'phoneNumber']}
              label={$t({ defaultMessage: 'Resident\'s Phone Number' })}
              children={<Input />}
            />
          </Form>
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
      onClose={onClose}
    />
  )
}
