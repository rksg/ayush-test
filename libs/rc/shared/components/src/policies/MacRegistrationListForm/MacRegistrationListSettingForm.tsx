import React, { useState } from 'react'

import { Form, Input, Select, Switch, Space, Button } from 'antd'
import { useIntl }                                    from 'react-intl'

import { GridRow, GridCol, Modal, ModalType, SelectionControl }   from '@acx-ui/components'
import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import {
  useAdaptivePolicySetListByQueryQuery, useGetPersonaGroupByIdQuery,
  useLazySearchMacRegListsQuery, useSearchPersonaGroupListQuery
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  getPolicyAllowedOperation,
  Persona, PolicyOperation, PolicyType,
  trailingNorLeadingSpaces
} from '@acx-ui/rc/utils'
import { useParams }                      from '@acx-ui/react-router-dom'
import { RolesEnum }                      from '@acx-ui/types'
import { hasAllowedOperations, hasRoles } from '@acx-ui/user'

import { AdaptivePolicySetForm }                                         from '../../AdaptivePolicySetForm'
import { ExpirationDateSelector }                                        from '../../ExpirationDateSelector'
import { hasCreateIdentityPermission, hasCreateIdentityGroupPermission } from '../../useIdentityGroupUtils'
import { PersonaDrawer }                                                 from '../../users'
import { IdentityGroupForm }                                             from '../../users/IdentityGroupForm'

