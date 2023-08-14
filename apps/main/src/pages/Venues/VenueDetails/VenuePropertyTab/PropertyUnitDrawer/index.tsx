import { useEffect, useState, useRef } from 'react'

import { ArrowUpOutlined, ArrowDownOutlined }                                              from '@ant-design/icons'
import { Checkbox, Col, Form, Input, InputNumber, Row, Select, Space, Switch, Typography } from 'antd'
import { useWatch }                                                                        from 'antd/lib/form/Form'
import _                                                                                   from 'lodash'
import moment                                                                              from 'moment-timezone'
import { useIntl }                                                                         from 'react-intl'
import styled                                                                              from 'styled-components'

import { Drawer, Loader, StepsForm, Button,  Modal, ModalType, Subtitle, Tooltip, DatePicker } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                              from '@acx-ui/feature-toggle'
import { ConnectionMeteringForm, ConnectionMeteringFormMode, PhoneInput }                      from '@acx-ui/rc/components'
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
  useGetConnectionMeteringListQuery,
  useLazyGetPropertyUnitListQuery
} from '@acx-ui/rc/services'
import {
  APExtended,
  checkObjectNotExists,
  emailRegExp,
  Persona,
  PersonaEthernetPort,
  phoneRegExp,
  PropertyDpskType,
  PropertyUnit,
  PropertyUnitFormFields,
  PropertyUnitStatus,
  UnitPersonaConfig,
  VenueLanPorts,
  BillingCycleType,
  ConnectionMetering,
  PropertyDpskSetting
} from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'
import { noDataDisplay, validationMessages } from '@acx-ui/utils'
const Info = styled(Typography.Text)`
  overflow-wrap: anywhere;
  font-size: 12px;
`

function RateLimitLabel (props:{ uploadRate?:number, downloadRate?:number }) {
  const { uploadRate, downloadRate } = props
  const { $t } = useIntl()
  return (<div style={{ display: 'flex' }}>
    <div style={{ display: 'flex' }}>
      <div><ArrowDownOutlined /></div>
      <div>
        <Info>
          {downloadRate ? downloadRate + 'mbps' : $t({ defaultMessage: 'Unlimited' })}
        </Info>
      </div>
    </div>
    <div style={{ display: 'flex', marginLeft: '4px' }}>
      <div><ArrowUpOutlined /></div>
      <div>
        <Info>{uploadRate ? uploadRate + 'mbps' : $t({ defaultMessage: 'Unlimited' })}</Info>
      </div>
    </div>
  </div>)
}

function DataConsumptionLable (props: {
  billingCycleRepeat: boolean,
  biilingCycleType: BillingCycleType,
  billingCycleDays: number | null
}) {
  const { $t } = useIntl()
  const { billingCycleRepeat, biilingCycleType, billingCycleDays } = props

  if (!billingCycleRepeat) return <Info>{$t({ defaultMessage: 'Once' })}</Info>
  return <Info>{ $t({ defaultMessage: `Repeating cycles {
    cycleType, select,
    CYCLE_MONTHLY {(Monthly)}
    CYCLE_WEEKLY {(Weekly)}
    CYCLE_NUM_DAYS {(Per {cycleDays} days)}
    other {}
  }` }, {
    cycleType: biilingCycleType,
    cycleDays: billingCycleDays
  })}</Info>

}

