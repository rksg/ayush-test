import { useContext, useEffect, useRef, useState } from 'react'

import { Checkbox, Col, Form, Row, Select, Space, Switch } from 'antd'
import { FormFinishInfo }                                  from 'rc-field-form/lib/FormContext'
import { useIntl }                                         from 'react-intl'

import { Button, Loader, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { PersonaGroupSelect }                           from '@acx-ui/rc/components'
import {
  useGetPropertyConfigsQuery,
  useGetResidentPortalListQuery,
  useGetVenueQuery,
  usePatchPropertyConfigsMutation,
  useUpdatePropertyConfigsMutation
} from '@acx-ui/rc/services'
import { PropertyConfigs, PropertyConfigStatus } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

// FIXME: move this component to common folder.
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
  communicationConfiguration: {
    sendEmail: false,
    sendSms: false
  }
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
  const [isPropertyEnable, setIsPropertyEnable] = useState(false)
  const [enableResidentPortal, setEnableResidentPortal] = useState(false)
  const [personaGroupVisible, setPersonaGroupVisible] = useState(false)
  const { data: residentPortalList } = useGetResidentPortalListQuery({})
  const [updatePropertyConfigs] = useUpdatePropertyConfigsMutation()
  const [patchPropertyConfigs] = usePatchPropertyConfigsMutation()

  useEffect(() => {
    if (propertyConfigsQuery.isLoading || !formRef.current) return
    const enabled = propertyConfigsQuery.data?.status === PropertyConfigStatus.ENABLED
    setIsPropertyEnable(enabled)
    formRef?.current?.setFieldValue('isPropertyEnable', enabled)
  }, [propertyConfigsQuery.data, formRef])

  const onFormFinish = async (_: string, info: FormFinishInfo) => {
    const enableProperty = info.values.isPropertyEnable

    try {
      if (enableProperty) {
        await updatePropertyConfigs({
          params: { venueId },
          payload: {
            ...info.values,
            venueName: venueData?.name ?? venueId,
            status: isPropertyEnable
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
      states={[{ ...propertyConfigsQuery, error: undefined }]}
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
          initialValues={{
            ...defaultPropertyConfigs,
            ...propertyConfigsQuery.data,
            isPropertyEnable
          }}
        >
          <StepsForm.FieldLabel width={'190px'}>
            {$t({ defaultMessage: 'Enable Property Management' })}
            <Form.Item
              name='isPropertyEnable'
              valuePropName={'checked'}
              children={<Switch onChange={setIsPropertyEnable}/>}
            />
          </StepsForm.FieldLabel>
          {isPropertyEnable &&
            <>
              <Row gutter={20}>
                <Col span={8}>
                  <Form.Item
                    name='personaGroupId'
                    label={$t({ defaultMessage: 'Persona Group' })}
                    rules={[{ required: true }]}
                  >
                    <PersonaGroupSelect />
                  </Form.Item>
                  <Form.Item noStyle>
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
                      children={<Switch
                        checked={enableResidentPortal}
                        onChange={setEnableResidentPortal}
                      />}
                    />
                  </StepsForm.FieldLabel>
                  {enableResidentPortal &&
                    <Form.Item
                      name='residentPortalId'
                      label={$t({ defaultMessage: 'Resident Portal profile' })}
                      rules={[{ required: true }]}
                      children={<Select options={residentPortalList?.data
                        .map(r => ({ value: r.id, label: r.name })) ?? []}/>}
                    />
                  }
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={8}>
                  {$t({ defaultMessage: 'Communication Templates:' })}
                  <Form.Item
                    label={$t({ defaultMessage: 'Send communications via...' })}
                  >
                    <Space direction={'vertical'}>
                      <Form.Item
                        noStyle
                        name={['communicationConfiguration', 'sendEmail']}
                        valuePropName={'checked'}
                      >
                        <Checkbox>{$t({ defaultMessage: 'Email' })}</Checkbox>
                      </Form.Item>
                      <Form.Item
                        noStyle
                        name={['communicationConfiguration', 'sendSms']}
                        valuePropName={'checked'}
                      >
                        <Checkbox>{$t({ defaultMessage: 'SMS' })}</Checkbox>
                      </Form.Item>
                    </Space>
                  </Form.Item>
                  <Form.Item
                    name={['communicationConfiguration', 'unitAssignmentTemplateId']}
                    label={$t({ defaultMessage: 'Onboarding Template' })}
                    // rules={[{ required: true }]}
                    children={<Select />}
                  />
                  <Form.Item
                    name={['communicationConfiguration', 'passphraseChangeTemplateId']}
                    label={$t({ defaultMessage: 'Passphrase Reset Template' })}
                    // rules={[{ required: true }]}
                    children={<Select />}
                  />
                </Col>
              </Row>
            </>
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
