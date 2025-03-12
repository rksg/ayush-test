import { useState } from 'react'

import { Col, Form, FormInstance, Input, Row, Select, Space, Switch } from 'antd'
import { useIntl }                                                    from 'react-intl'

import { Button, Card, StepsForm, Subtitle, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }   from '@acx-ui/feature-toggle'
import { InformationSolid }                           from '@acx-ui/icons'
import {
  useGetPersonaGroupByIdQuery,
  useGetPropertyUnitListQuery,
  useGetResidentPortalListQuery
} from '@acx-ui/rc/services'
import {
  EditPropertyConfigMessages,
  hasServicePermission,
  PropertyConfigs,
  ResidentPortalType,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'

import { IdentityGroupLink, ResidentPortalLink }  from '../CommonLinkHelper'
import { TemplateSelector }                       from '../TemplateSelector'
import { hasCreateIdentityGroupPermission }       from '../useIdentityGroupUtils'
import { PersonaGroupDrawer, PersonaGroupSelect } from '../users'

import { AddResidentPortalModal }                       from './AddResidentPortalModal'
import { getResidentPortalTypeOptions, msgCategoryIds } from './utils'

export interface PropertyManagementFormProps {
  form: FormInstance
  venueId: string
  initialValues: PropertyConfigs
}

export const PropertyManagementForm = (props: PropertyManagementFormProps) => {
  const { form, venueId, initialValues } = props
  const { $t } = useIntl()
  const msgTemplateEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const dpskRequireIdentityGroupEnabled = useIsSplitOn(Features.DPSK_REQUIRE_IDENTITY_GROUP)
  const hasAddResidentPortalPermission = hasServicePermission({
    type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.CREATE
  })

  const [personaGroupVisible, setPersonaGroupVisible] = useState(false)
  const [residentPortalModalVisible, setResidentPortalModalVisible] = useState(false)

  const personaGroupId = Form.useWatch('personaGroupId', form)
  const residentPortalType = Form.useWatch('residentPortalType', form)
  const residentPortalId = Form.useWatch('residentPortalId', form)

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
    { params: { groupId: initialValues.personaGroupId } },
    { skip: !initialValues.personaGroupId }
  )
  const { data: residentPortalList } = useGetResidentPortalListQuery({
    payload: { page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC' }
  })

  const personaGroupHasBound = personaGroupId && hasUnits

  const onResidentPortalModalClose = () => {
    setResidentPortalModalVisible(false)
  }

  return <>
    <Row gutter={20}>
      <Col span={24}>
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
                personaGroupId={initialValues.personaGroupId}
                name={personaGroup?.name}
              />
              : <PersonaGroupSelect
                filterProperty
                whiteList={
                  initialValues.personaGroupId ?
                    [initialValues.personaGroupId] :
                    []
                }
              />
          }
        </Form.Item>
        { hasCreateIdentityGroupPermission() && !dpskRequireIdentityGroupEnabled &&
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
              options={getResidentPortalTypeOptions()}
            />
          }
        />
        {
          residentPortalType === ResidentPortalType.RUCKUS_PORTAL && <>
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
        { residentPortalType === ResidentPortalType.OWN_PORTAL &&
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

        {msgTemplateEnabled && <>
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
  </>
}
