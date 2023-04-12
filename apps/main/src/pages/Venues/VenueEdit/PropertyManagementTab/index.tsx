import { useContext, useEffect, useRef, useState } from 'react'

import { FetchBaseQueryError }            from '@reduxjs/toolkit/dist/query/react'
import { Col, Form, Row, Select, Switch } from 'antd'
import { FormFinishInfo }                 from 'rc-field-form/lib/FormContext'
import { useIntl }                        from 'react-intl'

import { Button, Loader, StepsForm, StepsFormInstance, Tabs } from '@acx-ui/components'
import { PersonaGroupSelect, TemplateSelector }               from '@acx-ui/rc/components'
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
import { PropertyConfigs, PropertyConfigStatus } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

// FIXME: move this component to common folder.
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PersonaGroupLink } from '../../../../../../rc/src/pages/Users/Persona/LinkHelper'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PersonaGroupDrawer } from '../../../../../../rc/src/pages/Users/Persona/PersonaGroupDrawer'
import { VenueEditContext }   from '../index'



const defaultPropertyConfigs: PropertyConfigs = {
  status: PropertyConfigStatus.DISABLED,
  unitConfig: {
    type: 'unitConfig',
    maxUnitCount: 0,
    useMaxUnitCount: false,
    guestAllowed: false,
    residentPortalAllowed: false
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
  const { data: venueData } = useGetVenueQuery({ params: { tenantId, venueId } })
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<PropertyConfigs>>()
  const { editContextData, setEditContextData } = useContext(VenueEditContext)
  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
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

  const { data: residentPortalList } = useGetResidentPortalListQuery({
    payload: { page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC' }
  })
  const [updatePropertyConfigs] = useUpdatePropertyConfigsMutation()
  const [patchPropertyConfigs] = usePatchPropertyConfigsMutation()

  useEffect(() => {
    if (propertyConfigsQuery.isLoading || !formRef.current || !propertyConfigsQuery.data) return
    let enabled

    // If the user disable the Property, it will get 404 for this venue.
    // Therefore, we need to assign to `false` manually to prevent cache issue.
    if ((propertyConfigsQuery?.error as FetchBaseQueryError)?.status === 404) {
      enabled = false
    } else {
      enabled = propertyConfigsQuery.data?.status === PropertyConfigStatus.ENABLED
      formRef?.current.setFieldsValue(propertyConfigsQuery.data)
    }
    formRef?.current.setFieldValue('isPropertyEnable', enabled)

    const groupId = propertyConfigsQuery.data?.personaGroupId
    if (groupId) {
      setSelectedGroupId(groupId)
      getPersonaGroupById({ params: { groupId } })
        .then(result => {
          setGroupData({ id: groupId, name: result.data?.name })
        })
    }
  }, [propertyConfigsQuery.data, formRef])

  const registerMessageTemplates = async () => {
    const registerPromises = [...templateScopeIds.email, ...templateScopeIds.sms]
      .map(scopeId => {
        let selectedOption = formRef?.current?.getFieldValue(scopeId)

        if(selectedOption && selectedOption.value !== '') {
          return updateRegistration({
            params: {
              templateScopeId: scopeId,
              registrationId: venueId
            },
            payload: {
              id: scopeId,
              templateId: selectedOption.value,
              usageLocalizationKey: 'venue.property.management'
            }
          })
        } else {
          return Promise.resolve()
        }
      })

    await Promise.all(registerPromises)
  }

  const onFormFinish = async (_: string, info: FormFinishInfo) => {
    const enableProperty = info.values.isPropertyEnable

    try {
      if (enableProperty) {
        await registerMessageTemplates()
        await updatePropertyConfigs({
          params: { venueId },
          payload: {
            ...info.values,
            venueName: venueData?.name ?? venueId,
            description: venueData?.description,
            address: venueData?.address,
            status: enableProperty
              ? PropertyConfigStatus.ENABLED
              : PropertyConfigStatus.DISABLED
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

  const handleFormChange = async () => {
    setEditContextData({
      ...editContextData,
      isDirty: true,
      tabTitle: $t({ defaultMessage: 'Property' }),
      updateChanges: () => formRef?.current?.submit()
    })
  }

  return (
    <Loader
      states={[
        { ...propertyConfigsQuery, error: undefined },
        { isLoading: false, isFetching: registrationResult.isLoading }
      ]}
    >
      <StepsForm
        formRef={formRef}
        onFormFinish={onFormFinish}
        onFormChange={handleFormChange}
        onCancel={() => navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
        })}
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm
          initialValues={defaultPropertyConfigs}
        >
          <StepsForm.FieldLabel width={'200px'}>
            {$t({ defaultMessage: 'Enable Property Management' })}
            <Form.Item
              name='isPropertyEnable'
              valuePropName={'checked'}
              children={<Switch />}
            />
          </StepsForm.FieldLabel>
          {formRef?.current?.getFieldValue('isPropertyEnable') &&
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item
                  name='personaGroupId'
                  label={$t({ defaultMessage: 'Persona Group' })}
                  rules={[{ required: true }]}
                >
                  {formRef?.current?.getFieldValue('personaGroupId') && hasUnits
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
                  hidden={(!!formRef?.current?.getFieldValue('personaGroupId') && hasUnits)}
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
                <StepsForm.FieldLabel width={'190px'}>
                  {$t({ defaultMessage: 'Enable Guest DPSK for Units' })}
                  <Form.Item
                    name={['unitConfig', 'guestAllowed']}
                    rules={[{ required: true }]}
                    valuePropName={'checked'}
                    children={<Switch />}
                  />
                </StepsForm.FieldLabel>
                <StepsForm.FieldLabel width={'190px'}>
                  {$t({ defaultMessage: 'Enable Resident Portal' })}
                  <Form.Item
                    name={['unitConfig', 'residentPortalAllowed']}
                    rules={[{ required: true }]}
                    valuePropName={'checked'}
                    children={<Switch />}
                  />
                </StepsForm.FieldLabel>
                {formRef?.current?.getFieldValue(['unitConfig', 'residentPortalAllowed']) &&
                    <Form.Item
                      name='residentPortalId'
                      label={$t({ defaultMessage: 'Resident Portal profile' })}
                      rules={[{ required: true }]}
                      children={<Select options={residentPortalList?.data
                        .map(r => ({ value: r.id, label: r.name })) ?? []}/>}
                    />
                }

                <Form.Item
                  hidden
                  name={['communicationConfig', 'type']}
                />
                <StepsForm.FieldLabel width={'190px'}>
                  {$t({ defaultMessage: 'Enable email notification' })}
                  <Form.Item
                    name={['communicationConfig', 'sendEmail']}
                    rules={[{ required: true }]}
                    valuePropName={'checked'}
                    children={<Switch />}
                  />
                </StepsForm.FieldLabel>
                <StepsForm.FieldLabel width={'190px'}>
                  {$t({ defaultMessage: 'Enable sms notification' })}
                  <Form.Item
                    name={['communicationConfig', 'sendSms']}
                    rules={[{ required: true }]}
                    valuePropName={'checked'}
                    children={<Switch />}
                  />
                </StepsForm.FieldLabel>

                <Tabs
                  defaultActiveKey={'email'}
                >
                  <Tabs.TabPane
                    forceRender
                    key={'email'}
                    tab={$t({ defaultMessage: 'Email' })}
                    children={templateScopeIds.email.map(id =>
                      venueId &&
                      <TemplateSelector
                        key={id}
                        formItemProps={{ name: id }}
                        scopeId={id}
                        registrationId={venueId}
                      />)
                    }
                  />
                  <Tabs.TabPane
                    forceRender
                    key={'sms'}
                    tab={$t({ defaultMessage: 'SMS' })}
                    children={templateScopeIds.sms.map(id =>
                      venueId &&
                      <TemplateSelector
                        key={id}
                        formItemProps={{ name: id }}
                        scopeId={id}
                        registrationId={venueId}
                      />)
                    }
                  />
                </Tabs>
              </Col>
            </Row>
          }
        </StepsForm.StepForm>
      </StepsForm>

      <PersonaGroupDrawer
        isEdit={false}
        visible={personaGroupVisible}
        onClose={() => setPersonaGroupVisible(false)}
      />
    </Loader>
  )
}
