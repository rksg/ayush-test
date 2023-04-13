import { useEffect, useState } from 'react'

import { Checkbox, Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import { useWatch }                                                  from 'antd/lib/form/Form'
import _                                                             from 'lodash'
import { useIntl }                                                   from 'react-intl'

import { Drawer, Loader, StepsForm } from '@acx-ui/components'
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
  Persona,
  PersonaEthernetPort,
  PropertyDpskType,
  PropertyUnit,
  PropertyUnitFormFields,
  PropertyUnitStatus,
  UnitPersonaConfig,
  VenueLanPorts
} from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'
import { noDataDisplay, validationMessages } from '@acx-ui/utils'


function AccessPointLanPortSelector (props: { venueId: string }) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { venueId } = props
  const form = Form.useFormInstance()
  const [selectedModel, setSelectedModel] = useState({} as VenueLanPorts)
  const accessAp = Form.useWatch('accessAp')

  const { data: venueLanPorts } = useGetVenueLanPortsQuery({ params: { tenantId, venueId } })

  const apListQueryDefaultPayload = {
    fields: ['name', 'serialNumber', 'model', 'apMac'],
    pageSize: 10000,
    page: 1,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const { data: apListResult } = useApListQuery({
    params: useParams(),
    payload: {
      ...apListQueryDefaultPayload,
      filters: { venueId: venueId ? [venueId] : [] }
    }
  })

  useEffect(() => {
    if (!venueLanPorts || !apListResult?.data || !accessAp) return
    onSelectApChange(accessAp)
  }, [apListResult, venueLanPorts, accessAp])

  const apOptions = apListResult?.data
    ?.filter((ap: APExtended) => ap.apMac && ap.model)
    ?.map((ap: APExtended) => ({
      value: ap.apMac,
      label: ap.name,
      model: ap.model
    }))

  const onSelectApChange = (macAddress: string) => {
    const selectedAp = apOptions?.find(ap => ap.value === macAddress)
    const lanPort = venueLanPorts
      ?.find(lan => lan.model === selectedAp?.model) ?? {} as VenueLanPorts
    setSelectedModel(lanPort)
    form.setFieldValue('apName', selectedAp?.label)
  }

  return (
    <>
      <Form.Item
        hidden
        name={'apName'}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Select AP' })}
        name={'accessAp'}
        children={
          <Select
            allowClear
            placeholder={$t({ defaultMessage: 'Select...' })}
            onChange={(selected) => {
              form.setFieldValue('ports', [])
              onSelectApChange(selected)
            }}
            options={apOptions}
          />}
      />
      <Form.Item
        name={'ports'}
        label={$t(
          { defaultMessage: 'Select LAN Ports for ({model})' },
          { model: selectedModel?.model ?? noDataDisplay }
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
                    // disabled={port.type === 'TRUNK'}
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
  const [withNsg, setWithNsg] = useState(false)

  // VLAN fields state
  const enableGuestVlan = useWatch('enableGuestVlan', form)

  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [personaGroupId, setPersonaGroupId]
    = useState<string|undefined>(propertyConfigsQuery?.data?.personaGroupId)

  const [getUnitById, unitResult] = useLazyGetPropertyUnitByIdQuery()
  const [getPersonaById, personaResult] = useLazyGetPersonaByIdQuery()
  const [getPersonaGroupById, personaGroupResult] = useLazyGetPersonaGroupByIdQuery()

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
    if (visible && unitId && venueId && personaGroupId) {
      form.resetFields()
      getUnitById({ params: { venueId, unitId } })
        .then(result => {
          if (result.data) {
            const { personaId, guestPersonaId } = result.data
            // console.log('Unit :: ', result.data)
            combinePersonaInfo(personaId, guestPersonaId, result.data)
          }
        })
        .catch(() => {
          errorCloseDrawer()
        })
    }
  }, [visible, unitId])

  const combinePersonaInfo = (personaId?: string, guestPersonaId?: string, data?: PropertyUnit) => {
    let personaPromise, guestPromise

    if (personaId) {
      personaPromise = getPersonaById({ params: { groupId: personaGroupId, id: personaId } })
    }

    if (guestPersonaId) {
      guestPromise = getPersonaById({ params: { groupId: personaGroupId, id: guestPersonaId } })
    }

    Promise.all([personaPromise, guestPromise])
      .then(([personaResult, guestResult]) => {
        form.setFieldsValue(data ?? {})
        if (personaResult?.data) {
          const { vlan, dpskPassphrase, ethernetPorts, vni } = personaResult.data as Persona
          if (withNsg) {
            const apName = ethernetPorts?.[0]?.name
            const accessAp = ethernetPorts?.[0]?.macAddress?.replaceAll('-', ':')
            const ports = ethernetPorts?.map(p => p.portIndex)

            form.setFieldValue('apName', apName)
            form.setFieldValue('accessAp', accessAp)
            form.setFieldValue('ports', ports?.map(i => i.toString()))
            form.setFieldValue('vxlan', vni ?? noDataDisplay)
          } else {
            form.setFieldValue(['unitPersona', 'vlan'], vlan)
          }
          form.setFieldValue(['unitPersona', 'dpskPassphrase'], dpskPassphrase)
        }

        if (guestResult?.data) {
          const { vlan, dpskPassphrase } = guestResult.data
          if (!withNsg) {
            form.setFieldValue('enableGuestVlan', personaResult?.data?.vlan !== vlan)
            // if no timeout would not render exactly
            setTimeout(() => {
              form.setFieldValue(['guestPersona', 'vlan'], vlan)
            }, 10)
          }
          form.setFieldValue(['guestPersona', 'dpskPassphrase'], dpskPassphrase)
        }
      })
  }

  const errorCloseDrawer = () => {
    // console.log('Something wrong so close the Drawer ...')
    onClose()
  }

  const handleEditUnit = async (formValues: PropertyUnitFormFields) => {
    // TODO: handle exception for more detail information
    const { name, resident, personaId, guestPersonaId, unitPersona, guestPersona,
      ports, accessAp, apName } = formValues
    // console.log('Edit action :: ', formValues)

    // update Unit
    const unitUpdateResult = await updateUnitMutation({
      params: { venueId, unitId },
      payload: { name, resident }
    }).unwrap()

    const personaUpdateResult = withNsg
      ? await patchPersona(personaId, {
        ...unitPersona,
        ...ports
          ? {
            ethernetPorts: ports.map(p => ({
              personaId,
              macAddress: accessAp,
              portIndex: p,
              name: apName
            } as PersonaEthernetPort))
          }
          : {}
      })
      : await patchPersona(personaId, unitPersona)

    // update Persona
    const guestUpdateResult = await patchPersona(
      guestPersonaId,
      { ...guestPersona, vlan: guestPersona?.vlan ?? unitPersona?.vlan }
    )

    return Promise.all([unitUpdateResult, personaUpdateResult, guestUpdateResult])
  }

  const patchPersona = async (id?: string, payload?: UnitPersonaConfig) => {
    return (id && payload)
      ? await updatePersonaMutation({ params: { groupId: personaGroupId, id }, payload }).unwrap()
      : Promise.resolve()
  }

  const toCreateUnitPayload = (formValues: PropertyUnitFormFields): PropertyUnit => {
    const { unitPersona, guestPersona, resident, accessAp, ports, apName, ...others } = formValues
    const pureResident = _.pickBy(resident, v => v && v.length > 0)

    const selectedPorts = accessAp
      ? ports?.map(index => ({
        macAddress: accessAp.replaceAll(':', '-'),
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
        ? { accessPoint: { name: apName, selectedPorts } }
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
    // console.log('Form finish values = ', values)

    try {
      isEdit ? await handleEditUnit(values) : await handleAddUnit(values)
      onClose()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
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

  const withoutNsgForm = <>
    <Form.Item label={$t({ defaultMessage: 'VLAN' })}>
      <Form.Item
        noStyle
        name={['unitPersona', 'vlan']}
        rules={[{
          type: 'number',
          min: 1,
          max: 4094,
          message: $t(validationMessages.vlanRange)
        }]}
      >
        <InputNumber />
      </Form.Item>
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
    {enableGuestVlan &&
        <Form.Item
          name={['guestPersona', 'vlan']}
          rules={[{
            type: 'number',
            min: 1,
            max: 4094,
            message: $t(validationMessages.vlanRange)
          }]}
        >
          <InputNumber />
        </Form.Item>
    }
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
            unitResult,
            propertyConfigsQuery,
            personaResult,
            personaGroupResult
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
              rules={[
                { required: true }
              ]}
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