function ConnectionMeteringPanel (props: { data:ConnectionMetering }) {
  const { $t } = useIntl()
  const { data } = props
  return (
    <div>
      <div>
        <Subtitle level={5}>
          {$t({ defaultMessage: 'Rate limiting' })}
        </Subtitle>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '40%' }}>
          <Info>{$t({ defaultMessage: 'Rate limit:' })}</Info>
        </div>
        <div style={{ width: '60%', fontSize: '12px' }}>
          <RateLimitLabel uploadRate={data.uploadRate} downloadRate={data.downloadRate} />
        </div>
      </div>
      <div style={{ marginTop: '4px' }}>
        <Subtitle level={5}>
          {$t({ defaultMessage: 'Data consumption' })}
        </Subtitle>
      </div>
      <div style={{ display: 'flex', fontSize: '12px' }}>
        <div style={{ width: '40%' }}>
          <Info>{$t({ defaultMessage: 'MaxData:' })}</Info>
        </div>
        <div style={{ width: '60%' }}>
          <Info>{data.dataCapacity > 0 ? data.dataCapacity + 'mbps' :
            $t({ defaultMessage: 'Unlimited' })}</Info>
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: '12px' }}>
        <div style={{ width: '40%' }}>
          <Info>{$t({ defaultMessage: 'Consumption cycle:' })}</Info>
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


