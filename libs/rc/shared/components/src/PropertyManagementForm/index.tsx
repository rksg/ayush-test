import { useEffect, useMemo, useState } from 'react'

import { FetchBaseQueryError }                                                    from '@reduxjs/toolkit/dist/query'
import { Col, Form, FormInstance, Input, Row, Select, Space, Switch, Typography } from 'antd'
import { useIntl }                                                                from 'react-intl'
import { useParams }                                                              from 'react-router-dom'

import { Button, Card, Loader, StepsForm, Subtitle, Tooltip } from '@acx-ui/components'
import { Features, useIsTierAllowed }                         from '@acx-ui/feature-toggle'
import { InformationSolid }                                   from '@acx-ui/icons'
import {
  useGetPersonaGroupByIdQuery,
  useGetPropertyConfigsQuery,
  useGetPropertyUnitListQuery,
  useGetResidentPortalListQuery,
  useGetVenueQuery,
  usePatchPropertyConfigsMutation,
  usePutRegistrationByIdMutation,
  useUpdatePropertyConfigsMutation
} from '@acx-ui/rc/services'
import {
  AssociatedResource,
  EditPropertyConfigMessages,
  hasServicePermission,
  PropertyConfigs,
  PropertyConfigStatus,
  ResidentPortalType,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { hasCrossVenuesPermission } from '@acx-ui/user'

import { IdentityGroupLink, ResidentPortalLink }  from '../CommonLinkHelper'
import { TemplateSelector }                       from '../TemplateSelector'
import { PersonaGroupDrawer, PersonaGroupSelect } from '../users'

import { AddResidentPortalModal }            from './AddResidentPortalModal'
import { showDeletePropertyManagementModal } from './DeletePropertyManagementModal'


interface PropertyManagementFormProps {
  venueId: string
  onFinish?: (values: PropertyConfigs) => Promise<boolean | void>
  onCancel?: () => void
  onValueChange?: () => void
  isSubmitting?: boolean
  submitButtonLabel?: string
  form?: FormInstance
  preSubmit?: () => void
  postSubmit?: () => void
}

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

const msgCategoryIds = [
  // Unit assigned
  '96672ee0-86df-4819-bca4-3b39ef611e37',
  // Guest Passphrase Reset
  '8817c288-7e8e-4125-8a73-531c205a9e16',
  // Port Assigned
  '4bdc8eb0-864a-4c7d-b99c-157a59520796',
  // Access Reset
  '08c28d2d-5ceb-4b5d-adc4-2c0fb744517e'
]

export const PropertyManagementForm = (props: PropertyManagementFormProps) => {

  const {
    form: customForm, venueId, onFinish, onCancel,
    onValueChange, isSubmitting, submitButtonLabel,
    preSubmit, postSubmit
  } = props
  const { tenantId } = useParams()
  const { $t } = useIntl()
  const [form] = Form.useForm(customForm)
  const msgTemplateEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

  const [isPropertyEnable, setIsPropertyEnable] = useState<boolean>(false)
  const [personaGroupVisible, setPersonaGroupVisible] = useState(false)
  const [residentPortalModalVisible, setResidentPortalModalVisible] = useState(false)
  const [initialValues, setInitialValues] = useState<PropertyConfigs>(defaultPropertyConfigs)
  const personaGroupId = Form.useWatch('personaGroupId', form)
  const residentPortalType = Form.useWatch('residentPortalType', form)
  const residentPortalId = Form.useWatch('residentPortalId', form)
  const hasAddPersonaGroupPermission = hasCrossVenuesPermission({ needGlobalPermission: true })
  const hasAddResidentPortalPermission = hasServicePermission({
    type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.CREATE
  })

  const { data: venueData } = useGetVenueQuery({ params: { tenantId, venueId } })
  const propertyConfigsQuery = useGetPropertyConfigsQuery(
    { params: { venueId } },
    { skip: !venueId }
  )
  const propertyNotFound = useMemo(() =>
    (propertyConfigsQuery?.error as FetchBaseQueryError)?.status === 404,
  [propertyConfigsQuery.error]
  )
  const { data: propertyConfigs } = propertyConfigsQuery
  const { hasUnits } = useGetPropertyUnitListQuery({
    params: { venueId },
    payload: {
      page: 1,
      pageSize: 10,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  },{
    skip: !venueId,
    selectFromResult: ({ data }) => {
      return {
        hasUnits: (data?.totalCount ?? -1) > 0
      }
    }
  })
  const { data: personaGroup } = useGetPersonaGroupByIdQuery(
    { params: { groupId: propertyConfigs?.personaGroupId } },
    { skip: !propertyConfigs?.personaGroupId }
  )
  const { data: residentPortalList } = useGetResidentPortalListQuery({
    payload: { page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC' }
  })
  const [updateRegistration, registrationResult] = usePutRegistrationByIdMutation()
  const [updatePropertyConfigs] = useUpdatePropertyConfigsMutation()
  const [patchPropertyConfigs] = usePatchPropertyConfigsMutation()

  const personaGroupHasBound = personaGroupId && hasUnits

  useEffect(() => {
    if (propertyConfigsQuery.isLoading || !propertyConfigsQuery.data) return
    let residentPortalType = ResidentPortalType.NO_PORTAL
    let enabled

    // If the user disable the Property, it will get 404 for this venue.
    // Therefore, we need to assign to `false` manually to prevent cache issue.
    if ((propertyConfigsQuery?.error as FetchBaseQueryError)?.status === 404) {
      enabled = false
    } else {
      enabled = propertyConfigsQuery.data?.status === PropertyConfigStatus.ENABLED
      const {
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
      setInitialValues({
        ...defaultPropertyConfigs,
        ...propertyConfigsQuery.data,
        residentPortalType
      })
    }
    setIsPropertyEnable(enabled)
  }, [propertyConfigsQuery.data])

  useEffect(() => {
    form.resetFields()
  }, [initialValues])

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

  const registerMessageTemplates = async () => {
    const registerPromises = [...msgCategoryIds]
      // eslint-disable-next-line
      .flatMap((msgCategoryId):Promise<any>[] => {
        let selectedOption = form.getFieldValue(msgCategoryId)

        if(!selectedOption || selectedOption === '') {
          return [Promise.resolve()]
        }

        // 1 - emailTemplateScopeId 2 - g.emailTemplateId 3 - smsTemplateScopeId 4- g.smsTemplateId,
        let idArray = selectedOption.split(',')

        if(idArray.length < 4) {
          return [Promise.resolve()]
        }

        return [
          // email
          updateRegistration({
            params: {
              templateScopeId: idArray[0],
              associatedResource: AssociatedResource.VENUE,
              associatedResourceId: venueId,
              registrationId: venueId
            },
            payload: {
              id: venueId,
              templateId: idArray[1],
              usageLocalizationKey: 'venue.property.management',
              usageDescriptionFieldOne: venueData?.name ?? venueId,
              usageDescriptionFieldTwo: venueId
            }
          }),
          // sms
          updateRegistration({
            params: {
              templateScopeId: idArray[2],
              associatedResource: AssociatedResource.VENUE,
              associatedResourceId: venueId,
              registrationId: venueId
            },
            payload: {
              id: venueId,
              templateId: idArray[3],
              usageLocalizationKey: 'venue.property.management',
              usageDescriptionFieldOne: venueData?.name ?? venueId,
              usageDescriptionFieldTwo: venueId
            }
          })]

      })

    await Promise.all(registerPromises)
  }

  const onFormFinish = async (values: PropertyConfigs) => {
    const {
      unitConfig,
      residentPortalType,
      communicationConfig,
      ...formValues
    } = values

    preSubmit?.()

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
              ...toResidentPortalPayload(residentPortalType as ResidentPortalType)
            },
            communicationConfig: {
              ...communicationConfig,
              // these values must match the registration id in th TemplateSelector form items
              unitAssignmentHtmlRegId: venueId,
              unitAssignmentTextRegId: venueId,
              unitPassphraseChangeHtmlRegId: venueId,
              unitPassphraseChangeTextRegId: venueId,
              guestPassphraseChangeHtmlRegId: venueId,
              guestPassphraseChangeTextRegId: venueId,
              portalAccessResetHtmlRegId: venueId,
              portalAccessResetTextRegId: venueId,
              portAssignmentHtmlRegId: venueId,
              portAssignmentTextRegId: venueId
            }
          }
        }).unwrap()
      } else {
        // if property not found, we could not send PUT request to modify the property entity.
        if (propertyNotFound) return
        await patchPropertyConfigs({
          params: { venueId },
          payload: { status: PropertyConfigStatus.DISABLED }
        }).unwrap()
      }
      postSubmit?.()
    } catch (e) {
      console.log(e) // eslint-disable-line no-console
    }
  }

  const handlePropertyEnable = (enabled: boolean) => {
    if (!enabled) {
      showDeletePropertyManagementModal(() => setIsPropertyEnable(false), 'Delete')
    } else {
      setIsPropertyEnable(enabled)
    }
  }

  const onResidentPortalModalClose = () => {
    setResidentPortalModalVisible(false)
  }

  return (
    <Loader
      states={[
        { ...propertyConfigsQuery, error: undefined },
        { isLoading: false, isFetching: isSubmitting || registrationResult.isLoading }
      ]}
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
      <StepsForm
        form={form}
        onFinish={onFinish || onFormFinish}
        onValuesChange={onValueChange}
        onCancel={onCancel}
        buttonLabel={{ submit: submitButtonLabel || $t({ defaultMessage: 'Save' }) }}
        initialValues={initialValues}
      >
        <StepsForm.StepForm>
          {isPropertyEnable &&
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item
                  name='personaGroupId'
                  label={
                    <>
                      {$t({ defaultMessage: 'Identity Group' })}
                      <Tooltip.Question
                        title={$t(EditPropertyConfigMessages.BIND_IDENTITY_GROUP_TOOLTIP)}
                        placement={'bottom'}
                      />
                    </>
                  }
                  rules={[{ required: true }]}
                >
                  {
                    personaGroupHasBound
                      ? <IdentityGroupLink
                        personaGroupId={propertyConfigs?.personaGroupId}
                        name={personaGroup?.name}
                      />
                      : <PersonaGroupSelect
                        filterProperty
                        whiteList={
                          propertyConfigs?.personaGroupId ?
                            [propertyConfigs?.personaGroupId] :
                            []
                        }
                      />
                  }
                </Form.Item>

                {hasAddPersonaGroupPermission &&
                  <Form.Item
                    noStyle
                    hidden={personaGroupHasBound}
                  >
                    <Button
                      type={'link'}
                      size={'small'}
                      onClick={() => setPersonaGroupVisible(true)}
                    >
                      {$t({ defaultMessage: 'Add Identity Group' })}
                    </Button>
                  </Form.Item>
                }

                <Form.Item noStyle name={['unitConfig', 'type']}>
                  <Input type='hidden' />
                </Form.Item>

                <StepsForm.FieldLabel width={'190px'}>
                  {$t({ defaultMessage: 'Enable Guest DPSK for Units' })}
                  <Form.Item
                    name={['unitConfig', 'guestAllowed']}
                    rules={[{ required: true }]}
                    valuePropName={'checked'}
                    children={<Switch disabled={hasUnits} />}
                  />
                </StepsForm.FieldLabel>
                <Form.Item
                  name='residentPortalType'
                  label={$t({ defaultMessage: 'Resident Portal' })}
                  rules={[{ required: true }]}
                  children={
                    <Select
                      disabled={hasUnits
                        && initialValues.residentPortalType !== ResidentPortalType.NO_PORTAL}
                      options={residentPortalTypeOptions}
                    />
                  }
                />
                {
                  residentPortalType === ResidentPortalType.RUCKUS_PORTAL &&
                  <>
                    <Form.Item
                      name='residentPortalId'
                      label={$t({ defaultMessage: 'Resident Portal profile' })}
                      rules={[{ required: true }]}
                      children={
                        hasUnits
                        && initialValues.residentPortalType === ResidentPortalType.RUCKUS_PORTAL
                          ? <ResidentPortalLink
                            id={residentPortalId}
                            name={residentPortalList?.data
                              ?.find(r => r.id === residentPortalId)?.name}
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
                    {hasAddResidentPortalPermission &&
                      <Form.Item
                        noStyle
                        hidden={hasUnits
                          && initialValues.residentPortalType === ResidentPortalType.RUCKUS_PORTAL}
                      >
                        <Button
                          type={'link'}
                          size={'small'}
                          onClick={() => setResidentPortalModalVisible(true)}
                        >
                          {$t({ defaultMessage: 'Add Resident Portal' })}
                        </Button>
                      </Form.Item>
                    }
                  </>
                }
                {
                  residentPortalType === ResidentPortalType.OWN_PORTAL &&
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

                {
                  msgTemplateEnabled &&
                  <>
                    <Form.Item
                      noStyle
                      name={['communicationConfig', 'type']}
                    >
                      <Input type='hidden' />
                    </Form.Item>
                    <Subtitle level={4} style={{ paddingTop: '8px' }}>
                      {$t({ defaultMessage: 'Communication Templates' })}
                    </Subtitle>
                    <StepsForm.FieldLabel width={'190px'}>
                      {$t({ defaultMessage: 'Enable Email Notification' })}
                      <Form.Item
                        name={['communicationConfig', 'sendEmail']}
                        rules={[{ required: true }]}
                        valuePropName={'checked'}
                        children={<Switch/>}/>
                    </StepsForm.FieldLabel>
                    <StepsForm.FieldLabel width={'190px'}>
                      {$t({ defaultMessage: 'Enable SMS Notification' })}
                      <Form.Item
                        name={['communicationConfig', 'sendSms']}
                        rules={[{ required: true }]}
                        valuePropName={'checked'}
                        children={<Switch/>}/>
                    </StepsForm.FieldLabel>
                    {msgCategoryIds.map(categoryId => venueId &&
                        <TemplateSelector
                          key={categoryId}
                          formItemProps={{ name: categoryId }}
                          categoryId={categoryId}
                          emailRegistrationId={venueId}
                          smsRegistrationId={venueId}
                        />)}
                  </>
                }
              </Col>
            </Row>
          }
        </StepsForm.StepForm>
      </StepsForm>
      <PersonaGroupDrawer
        requiredDpsk
        isEdit={false}
        visible={personaGroupVisible}
        onClose={(result) => {
          if (result) {
            form.setFieldValue('personaGroupId', result?.id)
          }
          setPersonaGroupVisible(false)
        }}
      />
      <AddResidentPortalModal
        visible={residentPortalModalVisible}
        setVisible={setResidentPortalModalVisible}
        form={form}
        onCancel={onResidentPortalModalClose}
      />
    </Loader>
  )
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
