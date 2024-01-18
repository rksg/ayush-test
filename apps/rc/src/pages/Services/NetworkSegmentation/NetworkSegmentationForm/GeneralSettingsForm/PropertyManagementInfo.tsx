import { useEffect, useState } from 'react'

import { Form, Input }               from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Loader, StepsForm } from '@acx-ui/components'
import { IdentityGroupLink }         from '@acx-ui/rc/components'
import {
  useGetDpskQuery,
  useGetPersonaGroupByIdQuery,
  useGetPropertyConfigsQuery
} from '@acx-ui/rc/services'
import { DpskDetailsTabKey, DpskSaveData, PersonaGroup, ServiceOperation, ServiceType, getServiceDetailsLink } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                          from '@acx-ui/react-router-dom'

import * as UI from '../styledComponents'

import { PropertyManagementModal } from './PropertyManagementModal'
import { WarningMsg }              from './styledComponents'

interface PersonaGroupTableProps {
  venueId: string
  editMode?: boolean
}

export const PropertyManagementInfo = (props: PersonaGroupTableProps) => {

  const { venueId, editMode } = props
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [propertyManagementModalVisible, setPropertyManagementModalVisible] = useState(false)

  const {
    personaGroupId,
    isGetPropertyConfigError,
    isPropertyConfigLoading
  } = useGetPropertyConfigsQuery(
    { params: { venueId } },
    {
      skip: !!!venueId,
      selectFromResult: ({ data, isError, isLoading, isFetching }) => {
        return {
          personaGroupId: data?.personaGroupId,
          isGetPropertyConfigError: isError,
          isPropertyConfigLoading: isLoading || isFetching
        }
      }
    }
  )
  const {
    personaGroupData,
    isPersonaGroupLoading
  } = useGetPersonaGroupByIdQuery(
    { params: { groupId: personaGroupId } },
    {
      skip: !!!personaGroupId,
      selectFromResult: ({ data, isLoading, isFetching }) => {
        return {
          personaGroupData: data,
          isPersonaGroupLoading: isLoading || isFetching
        }
      }
    }
  )
  const {
    dpskData,
    isDpskLoading
  } = useGetDpskQuery(
    { params: { serviceId: personaGroupData?.dpskPoolId } },
    {
      skip: !!!personaGroupData?.dpskPoolId,
      selectFromResult: ({ data, isLoading, isFetching }) => {
        return {
          dpskData: data,
          isDpskLoading: isLoading || isFetching
        }
      }
    }
  )

  useEffect(() => {
    if(!editMode && personaGroupId) {
      form.setFieldValue('personaGroupId', isGetPropertyConfigError ? undefined : personaGroupId)
    }
  }, [personaGroupId, isGetPropertyConfigError])

  const hasPropertyConfig = personaGroupId && !isGetPropertyConfigError

  const openPropertyManagementModal = () => {
    setPropertyManagementModalVisible(true)
  }

  const warningMsg = <FormattedMessage
    defaultMessage={
      '<style>You must go to <link>Venue\'s property configuration page</link> ' +
      'to enable property management before creating Personal Identity.</style>'
    }
    values={{
      style: (content) => <WarningMsg>{content}</WarningMsg>,
      link: (content) => <Button
        type='link'
        size='small'
        onClick={openPropertyManagementModal}
      >
        {content}
      </Button>
    }}
  />

  return (
    <>
      <Loader states={[
        {
          isLoading: false,
          isFetching: isPropertyConfigLoading || isPersonaGroupLoading || isDpskLoading
        }
      ]}>
        <StepsForm.FieldLabel width={'140px'}>
          {$t({ defaultMessage: 'Property management:' })}
          <Form.Item
            children={
              <UI.FieldTitle>
                {
                  hasPropertyConfig ?
                    $t({ defaultMessage: 'On' }) :
                    $t({ defaultMessage: 'Off' })
                }
              </UI.FieldTitle>
            }
            style={{ marginBottom: 0 }}
          />
        </StepsForm.FieldLabel>
        {
          hasPropertyConfig ?
            <PersonaInfo
              personaGroupData={personaGroupData}
              dpskData={dpskData}
            /> :
            warningMsg
        }
      </Loader>
      <Form.Item
        name='personaGroupId'
        rules={[{ required: true }]}
        children={<Input hidden />}
        noStyle
      />
      <PropertyManagementModal
        venueId={venueId}
        venueName={form.getFieldValue('venueName')}
        visible={propertyManagementModalVisible}
        setVisible={setPropertyManagementModalVisible}
      />
    </>
  )
}

const PersonaInfo = ({
  personaGroupData,
  dpskData
}: {
  personaGroupData?: PersonaGroup,
  dpskData?: DpskSaveData
}) => {

  const { $t } = useIntl()

  return (
    <>
      <StepsForm.FieldLabel width={'140px'}>
        {$t({ defaultMessage: 'Persona Group:' })}
        <Form.Item
          children={
            <UI.FieldTitle>
              {
                <IdentityGroupLink
                  name={personaGroupData?.name}
                  personaGroupId={personaGroupData?.id}
                />
              }
            </UI.FieldTitle>
          }
          style={{ marginBottom: 0 }}
        />
      </StepsForm.FieldLabel>
      <StepsForm.FieldLabel width={'140px'}>
        {$t({ defaultMessage: 'Number of Personas:' })}
        <Form.Item
          children={
            <UI.FieldTitle>
              {
                personaGroupData?.identities?.length || 0
              }
            </UI.FieldTitle>
          }
          style={{ marginBottom: 0 }}
        />
      </StepsForm.FieldLabel>
      <StepsForm.FieldLabel width={'140px'}>
        {$t({ defaultMessage: 'DPSK Pool:' })}
        <Form.Item
          children={
            <UI.FieldTitle>
              {
                <TenantLink to={getServiceDetailsLink({
                  type: ServiceType.DPSK,
                  oper: ServiceOperation.DETAIL,
                  serviceId: dpskData?.id || '',
                  activeTab: DpskDetailsTabKey.OVERVIEW
                })}
                >
                  {dpskData?.name}
                </TenantLink>
              }
            </UI.FieldTitle>
          }
          style={{ marginBottom: 0 }}
        />
      </StepsForm.FieldLabel>
      <StepsForm.FieldLabel width={'140px'}>
        {$t({ defaultMessage: 'DPSK Network:' })}
        <Form.Item
          children={
            <UI.FieldTitle>
              {
                dpskData?.networkIds?.length || 0
              }
            </UI.FieldTitle>
          }
          style={{ marginBottom: 0 }}
        />
      </StepsForm.FieldLabel>
    </>
  )
}