export function MacRegistrationListSettingForm ({ editMode = false }) {
  const { $t } = useIntl()
  const [ macRegList ] = useLazySearchMacRegListsQuery()
  const { policyId } = useParams()
  const policySetId = Form.useWatch('policySetId')
  const identityGroupId = Form.useWatch('identityGroupId')
  const isUseSingleIdentity = Form.useWatch('isUseSingleIdentity')
  const [policyModalVisible, setPolicyModalVisible] = useState(false)
  const form = Form.useFormInstance()

  const isIdentityRequired = useIsSplitOn(Features.MAC_REGISTRATION_REQUIRE_IDENTITY_GROUP_TOGGLE)

  const { data: policySetsData } = useAdaptivePolicySetListByQueryQuery(
    { payload: { page: 1, pageSize: '2000' } })

  const { data: identityGroupList } = useSearchPersonaGroupListQuery({
    payload: { page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC' } })

  const [identityDrawerState, setIdentityDrawerState] = useState({
    visible: false,
    data: {} as Persona | undefined
  })

  const [identityGroupModelVisible, setIdentityGroupModelVisible] = useState(false)

  const { data: personaGroupData } = useGetPersonaGroupByIdQuery(
    // eslint-disable-next-line max-len
    { params: { groupId: identityGroupId } },
    { skip: !identityGroupId }
  )

  const nameValidator = async (value: string) => {
    const list = (await macRegList({
      params: { policyId },
      payload: {
        page: 1, pageSize: 10,
        dataOption: 'all',
        searchCriteriaList: [
          {
            filterKey: 'name',
            operation: 'eq',
            value: value
          }
        ]
      }
    }).unwrap()).data.filter(n => n.id !== policyId)
      .map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Mac Registration List' }))
  }

  return (
    <>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <Form.Item name='name'
            label={$t({ defaultMessage: 'Name' })}
            rules={[
              { required: true },
              { max: 255 },
              { validator: (_, value) => nameValidator(value) },
              { validator: (_, value) => trailingNorLeadingSpaces(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input/>}
            validateTrigger={'onBlur'}
          />
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <ExpirationDateSelector
            inputName={'expiration'}
            label={$t({ defaultMessage: 'List Expiration' })}
          />
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <Form.Item name='autoCleanup'
            valuePropName='checked'
            initialValue={true}
            label={$t({ defaultMessage: 'Automatically clean expired entries' })}>
            <Switch/>
          </Form.Item>
        </GridCol>
      </GridRow>
      { isIdentityRequired &&
        <>
          <GridRow>
            <GridCol col={{ span: 10 }}>
              <Form.Item name='identityGroupId'
                label={$t({ defaultMessage: 'Identity Group' })}
                rules={[
                  { required: true },
                  { message: $t({ defaultMessage: 'Please select Identity Group' }) }
                ]}
                children={
                  <Select
                    disabled={editMode}
                    placeholder={$t({ defaultMessage: 'Select ...' })}
                    options={
                      identityGroupList?.data
                        .filter(group => editMode ? group : !group.macRegistrationPoolId)
                        .map(group => ({ value: group.id, label: group.name }))}
                  />
                }
              />
            </GridCol>
            {
              (!editMode && hasCreateIdentityGroupPermission()) &&
          <>
            <Space align='center'>
              <Button
                type='link'
                onClick={async () => {
                  setIdentityGroupModelVisible(true)
                  // setIdentityGroupDrawerState({ visible: true, data: undefined })
                }}
              >
                {$t({ defaultMessage: 'Add' })}
              </Button>
            </Space >
            <Modal
              title={$t({ defaultMessage: 'Add Identity Group' })}
              visible={identityGroupModelVisible}
              type={ModalType.ModalStepsForm}
              children={<IdentityGroupForm
                callback={(identityGroupId?: string) => {
                  if (identityGroupId) {
                    form.setFieldValue('identityGroupId', identityGroupId)
                  }
                  setIdentityGroupModelVisible(false)
                }}
              />}
              onCancel={() => setIdentityGroupModelVisible(false)}
              width={1200}
              destroyOnClose={true}
            />
          </>
            }
          </GridRow>
          <GridRow>
            <GridCol col={{ span: 10 }}>
              <Form.Item name='isUseSingleIdentity'
                valuePropName='checked'
                initialValue={false}
                label={$t({ defaultMessage: 'Use Single Identity for all connections' })}>
                <Switch disabled={!identityGroupId}/>
              </Form.Item>
            </GridCol>
          </GridRow>
          {isUseSingleIdentity &&
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <Form.Item
            name='identityId'
            label={$t({ defaultMessage: 'Identity' })}
            rules={[
              { required: isUseSingleIdentity },
              { message: $t({ defaultMessage: 'Please select Identity' }) }
            ]}
          >
            <Select
              placeholder={$t({ defaultMessage: 'Choose ...' })}
              options={
                // eslint-disable-next-line max-len
                personaGroupData?.identities?.filter(identity => !identity.revoked).map(identity => ({ value: identity.id, label: identity.name }))}
            />
          </Form.Item>
        </GridCol>
        {
          hasCreateIdentityPermission() &&
          <Space align='center'>
            <Button
              type='link'
              onClick={async () => {
                setIdentityDrawerState({ visible: true,
                  // eslint-disable-next-line max-len
                  data: { groupId: identityGroupId } as Persona })
              }}
            >
              {$t({ defaultMessage: 'Add' })}
            </Button>
            <PersonaDrawer
              data={identityDrawerState.data}
              isEdit={false}
              visible={identityDrawerState.visible}
              onClose={(result) => {
                if (result?.id) {
                  form.setFieldValue('identityId', result?.id)
                }
                setIdentityDrawerState({ visible: false, data: undefined })
              }} />
          </Space>
        }
      </GridRow>
          }
        </>
      }
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <Form.Item name='policySetId'
            label={$t({ defaultMessage: 'Adaptive Policy Set' })}
            rules={[
              { message: $t({ defaultMessage: 'Please select Adaptive Policy Set' }) }
            ]}
            children={
              <Select
                allowClear
                placeholder={$t({ defaultMessage: 'Select ...' })}
                options={
                  policySetsData?.data.map(set => ({ value: set.id, label: set.name }))}
              />
            }
          />
        </GridCol>
        {
          (hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]) &&
          // eslint-disable-next-line max-len
          hasAllowedOperations(getPolicyAllowedOperation(PolicyType.ADAPTIVE_POLICY_SET, PolicyOperation.CREATE) ?? [])) &&
          <>
            <Space align='center'>
              <Button
                type='link'
                onClick={async () => {
                  setPolicyModalVisible(true)
                }}
              >
                {$t({ defaultMessage: 'Add' })}
              </Button>
            </Space >
            <Modal
              title={$t({ defaultMessage: 'Add Adaptive Policy Set' })}
              visible={policyModalVisible}
              type={ModalType.ModalStepsForm}
              children={<AdaptivePolicySetForm
                modalMode
                modalCallBack={(addedPolicySetId?: string) => {
                  if (addedPolicySetId) {
                    form.setFieldValue('policySetId', addedPolicySetId)
                  }
                  setPolicyModalVisible(false)
                }}
              />}
              onCancel={() => setPolicyModalVisible(false)}
              width={1200}
              destroyOnClose={true}
            />
          </>
        }
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          {policySetId &&
          <Form.Item name='defaultAccess'
            label={$t({ defaultMessage: 'Default Access' })}
            initialValue='ACCEPT'>
            <SelectionControl
              options={[{ value: 'ACCEPT', label: $t({ defaultMessage: 'ACCEPT' }) },
                { value: 'REJECT', label: $t({ defaultMessage: 'REJECT' }) }]}
            />
          </Form.Item>
          }
        </GridCol>
      </GridRow>
    </>
  )
}
