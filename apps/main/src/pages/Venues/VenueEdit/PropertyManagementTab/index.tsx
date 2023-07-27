import { useContext, useEffect, useRef, useState } from 'react'

import { FetchBaseQueryError }                                                         from '@reduxjs/toolkit/dist/query/react'
import { Col, Form, Row, Select, Switch, Modal as AntModal, Input, Typography, Space } from 'antd'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PersonaGroupDrawer } from 'apps/rc/src/pages/Users/Persona/PersonaGroupDrawer'
import { FormFinishInfo }     from 'rc-field-form/lib/FormContext'
import { useIntl }            from 'react-intl'

import {
  Button,
  Card,
  Loader,
  Modal,
  ModalRef,
  ModalType,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Subtitle,
  Tabs,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsTierAllowed }                                                 from '@acx-ui/feature-toggle'
import { InformationSolid }                                                           from '@acx-ui/icons'
import { PersonaGroupSelect, ResidentPortalForm, TemplateSelector, PersonaGroupLink } from '@acx-ui/rc/components'
import {
  useGetPropertyConfigsQuery,
  useGetPropertyUnitListQuery,
  useGetResidentPortalListQuery,
  useGetVenueQuery,
  useLazyGetPersonaGroupByIdQuery,
  usePatchPropertyConfigsMutation,
  usePutRegistrationByIdMutation,
  useUpdatePropertyConfigsMutation
} from '@acx-ui/rc/services'
import {
  EditPropertyConfigMessages,
  getServiceDetailsLink,
  PropertyConfigs,
  PropertyConfigStatus,
  ResidentPortalType,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../index'



const defaultPropertyConfigs: PropertyConfigs = {
  status: PropertyConfigStatus.DISABLED,
  residentPortalType: ResidentPortalType.NO_PORTAL,
  unitConfig: {
    type: 'unitConfig',
    maxUnitCount: 0,
    useMaxUnitCount: false,
    guestAllowed: false,
    residentPortalAllowed: false,
    residentApiAllowed: false
  },
  communicationConfig: {
    type: 'communicationConfig',
    sendEmail: false,
    sendSms: false
  }
}

const templateScopeIds = {
  email: [
    '648269aa-23c7-41da-baa4-811e92d89ed1',
    '45b68446-c970-4ade-9d64-5ee71f5555d9',
    'b9139125-5c15-469c-a5a8-43c2b3fd6151',
    'e0220126-6e6c-4e10-88ba-42713bddd2a1',
    '56256b0c-d7a0-4957-8e43-d03ecb073e9a'
  ],
  sms: [
    '2baa7cc6-f036-462a-a531-fefb9e531d27',
    'c4a8d5bd-ae48-42d9-b86c-0641942a0ae3',
    '88553d8d-c2bc-4bc8-90b5-cda6b0ff2fb4',
    '6eb696cd-fd12-4c20-930d-65550a1e3eca',
    'd1d41a63-da64-43bf-bde1-f524d920cfbe'
  ]
}

export function PropertyManagementTab () {
  const { $t } = useIntl()
  const basePath = useTenantLink('/venues/')
  const { tenantId, venueId } = useParams()
  const msgTemplateEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const { data: venueData } = useGetVenueQuery({ params: { tenantId, venueId } })
  const navigate = useNavigate()
  const formRef = useRef<StepsFormLegacyInstance<PropertyConfigs>>()
  const { editContextData, setEditContextData } = useContext(VenueEditContext)
  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const [residentPortalModalVisible, setResidentPortalModalVisible] = useState(false)
  const [isPropertyEnable, setIsPropertyEnable] = useState(false)
  const [personaGroupVisible, setPersonaGroupVisible] = useState(false)
  const [groupData, setGroupData] = useState<{ id?: string, name?: string }>()
  const [selectedGroupId, setSelectedGroupId] = useState<string|undefined>()
  const [updateRegistration, registrationResult] = usePutRegistrationByIdMutation()
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const { data: unitQuery } = useGetPropertyUnitListQuery({
    params: { venueId },
    payload: {
      page: 1,
      pageSize: 10,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })
  const hasUnits = (unitQuery?.totalCount ?? -1) > 0
  const personaGroupHasBound = formRef?.current?.getFieldValue('personaGroupId') && hasUnits

  const { data: residentPortalList } = useGetResidentPortalListQuery({
    payload: { page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC' }
  })
  const [updatePropertyConfigs] = useUpdatePropertyConfigsMutation()
  const [patchPropertyConfigs] = usePatchPropertyConfigsMutation()

  const residentPortalTypeOptions = [
    {
      value: ResidentPortalType.NO_PORTAL,
      label: $t({ defaultMessage: 'No Resident Portal' })
    },
    {
      value: ResidentPortalType.RUCKUS_PORTAL,
      label: $t({ defaultMessage: 'Use RUCKUS Portal' })
    },
    {
      value: ResidentPortalType.OWN_PORTAL,
      label: $t({ defaultMessage: 'Use Your Own Portal' })
    }
  ]

  useEffect(() => {
    if (propertyConfigsQuery.isLoading || !formRef.current || !propertyConfigsQuery.data) return
    let residentPortalType = ResidentPortalType.NO_PORTAL
    let enabled

    // If the user disable the Property, it will get 404 for this venue.
    // Therefore, we need to assign to `false` manually to prevent cache issue.
    if ((propertyConfigsQuery?.error as FetchBaseQueryError)?.status === 404) {
      enabled = false
    } else {
      enabled = propertyConfigsQuery.data?.status === PropertyConfigStatus.ENABLED
      formRef?.current.setFieldsValue(propertyConfigsQuery.data)

      const {
        personaGroupId: groupId,
        unitConfig,
        residentPortalId
      } = propertyConfigsQuery.data

      if (unitConfig) {
        const { residentPortalAllowed = false, residentApiAllowed = false } = unitConfig
        if (residentPortalId) {
          residentPortalType = ResidentPortalType.RUCKUS_PORTAL
        } else {
          if (residentApiAllowed) {
            if (residentPortalAllowed) {
              residentPortalType = ResidentPortalType.RUCKUS_PORTAL
            } else {
              residentPortalType = ResidentPortalType.OWN_PORTAL
            }
          }
        }
      }

      if (groupId) {
        setSelectedGroupId(groupId)
        getPersonaGroupById({ params: { groupId } })
          .then(result => {
            setGroupData({ id: groupId, name: result.data?.name })
          })
      }
    }
    formRef?.current.setFieldValue('residentPortalType', residentPortalType)
    setIsPropertyEnable(enabled)
  }, [propertyConfigsQuery.data, formRef])

  const registerMessageTemplates = async () => {
    const registerPromises = [...templateScopeIds.email, ...templateScopeIds.sms]
      .map(scopeId => {
        let selectedOption = formRef?.current?.getFieldValue(scopeId)

        if(selectedOption && selectedOption !== '') {
          return updateRegistration({
            params: {
              templateScopeId: scopeId,
              registrationId: venueId
            },
            payload: {
              id: scopeId,
              templateId: selectedOption,
              usageLocalizationKey: 'venue.property.management',
              usageDescriptionFieldOne: venueData?.name ?? venueId,
              usageDescriptionFieldTwo: venueId
            }
          })
        } else {
          return Promise.resolve()
        }
      })

    await Promise.all(registerPromises)
  }

  const toResidentPortalPayload = (type: ResidentPortalType) => {
    const payload = {
      residentPortalAllowed: false,
      residentApiAllowed: false
    }

    if (type === ResidentPortalType.RUCKUS_PORTAL) {
      payload.residentApiAllowed = true
      payload.residentPortalAllowed = true
    } else if (type === ResidentPortalType.OWN_PORTAL){
      payload.residentApiAllowed = true
    }

    return payload
  }

  const onFormFinish = async (_: string, info: FormFinishInfo) => {
    const {
      unitConfig,
      residentPortalType,
      ...formValues
    } = info.values

    try {
      if (isPropertyEnable) {
        await registerMessageTemplates()
        await updatePropertyConfigs({
          params: { venueId },
          payload: {
            ...formValues,
            venueName: venueData?.name ?? venueId,
            description: venueData?.description,
            address: venueData?.address,
            status: isPropertyEnable
              ? PropertyConfigStatus.ENABLED
              : PropertyConfigStatus.DISABLED,
            unitConfig: {
              ...unitConfig,
              ...toResidentPortalPayload(residentPortalType)
            }
          }
        }).unwrap()
      } else {
        await patchPropertyConfigs({
          params: { venueId },
          payload: { status: PropertyConfigStatus.DISABLED }
        }).unwrap()
      }

      setEditContextData({
        ...editContextData,
        isDirty: false
      })
    } catch (e) {
      console.log(e) // eslint-disable-line no-console
    }
  }

  const handlePropertyEnable = (enabled: boolean) => {
    if (!enabled) {
      showConfirmModal(() => setIsPropertyEnable(false))
    } else {
      setIsPropertyEnable(enabled)
    }
  }

  const showConfirmModal = (callback: () => void) => {
    const modal = AntModal['confirm']({})

    modal.update({
      title: $t({ defaultMessage: 'Disable Property Management?' }),
      content: <>
        {$t(EditPropertyConfigMessages.DISABLE_PROPERTY_MESSAGE)}
        {confirmForm({ text: 'Disable', modal })}
      </>,
      okText: $t({ defaultMessage: 'Disable' }),
      okButtonProps: { disabled: true },
      onOk: () => {callback()},
      icon: <> </>
    })

  }

  const confirmForm = (props: {
    text: string,
    modal: ModalRef
  }) => {
    const label = $t({ defaultMessage: 'Type the word "{text}" to confirm:' }, { text: props.text })
    return (
      <Form>
        <Form.Item name='name' label={label}>
          <Input onChange={(e) => {
            const disabled = e.target.value.toLowerCase() !== props.text.toLowerCase()
            props.modal.update({
              okButtonProps: { disabled: disabled }
            })
          }} />
        </Form.Item>
      </Form>
    )
  }

  const handleFormChange = async () => {
    setEditContextData({
      ...editContextData,
      isDirty: true,
      tabTitle: $t({ defaultMessage: 'Property' }),
      updateChanges: () => formRef?.current?.submit()
    })
  }

  const onResidentPortalModalClose = () => {
    setResidentPortalModalVisible(false)
  }

  return (
    <Loader
      states={[
        { ...propertyConfigsQuery, error: undefined },
        { isLoading: false, isFetching: registrationResult.isLoading }
      ]}
    >
      <StepsFormLegacy
        formRef={formRef}
        onFormFinish={onFormFinish}
        onFormChange={handleFormChange}
        onCancel={() => navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
        })}
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsFormLegacy.StepForm
          initialValues={defaultPropertyConfigs}
        >
          <Row gutter={20} style={{ marginBottom: '12px' }}>
            <Col span={8}>
              <Typography.Text>
                {$t({ defaultMessage: 'Enable Property Management' })}
              </Typography.Text>
              <Switch
                data-testid={'property-enable-switch'}
                checked={isPropertyEnable}
                onChange={handlePropertyEnable}
                style={{ marginLeft: '20px' }}
              />
              <Tooltip.Question
                title={$t(EditPropertyConfigMessages.ENABLE_PROPERTY_TOOLTIP)}
                placement={'bottom'}
              />
            </Col>
          </Row>
          {isPropertyEnable &&
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item
                  name='personaGroupId'
                  label={<>
                    {$t({ defaultMessage: 'Persona Group' })}
                    <Tooltip.Question
                      title={$t(EditPropertyConfigMessages.BIND_PERSONA_GROUP_TOOLTIP)}
                      placement={'bottom'}
                    />
                  </>}
                  rules={[{ required: true }]}
                >
                  {personaGroupHasBound
                    ? <PersonaGroupLink
                      personaGroupId={selectedGroupId}
                      name={groupData?.name}
                    />
                    : <PersonaGroupSelect
                      filterProperty
                      whiteList={selectedGroupId ? [selectedGroupId] : []}
                    />
                  }
                </Form.Item>
                <Form.Item
                  noStyle
                  hidden={personaGroupHasBound}
                >
                  <Button
                    type={'link'}
                    size={'small'}
                    onClick={() => setPersonaGroupVisible(true)}
                  >
                    {$t({ defaultMessage: 'Add Persona Group' })}
                  </Button>
                </Form.Item>
                <Form.Item
                  hidden
                  name={['unitConfig', 'type']}
                />
                <StepsFormLegacy.FieldLabel width={'190px'}>
                  {$t({ defaultMessage: 'Enable Guest DPSK for Units' })}
                  <Form.Item
                    name={['unitConfig', 'guestAllowed']}
                    rules={[{ required: true }]}
                    valuePropName={'checked'}
                    children={<Switch disabled={hasUnits} />}
                  />
                </StepsFormLegacy.FieldLabel>
                <Form.Item
                  name='residentPortalType'
                  label={$t({ defaultMessage: 'Resident Portal' })}
                  rules={[{ required: true }]}
                  children={
                    <Select
                      disabled={hasUnits}
                      options={residentPortalTypeOptions}
                    />
                  }
                />
                {/* eslint-disable-next-line max-len */}
                {formRef?.current?.getFieldValue( 'residentPortalType') === ResidentPortalType.RUCKUS_PORTAL &&
                  <>
                    <Form.Item
                      name='residentPortalId'
                      label={$t({ defaultMessage: 'Resident Portal profile' })}
                      rules={[{ required: true }]}
                      children={
                        hasUnits
                          ? <ResidentPortalLink
                            id={formRef?.current?.getFieldValue('residentPortalId')}
                            name={residentPortalList?.data
                              ?.find(r => r.id === formRef?.current
                                ?.getFieldValue('residentPortalId'))?.name}
                          />
                          : <Select
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={residentPortalList?.data
                              .map(r => ({ value: r.id, label: r.name })) ?? []}
                          />
                      }
                    />
                    <Form.Item
                      noStyle
                      hidden={hasUnits}
                    >
                      <Button
                        type={'link'}
                        size={'small'}
                        onClick={() => setResidentPortalModalVisible(true)}
                      >
                        {$t({ defaultMessage: 'Add Resident Portal' })}
                      </Button>
                    </Form.Item>
                  </>
                }
                {/* eslint-disable-next-line max-len */}
                {formRef?.current?.getFieldValue( 'residentPortalType') === ResidentPortalType.OWN_PORTAL &&
                  <Form.Item
                    // Once the Resident Portal document ready, it needs to show the text
                    hidden
                    children={<Card type={'solid-bg'}>
                      <Space align='start'>
                        <InformationSolid />
                        {$t({
                          // eslint-disable-next-line max-len
                          defaultMessage: 'Please refer to the resident portal documentation for more information about how to set up your own portal via API'
                        })}
                      </Space>
                    </Card>}
                  />
                }

                {msgTemplateEnabled &&
                  <>
                    <Form.Item
                      hidden
                      name={['communicationConfig', 'type']}/>
                    <Subtitle level={4} style={{ paddingTop: '8px' }}>
                      {$t({ defaultMessage: 'Communication Templates' })}
                    </Subtitle>
                    <StepsFormLegacy.FieldLabel width={'190px'}>
                      {$t({ defaultMessage: 'Enable Email Notification' })}
                      <Form.Item
                        name={['communicationConfig', 'sendEmail']}
                        rules={[{ required: true }]}
                        valuePropName={'checked'}
                        children={<Switch/>}/>
                    </StepsFormLegacy.FieldLabel>
                    <StepsFormLegacy.FieldLabel width={'190px'}>
                      {$t({ defaultMessage: 'Enable SMS Notification' })}
                      <Form.Item
                        name={['communicationConfig', 'sendSms']}
                        rules={[{ required: true }]}
                        valuePropName={'checked'}
                        children={<Switch/>}/>
                    </StepsFormLegacy.FieldLabel>
                    <Tabs
                      defaultActiveKey={'email'}
                    >
                      <Tabs.TabPane
                        forceRender
                        key={'email'}
                        tab={$t({ defaultMessage: 'Email' })}
                        children={templateScopeIds.email.map(id => venueId &&
                        <TemplateSelector
                          key={id}
                          formItemProps={{ name: id }}
                          scopeId={id}
                          registrationId={venueId}
                        />)}
                      />
                      <Tabs.TabPane
                        forceRender
                        key={'sms'}
                        tab={$t({ defaultMessage: 'SMS' })}
                        children={templateScopeIds.sms.map(id => venueId &&
                        <TemplateSelector
                          key={id}
                          formItemProps={{ name: id }}
                          scopeId={id}
                          registrationId={venueId}
                        />)}
                      />
                    </Tabs>
                  </>
                }
              </Col>
            </Row>
          }
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>

      <PersonaGroupDrawer
        isEdit={false}
        visible={personaGroupVisible}
        onClose={(result) => {
          if (result) {
            formRef?.current?.setFieldValue('personaGroupId', result?.id)
          }
          setPersonaGroupVisible(false)
        }}
      />

      <Modal
        title={$t({ defaultMessage: 'Add Resident Portal service' })}
        type={ModalType.ModalStepsForm}
        visible={residentPortalModalVisible}
        children={<ResidentPortalForm
          modalMode
          modalCallBack={(result?: string) => {
            if (result) {
              formRef?.current?.setFieldValue('residentPortalId', result?.split('/')?.pop())
            }
            onResidentPortalModalClose()
          }}
        />}
        onCancel={onResidentPortalModalClose}
        width={1200}
        destroyOnClose={true}
      />
    </Loader>
  )
}

function ResidentPortalLink (props: { id?: string, name?: string }) {
  const { id, name } = props
  return (
    <TenantLink to={getServiceDetailsLink({
      type: ServiceType.RESIDENT_PORTAL,
      oper: ServiceOperation.DETAIL,
      serviceId: id!
    })}>
      {name ?? id}
    </TenantLink>
  )
}