function ConnectionMeteringSettingForm (props:{ data: ConnectionMetering[], isEdit: boolean })
{
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { data, isEdit } = props
  const [modalVisible, setModalVisible] = useState(false)
  const onModalClose = () => setModalVisible(false)
  const [profileMap, setProfileMap] = useState(new Map(data.map((p) => [p.id, p])))
  const profileId = useWatch('meteringProfileId', form)
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldScrollDown = useRef<boolean>(!isEdit)

  useEffect(()=> {
    if (shouldScrollDown.current && profileId && bottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [profileId])

  useEffect(()=> {
    setProfileMap(new Map(data.map((p) => [p.id, p])))
  }, [data])


  return (
    <>
      <StepsForm.Title style={{ fontSize: '14px' }}>
        {$t({ defaultMessage: 'Traffic Control' })}
      </StepsForm.Title>
      <Space direction={'vertical'} size={24} style={{ display: 'flex', marginTop: '5px' }}>
        <Row>
          <Col span={21}>
            <Form.Item
              label={
                <>
                  {$t({ defaultMessage: 'Data Usage Metering' })}
                  <Tooltip.Question
                    // eslint-disable-next-line max-len
                    title={$t({ defaultMessage: 'All devices that belong to this unit will be applied to the selected data usage metering profile' })}
                    placement='top'
                  />
                </>
              }
              name={'meteringProfileId'}
            >
              <Select
                allowClear
                placeholder={$t({ defaultMessage: 'Select...' })}
                options={Array.from(profileMap,
                  (entry) => ({ label: entry[1].name, value: entry[0] }))}
                onChange={()=> {shouldScrollDown.current = true}}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Button
              style={{ marginLeft: '5px', height: '100%' }}
              type={'link'}
              onClick={()=>setModalVisible(true)}
            >
              {$t({ defaultMessage: 'Add' })}
            </Button>
          </Col>
        </Row>
        {profileId && profileMap.has(profileId) &&
        <>
          <Row>
            <Col span={24}>
              <ConnectionMeteringPanel
                data={profileMap.get(profileId)!!}/>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name={'expirationDate'}
                label={$t({ defaultMessage: 'Expiration Date of Data Consumption' })}
                required
                rules={[{ required: true }]}
                getValueFromEvent={(onChange) => onChange ? moment(onChange): undefined}
                getValueProps={(i) => ({ value: i ? moment(i) : undefined })}
                initialValue={form.getFieldValue('expirationDate')}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(date)=> date.diff(moment.now()) < 0}
                />
              </Form.Item>
              <div ref={bottomRef}></div>
            </Col>
          </Row>
        </>}
      </Space>

      <Modal
        title={$t({ defaultMessage: 'Add Data Usage Metering' })}
        visible={modalVisible}
        type={ModalType.ModalStepsForm}
        children={<ConnectionMeteringForm
          mode={ConnectionMeteringFormMode.CREATE}
          useModalMode={true}
          modalCallback={(result?: ConnectionMetering) => {
            if (result) {
              setProfileMap(map => map.set(result.id, result))
              form.setFieldValue('meteringProfileId', result.id)
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

    if (!selectedAp) {
      // When the ap can not match any device, clean the state to prevent the data inconsistency.
      form.setFieldValue('accessAp', undefined)
      form.setFieldValue('ports', undefined)
    }

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
        rules={[
          { required: !!accessAp, message: $t({ defaultMessage: 'Please select the LAN ports' }) }
        ]}
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
  venueId: string,
  unitId?: string,
  countryCode?: string
}

interface QosSetting {
  profileId?: string | null,
  expirationDate?: moment.Moment | null
}

export function PropertyUnitDrawer (props: PropertyUnitDrawerProps) {
  const { $t } = useIntl()
  const { isEdit, visible, onClose, venueId, unitId, countryCode } = props
  const [form] = Form.useForm<PropertyUnitFormFields>()
  const [rawFormValues, setRawFormValues]
    = useState<PropertyUnitFormFields>({} as PropertyUnitFormFields)
  const [withNsg, setWithNsg] = useState(false)
  const [connectionMeteringList, setConnectionMeteringList] = useState<ConnectionMetering[]>([])
  const [qosSetting, setQosSetting] = useState<QosSetting>()
  // VLAN fields state
  const enableGuestVlan = useWatch('enableGuestVlan', form)

  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const connectionMeteringListQuery = useGetConnectionMeteringListQuery(
    { params: { pageSize: '2147483647', page: '0' } }, { skip: !isConnectionMeteringEnabled }
  )


  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [enableGuestUnit, setEnableGuestUnit]
    = useState<boolean|undefined>(false)
  const [personaGroupId, setPersonaGroupId]
    = useState<string|undefined>(propertyConfigsQuery?.data?.personaGroupId)

  const [getUnitList] = useLazyGetPropertyUnitListQuery()
  const [getUnitById, unitResult] = useLazyGetPropertyUnitByIdQuery()
  const [getPersonaById, personaResult] = useLazyGetPersonaByIdQuery()
  const [getPersonaGroupById, personaGroupResult] = useLazyGetPersonaGroupByIdQuery()

  // Mutation - Create & Update
  const [addUnitMutation] = useAddPropertyUnitMutation()
  const [updateUnitMutation] = useUpdatePropertyUnitMutation()
  const [updatePersonaMutation] = useUpdatePersonaMutation()

  useEffect(()=>{
    if (!connectionMeteringListQuery.isLoading && connectionMeteringListQuery?.data) {
      setConnectionMeteringList(connectionMeteringListQuery?.data.data)
    }
  }, [connectionMeteringListQuery.data, connectionMeteringListQuery.isLoading])

  useEffect(() => {
    if (!propertyConfigsQuery.isLoading && propertyConfigsQuery.data) {
      const groupId = propertyConfigsQuery.data.personaGroupId
      setPersonaGroupId(groupId)
      setEnableGuestUnit(propertyConfigsQuery.data?.unitConfig?.guestAllowed)

      getPersonaGroupById({ params: { groupId } })
        .then(result => setWithNsg(!!result.data?.nsgId))
    }
  }, [propertyConfigsQuery.data, propertyConfigsQuery.isLoading ])

  useEffect(() => {
    // // eslint-disable-next-line no-console
    // console.log('reset0 :: ', visible && unitId && venueId && personaGroupId)
    if (visible && unitId && venueId && personaGroupId) {
      form.resetFields()
      getUnitById({ params: { venueId, unitId } })
        .then(result => {
          if (result.data) {
            const { personaId, guestPersonaId } = result.data
            form.setFieldsValue(result.data)
            combinePersonaInfo(personaId, guestPersonaId)
          }
        })
        .catch(() => {
          errorCloseDrawer()
        })
    }
  }, [visible, unitId, personaGroupId])

  const combinePersonaInfo = (personaId?: string, guestPersonaId?: string) => {
    let personaPromise, guestPromise

    if (personaId) {
      personaPromise = getPersonaById({ params: { groupId: personaGroupId, id: personaId } })
    }

    if (guestPersonaId) {
      guestPromise = getPersonaById({ params: { groupId: personaGroupId, id: guestPersonaId } })
    }

    Promise.all([personaPromise, guestPromise])
      .then(([personaResult, guestResult]) => {
        if (personaResult?.data) {
          const {
            vlan, dpskPassphrase, ethernetPorts, vni, meteringProfileId, expirationDate
          } = personaResult.data as Persona
          if (withNsg) {
            const apName = ethernetPorts?.[0]?.name
            const accessAp = ethernetPorts?.[0]?.macAddress?.replaceAll('-', ':')
            const ports = ethernetPorts?.map(p => p.portIndex)

            form.setFieldValue('apName', apName)
            form.setFieldValue('accessAp', accessAp)
            form.setFieldValue('ports', ports?.map(i => i.toString()))
            form.setFieldValue('vxlan', vni ?? noDataDisplay)
          }

          if (isConnectionMeteringEnabled) {
            form.setFieldValue('meteringProfileId', meteringProfileId)
            form.setFieldValue('expirationDate', expirationDate ?
              moment(expirationDate) : undefined)
            setQosSetting({
              profileId: meteringProfileId,
              expirationDate: expirationDate ? moment(expirationDate): undefined
            })
          }

          form.setFieldValue(['unitPersona', 'vlan'], vlan)
          form.setFieldValue(['unitPersona', 'dpskPassphrase'], dpskPassphrase)
        }

        if (guestResult?.data) {
          const { vlan, dpskPassphrase } = guestResult.data

          form.setFieldValue('enableGuestVlan', personaResult?.data?.vlan !== vlan)
          // if no timeout would not render exactly
          setTimeout(() => {
            form.setFieldValue(['guestPersona', 'vlan'], vlan)
            setRawFormValues(form.getFieldsValue)
          }, 10)
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
    const { name, resident, personaId, unitPersona, guestPersona,
      ports, accessAp, apName, meteringProfileId, expirationDate } = formValues
    const { name: rawName, resident: rawResident, unitPersona: rawUnitPersona,
      guestPersona: rawGuestPersona } = rawFormValues

    const diffName = name !== rawName && name
    const diffResident = _.omitBy(resident, (value, key) =>
      _.isEqual(value, rawResident?.hasOwnProperty(key)
        ? rawResident[key as keyof typeof resident] : {}))
    const diffUnitPersona = _.omitBy(unitPersona, (value, key) =>
      _.isEqual(value, rawUnitPersona?.hasOwnProperty(key)
        ? rawUnitPersona[key as keyof typeof unitPersona] : {}))
    const diffGuestPersona = _.omitBy(guestPersona, (value, key) =>
      _.isEqual(value, rawGuestPersona?.hasOwnProperty(key)
        ? rawGuestPersona[key as keyof typeof guestPersona] : {}))

    const dpsks: PropertyDpskSetting[] = [
      {
        type: PropertyDpskType.UNIT,
        passphrase: diffUnitPersona?.dpskPassphrase,
        vlan: diffUnitPersona?.vlan ?? unitPersona?.vlan
      },
      {
        type: PropertyDpskType.GUEST,
        passphrase: diffGuestPersona?.dpskPassphrase,
        vlan: diffGuestPersona?.vlan ?? guestPersona?.vlan ?? unitPersona?.vlan
      }
    ]

    const profileId = isConnectionMeteringEnabled ?
      meteringProfileId !== qosSetting?.profileId ? meteringProfileId ?? null : undefined
      : undefined

    let newExpirationDate = isConnectionMeteringEnabled ?
      meteringProfileId ?
        expirationDate && expirationDate.startOf('day') !== qosSetting?.expirationDate ?
          expirationDate.startOf('day').toISOString() : undefined
        : qosSetting?.profileId ? null : undefined
      : undefined

    // Update Unit
    const unitUpdateResult = await updateUnitMutation({
      params: { venueId, unitId },
      payload: {
        ...(diffName && { name: diffName }),
        ...(!_.isEmpty(diffResident) && { resident: diffResident }),
        dpsks
      }
    })

    // Update UnitPersona only when AP data or Qos profile changes
    const personaUpdateResult = await patchPersona(personaId, {
      ...(withNsg && {
        ethernetPorts: ports?.map(p => ({
          personaId,
          macAddress: accessAp,
          portIndex: p,
          name: apName
        } as PersonaEthernetPort)) ?? []
      }),
      meteringProfileId: profileId,
      expirationDate: newExpirationDate
    })

    return Promise.all([unitUpdateResult, personaUpdateResult])
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

    const trafficControl = isConnectionMeteringEnabled && meteringProfileId && expirationDate ?
      {
        meteringProfileId: meteringProfileId,
        profileExpiry: expirationDate.startOf('day').toISOString()
      } : undefined

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
      trafficControl: trafficControl
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

  const nameValidator = async (name: string) => {
    try {
      const list = (await getUnitList({
        params: { venueId },
        payload: { sortField: 'name', sortOrder: 'ASC', pageSize: 10, page: 1, filters: { name } }
      }, true).unwrap()).data.filter(u => u.id !== unitId).map(u => ({ name: u.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Unit' }))
    } catch (e) {
      return Promise.resolve()
    }
  }

  return (
    <Drawer
      destroyOnClose
      width={'480px'}
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
            scrollToFirstError={true}
          >
            <Form.Item name='id' noStyle><Input type='hidden' /></Form.Item>
            <Form.Item name='personaId' noStyle><Input type='hidden' /></Form.Item>
            <Form.Item name='guestPersonaId' noStyle><Input type='hidden' /></Form.Item>

            <Form.Item
              name={'name'}
              label={$t({ defaultMessage: 'Unit Name' })}
              hasFeedback
              validateFirst
              validateTrigger={['onBlur']}
              children={<Input />}
              rules={[
                { required: true },
                { validator: (_, value) => nameValidator(value) }
              ]}
            />
            <Form.Item
              name={['unitPersona', 'dpskPassphrase']}
              label={$t({ defaultMessage: 'DPSK Passphrase' })}
              children={<Input />}
            />
            {enableGuestUnit &&
              <Form.Item
                name={['guestPersona', 'dpskPassphrase']}
                label={$t({ defaultMessage: 'Guest DPSK Passphrase' })}
                children={<Input />}
              />
            }
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

            {enableGuestUnit &&
              <StepsForm.FieldLabel width={'160px'}>
                {$t({ defaultMessage: 'Separate VLAN for guests' })}
                <Form.Item
                  style={{ marginBottom: '10px' }}
                  name={'enableGuestVlan'}
                  valuePropName={'checked'}
                  children={<Switch />}
                />
              </StepsForm.FieldLabel>
            }

            {enableGuestUnit && enableGuestVlan &&
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

            {withNsg && withNsgForm}

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
              rules={[
                { validator: (_, value) => phoneRegExp(value) }
              ]}
              children={<PhoneInput
                name={['resident', 'phoneNumber']}
                callback={(value) => form.setFieldValue(['resident', 'phoneNumber'], value)}
                onTop={false}
                defaultCountryCode={countryCode}
              />}
              validateFirst
            />
            {isConnectionMeteringEnabled &&
              <ConnectionMeteringSettingForm
                data={connectionMeteringList}
                isEdit
              />
            }
          </Form>
        </Loader>
      }
      footer={<Drawer.FormFooter
        buttonLabel={{
          save: isEdit
            ? $t({ defaultMessage: 'Apply' })
            : $t({ defaultMessage: 'Add' })
        }}
        onSave={onSave}
        onCancel={onClose}
      />}
      onClose={onClose}
    />
  )
}
