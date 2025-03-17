import { useEffect, useState } from 'react'

import { Checkbox, Form, Input, InputNumber, Select, Space, Switch } from 'antd'
import { useWatch }                                                  from 'antd/lib/form/Form'
import _                                                             from 'lodash'
import moment                                                        from 'moment-timezone'
import { FormattedMessage, useIntl }                                 from 'react-intl'

import { Drawer, Loader, StepsForm, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import {
  PhoneInput
} from '@acx-ui/rc/components'
import {
  useAddPropertyUnitMutation,
  useApListQuery,
  useLazyGetPropertyUnitByIdQuery,
  useLazyGetPersonaByIdQuery,
  useGetPropertyConfigsQuery,
  useUpdatePropertyUnitMutation,
  useUpdatePersonaMutation,
  useLazyGetPersonaGroupByIdQuery,
  useGetConnectionMeteringListQuery,
  useLazyGetPropertyUnitListQuery,
  useGetVenueApCapabilitiesQuery
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
  ConnectionMetering,
  PropertyDpskSetting,
  trailingNorLeadingSpaces,
  CapabilitiesApModel
} from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'
import { noDataDisplay, validationMessages } from '@acx-ui/utils'

import { ConnectionMeteringSettingForm } from '../ConnectionMeteringSettingForm'


function AccessPointLanPortSelector (props: { venueId: string }) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const { venueId } = props
  const form = Form.useFormInstance()
  const [selectedModel, setSelectedModel] = useState({} as CapabilitiesApModel)
  const accessAp = Form.useWatch('accessAp')

  const { data: apCapabilities } = useGetVenueApCapabilitiesQuery({
    params: { tenantId, venueId },
    enableRbac: isWifiRbacEnabled
  })

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
    },
    enableRbac: isWifiRbacEnabled
  })

  useEffect(() => {
    if (!apCapabilities || !apListResult?.data || !accessAp) return
    onSelectApChange(accessAp)
  }, [apListResult, apCapabilities, accessAp])

  const apOptions = apListResult?.data
    ?.filter((ap: APExtended) => ap.apMac && ap.model)
    ?.map((ap: APExtended) => ({
      value: ap.apMac,
      label: ap.name,
      model: ap.model,
      serialNumber: ap.serialNumber
    })) || []

  const onSelectApChange = (macAddress: string) => {
    const selectedAp = apOptions?.find(ap => ap.value === macAddress)

    if (!selectedAp) {
      // When the ap can not match any device, clean the state to prevent the data inconsistency.
      form.setFieldValue('accessAp', undefined)
      form.setFieldValue('ports', undefined)
    }

    const apModel = apCapabilities?.apModels
      ?.find(capability => capability.model === selectedAp?.model) ?? {} as CapabilitiesApModel
    setSelectedModel(apModel)
    form.setFieldValue('apName', selectedAp?.label)
  }

  return (
    <>
      <Form.Item noStyle name={'apName'}>
        <Input type='hidden'/>
      </Form.Item>
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
          { model: accessAp ? selectedModel?.model ?? noDataDisplay : noDataDisplay }
        )}
        rules={[
          { required: !!accessAp, message: $t({ defaultMessage: 'Please select the LAN ports' }) }
        ]}
      >
        {accessAp && selectedModel.lanPorts ?
          <Checkbox.Group >
            <Space direction={'vertical'}>
              {
                selectedModel?.lanPorts.map((port, index) =>
                  <Tooltip
                    title={port.isPoePort
                      ? $t({ defaultMessage: 'POE port can not be assigned' })
                      : ''}
                  >
                    <Checkbox
                      key={index}
                      value={
                        port?.id
                          ? parseInt(port.id, 10)
                          : index
                      }
                      disabled={port.isPoePort} // POE port can not be assigned
                    >
                      {`LAN${port.id}`}
                    </Checkbox>
                  </Tooltip>
                )
              }
            </Space>
          </Checkbox.Group> : <></>
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
  const [isReady, setIsReady] = useState(!isEdit) // Control the Drawer rendering state
  const [withPin, setWithPin] = useState(true)
  const [connectionMeteringList, setConnectionMeteringList] = useState<ConnectionMetering[]>([])
  const [qosSetting, setQosSetting] = useState<QosSetting>()
  // VLAN fields state
  const enableGuestVlan = useWatch('enableGuestVlan', form)

  const isConnectionMeteringAvailable = useIsSplitOn(Features.CONNECTION_METERING)
  const connectionMeteringListQuery = useGetConnectionMeteringListQuery(
    { payload: { pageSize: '2147483647', page: '1' } }, { skip: !isConnectionMeteringAvailable }
  )


  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [enableGuestUnit, setEnableGuestUnit] = useState<boolean>(true)
  const [personaGroupId, setPersonaGroupId] = useState<string|undefined>(undefined)

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
      setEnableGuestUnit(propertyConfigsQuery.data?.unitConfig?.guestAllowed ?? false)

      getPersonaGroupById({ params: { groupId } })
        .then(result => setWithPin(!!result.data?.personalIdentityNetworkId))
    }
  }, [propertyConfigsQuery.data, propertyConfigsQuery.isLoading ])

  useEffect(() => {
    // // eslint-disable-next-line no-console
    // console.log('reset0 :: ', visible && unitId && venueId && personaGroupId)
    if (unitId && venueId && personaGroupId) {
      form.resetFields()
      setIsReady(false)

      getUnitById({ params: { venueId, unitId } })
        .then(result => {
          if (result.data) {
            const { personaId, guestPersonaId } = result.data
            combinePersonaInfo(result.data, personaId, guestPersonaId)
          }
        })
        .catch(() => {
          errorCloseDrawer()
        })
    }
  }, [unitId, personaGroupId])

  const combinePersonaInfo = (
    unitData: PropertyUnit,
    personaId?: string,
    guestPersonaId?: string
  ) => {
    let unitFormFields: PropertyUnitFormFields = unitData
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

          if (withPin) {
            // Assume that a Persona only allow to bind with one AP
            const apName = ethernetPorts?.[0]?.name
            const accessAp = ethernetPorts?.[0]?.macAddress?.replaceAll('-', ':')
            const ports = ethernetPorts?.map(p => p.portIndex)

            unitFormFields = {
              ...unitFormFields,
              apName,
              accessAp,
              ports,
              vxlan: vni
            }
          }

          if (isConnectionMeteringAvailable) {
            unitFormFields = {
              ...unitFormFields,
              meteringProfileId,
              expirationDate: expirationDate ? moment(expirationDate) : undefined
            }
            setQosSetting({
              profileId: meteringProfileId,
              expirationDate: expirationDate ? moment(expirationDate): undefined
            })
          }

          unitFormFields = {
            ...unitFormFields,
            unitPersona: { vlan, dpskPassphrase }
          }
        }

        if (guestResult?.data) {
          const { vlan, dpskPassphrase } = guestResult.data

          unitFormFields = {
            ...unitFormFields,
            enableGuestVlan: personaResult?.data?.vlan !== vlan,
            guestPersona: { vlan, dpskPassphrase }
          }
        }

        setIsReady(true)

        form.setFieldsValue(unitFormFields)
        setRawFormValues(unitFormFields)
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
        passphrase: diffUnitPersona?.dpskPassphrase === ''
          ? undefined : diffUnitPersona?.dpskPassphrase,
        vlan: diffUnitPersona?.vlan ?? unitPersona?.vlan
      },
      {
        type: PropertyDpskType.GUEST,
        passphrase: diffGuestPersona?.dpskPassphrase === ''
          ? undefined : diffGuestPersona?.dpskPassphrase,
        vlan: diffGuestPersona?.vlan ?? guestPersona?.vlan ?? unitPersona?.vlan
      }
    ]

    const profileId = isConnectionMeteringAvailable ?
      meteringProfileId !== qosSetting?.profileId ? meteringProfileId ?? null : undefined
      : undefined

    let newExpirationDate = isConnectionMeteringAvailable ?
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
      ...(withPin && {
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
      ? await updatePersonaMutation({
        params: { groupId: personaGroupId, id },
        payload
      }).unwrap()
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

    const trafficControl = isConnectionMeteringAvailable && meteringProfileId && expirationDate ?
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
          passphrase: unitPersona?.dpskPassphrase === ''
            ? undefined : unitPersona?.dpskPassphrase,
          vlan: unitPersona?.vlan
        },
        {
          type: PropertyDpskType.GUEST,
          passphrase: guestPersona?.dpskPassphrase === ''
            ? undefined : guestPersona?.dpskPassphrase,
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

  const withPinForm = (<>
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
                // UnitName(235) -> PersonaName(255)
                // ex. Rule = GUEST_{UnitName}-{timestamp} or UNIT_{UnitName}-{timestamp}
                { max: 235 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
                { validator: (_, value) => nameValidator(value) }
              ]}
            />
            <Form.Item
              name={['unitPersona', 'dpskPassphrase']}
              label={
                <>
                  { $t({ defaultMessage: 'DPSK Passphrase' }) }
                  <Tooltip.Question
                    placement='bottom'
                    title={<FormattedMessage
                    // eslint-disable-next-line max-len
                      defaultMessage={'If empty, passphrase will be generated by the system. Valid range 8-63'}
                    />}
                  />
                </>
              }
              rules={[
                { min: 8 },
                { max: 63 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
              children={<Input />}
            />
            {enableGuestUnit &&
              <Form.Item
                name={['guestPersona', 'dpskPassphrase']}
                label={
                  <>
                    { $t({ defaultMessage: 'Guest DPSK Passphrase' }) }
                    <Tooltip.Question
                      placement='bottom'
                      title={<FormattedMessage
                      // eslint-disable-next-line max-len
                        defaultMessage={'If empty, passphrase will be generated by the system. Valid range 8-63'}
                      />}
                    />
                  </>
                }
                rules={[
                  { min: 8 },
                  { max: 63 },
                  { validator: (_, value) => trailingNorLeadingSpaces(value) }
                ]}
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
                  initialValue={isEdit}
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

            {withPin && withPinForm}

            <Form.Item
              name={['resident', 'name']}
              label={$t({ defaultMessage: 'Resident Name' })}
              rules={[
                { required: true },
                { max: 255 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
              children={<Input />}
            />
            <Form.Item
              name={['resident', 'email']}
              label={$t({ defaultMessage: 'Resident\'s Email' })}
              rules={[
                { max: 255 },
                { validator: (_, value) => emailRegExp(value) }
              ]}
              children={<Input />}
            />
            <Form.Item
              name={['resident', 'phoneNumber']}
              label={$t({ defaultMessage: 'Resident\'s Phone Number' })}
              rules={[
                { validator: (_, value) => phoneRegExp(value) }
              ]}
              children={
                isReady ?
                  <PhoneInput
                    name={['resident', 'phoneNumber']}
                    callback={(value) => form.setFieldValue(['resident', 'phoneNumber'], value)}
                    onTop={false}
                    defaultCountryCode={countryCode}
                  />: <></>}
              validateFirst
            />
            {isConnectionMeteringAvailable &&
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
