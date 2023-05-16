import { useEffect, useState } from 'react'

import { ArrowUpOutlined, ArrowDownOutlined }                                  from '@ant-design/icons'
import { Checkbox, Col, Form, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import { useWatch }                                                            from 'antd/lib/form/Form'
import _                                                                       from 'lodash'
import moment                                                                  from 'moment-timezone'
import { useIntl }                                                             from 'react-intl'

import { Drawer, Loader, StepsForm, Button,  Modal, ModalType, DatePicker } from '@acx-ui/components'
import { ConnectionMeteringForm, ConnectionMeteringFormMode }               from '@acx-ui/rc/components'
import {
  useAddPropertyUnitMutation,
  useApListQuery,
  useLazyGetPropertyUnitByIdQuery,
  useGetVenueLanPortsQuery,
  useLazyGetPersonaByIdQuery,
  useGetPropertyConfigsQuery,
  useUpdatePropertyUnitMutation,
  useUpdatePersonaMutation,
  useLazyGetPersonaGroupByIdQuery,
  useGetConnectionMeteringListQuery
} from '@acx-ui/rc/services'
import {
  APExtended,
  BillingCycleType,
  ConnectionMetering,
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


function RateLimitLabel (props:{ uploadRate?:number, downloadRate?:number }) {
  const { uploadRate, downloadRate } = props
  const { $t } = useIntl()
  return (<div style={{ display: 'flex' }}>
    <div style={{ display: 'flex' }}>
      <div><ArrowDownOutlined /></div>
      <div>
        <span>{downloadRate ? downloadRate + 'mbps' : $t({ defaultMessage: 'Unlimited' })}</span>
      </div>
    </div>
    <div style={{ display: 'flex', marginLeft: '4px' }}>
      <div><ArrowUpOutlined /></div>
      <div>
        <span>{uploadRate ? uploadRate + 'mbps' : $t({ defaultMessage: 'Unlimited' })}</span>
      </div>
    </div>
  </div>)
}

function DataConsumptionLable (props: {
  billingCycleRepeat: boolean,
  biilingCycleType: BillingCycleType,
  billingCycleDays?: number }
) {
  const { $t } = useIntl()
  const { billingCycleRepeat, biilingCycleType, billingCycleDays } = props
  let displayText: string = ''

  if (!billingCycleRepeat) {
    displayText += $t({ defaultMessage: 'Once' })
  } else {
    displayText += $t({ defaultMessage: 'Repeating cycles' }) + ' '
    if (biilingCycleType === 'CYCLE_MONTHLY') {
      displayText += '(Monthly)'
    } else if (biilingCycleType === 'CYCLE_WEEKLY') {
      displayText += '(Weekly)'
    } else if (biilingCycleType === 'CYCLE_NUM_DAYS' && billingCycleDays !== undefined) {
      displayText += '(Per ' + billingCycleDays + ' days)'
    }
  }

  return (
    <span>{displayText}</span>
  )
}

function ConnectionMeteringPanel (props: { data:ConnectionMetering }) {
  const { $t } = useIntl()
  const { data } = props
  return (
    <div>
      <div>
        <StepsForm.Title style={{ fontSize: '12px' }}>
          {$t({ defaultMessage: 'Rate limiting' })}
        </StepsForm.Title>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '40%' }}>
          <span style={{ fontSize: '10px' }}>{$t({ defaultMessage: 'Rate limit:' })}</span>
        </div>
        <div style={{ width: '60%', fontSize: '10px' }}>
          <RateLimitLabel uploadRate={data.uploadRate} downloadRate={data.downloadRate} />
        </div>
      </div>
      <div style={{ marginTop: '4px' }}>
        <StepsForm.Title style={{ fontSize: '12px' }}>
          {$t({ defaultMessage: 'Data comsumption' })}
        </StepsForm.Title>
      </div>
      <div style={{ display: 'flex', fontSize: '10px' }}>
        <div style={{ width: '40%' }}>
          <span>{$t({ defaultMessage: 'MaxData:' })}</span>
        </div>
        <div style={{ width: '60%' }}>
          <span>{data.dataCapacity > 0 ? data.dataCapacity + 'mbps' :
            $t({ defaultMessage: 'Unlimited' })}</span>
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: '10px' }}>
        <div style={{ width: '40%' }}>
          <span>{$t({ defaultMessage: 'Consumption cycle:' })}</span>
        </div>
        <div style={{ width: '60%' }}>
          <DataConsumptionLable
            billingCycleRepeat={data.billingCycleRepeat}
            biilingCycleType={data.billingCycleType}
            billingCycleDays={data.billingCycleDays}/>
        </div>
      </div>
    </div>
  )
}


function ConnectionMeteringSettingForm (props: { data: ConnectionMetering[] }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { data } = props
  const [modalVisible, setModalVisible] = useState(false)
  const onModalClose = () => setModalVisible(false)
  const [profileId, setProfileId ] = useState(form.getFieldValue('meteringProfileId'))
  const [profileMap, setProfileMap] = useState(new Map(data.map((p) => [p.id, p])))

  return (
    <>
      <StepsForm.Title style={{ fontSize: '14px' }}>
        {$t({ defaultMessage: 'Traffic Control' })}
      </StepsForm.Title>
      <Space direction={'vertical'} size={24} style={{ display: 'flex' }}>
        <Row>
          <Col span={21}>
            <Form.Item
              label={$t({ defaultMessage: 'Connection Metering' })}
              name={'meteringProfileId'}
              // eslint-disable-next-line max-len
              tooltip={$t({ defaultMessage: 'All devices that belong to this unit will be applied to the selected connection metering policy' })}
            >
              <Select
                allowClear
                placeholder={$t({ defaultMessage: 'Select...' })}
                options={data.map(list=> ({ value: list.id, label: list.name }))}
                value={profileId}
                onChange={(v)=> {setProfileId(v)}}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label={' '}>
              <Button
                style={{ marginLeft: '5px' }}
                type={'link'}
                onClick={()=>setModalVisible(true)}
              >
                {$t({ defaultMessage: 'Add' })}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        {profileId !== undefined &&
        <Row>
          <Col span={24}>
            <ConnectionMeteringPanel data={profileMap.get(profileId)!!}/>
          </Col>
        </Row> &&
        <Row>
          <Col span={24}>
            <Form.Item
              name={'expirationDate'}
              label={$t({ defaultMessage: 'Expiration Date of Data Consumption' })}
              required>
              <DatePicker
                style={{ width: '90%' }}
                disabledDate={(date)=> date.diff(moment.now()) < 0}/>
            </Form.Item>
          </Col>
        </Row>}
      </Space>

      <Modal
        title={$t({ defaultMessage: 'Add Connection Metering' })}
        visible={modalVisible}
        type={ModalType.ModalStepsForm}
        children={<ConnectionMeteringForm
          mode={ConnectionMeteringFormMode.CREATE}
          useModalMode={true}
          modalCallback={(result?: ConnectionMetering) => {
            if (result) {
              form.setFieldValue('meteringProfileId', result.id)
              setProfileMap(map => new Map(map.set(result.id, result)))
              setProfileId(result.id)
            }
            onModalClose()
          }}
        />}
        onCancel={onModalClose}
        width={1200}
        destroyOnClose={true}
      />
    </>
  )
}


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
  const [connectionMeteringList, setConnectionMeteringList] = useState([] as ConnectionMetering[])
  // VLAN fields state
  const enableGuestVlan = useWatch('enableGuestVlan', form)

  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [personaGroupId, setPersonaGroupId]
    = useState<string|undefined>(propertyConfigsQuery?.data?.personaGroupId)

  const [getUnitById, unitResult] = useLazyGetPropertyUnitByIdQuery()
  const [getPersonaById, personaResult] = useLazyGetPersonaByIdQuery()
  const [getPersonaGroupById, personaGroupResult] = useLazyGetPersonaGroupByIdQuery()
  const connectionMeteringListQuery = useGetConnectionMeteringListQuery(
    { params: { pageSize: '2147483647', page: '0' } }
  )
  // Mutation - Create & Update
  const [addUnitMutation] = useAddPropertyUnitMutation()
  const [updateUnitMutation] = useUpdatePropertyUnitMutation()
  const [updatePersonaMutation] = useUpdatePersonaMutation()

  useEffect(()=>{
    if (!connectionMeteringListQuery.isLoading && connectionMeteringListQuery.data) {
      setConnectionMeteringList(connectionMeteringListQuery?.data.data)
    }
  }, [connectionMeteringListQuery.data])

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
          const {
            vlan, dpskPassphrase, ethernetPorts, vni, meteringProfileId, expirationEpoch
          } = personaResult.data as Persona
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
          form.setFieldValue('meteringProfileId', meteringProfileId)
          if (expirationEpoch !== undefined) {
            form.setFieldValue('expirationDate', new Date(0).setUTCSeconds(expirationEpoch) )
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
      ports, accessAp, apName, meteringProfileId, expirationDate } = formValues
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
          : {},
        meteringProfileId: meteringProfileId,
        expirationEpoch: meteringProfileId && expirationDate ?
          expirationDate.getTime() / 1000 : undefined
      })
      : await patchPersona(personaId, unitPersona)

    // update Persona
    const guestUpdateResult = await patchPersona(
      guestPersonaId,
      { ...guestPersona,
        vlan: guestPersona?.vlan ?? unitPersona?.vlan,
        meteringProfileId: undefined,
        expirationEpoch: undefined
      }
    )

    return Promise.all([unitUpdateResult, personaUpdateResult, guestUpdateResult])
  }

  const patchPersona = async (id?: string, payload?: UnitPersonaConfig) => {
    return (id && payload)
      ? await updatePersonaMutation({ params: { groupId: personaGroupId, id }, payload }).unwrap()
      : Promise.resolve()
  }

  const toCreateUnitPayload = (formValues: PropertyUnitFormFields): PropertyUnit => {
    const {
      unitPersona, guestPersona, resident, accessAp, ports, apName,
      meteringProfileId, expirationDate, ...others
    } = formValues
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
        : {},
      meteringProfileId: meteringProfileId,
      expirationEpoch: meteringProfileId && expirationDate ?
        expirationDate.getTime() / 1000 : undefined
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
            personaGroupResult,
            connectionMeteringListQuery
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
            <ConnectionMeteringSettingForm data={connectionMeteringList}/>
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
