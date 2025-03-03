import React, { useEffect, useState } from 'react'

import { Button, Form, Input, Space } from 'antd'
import { useIntl }                    from 'react-intl'

import { GridCol, GridRow, Modal, ModalType, Select, SelectionControl }                                       from '@acx-ui/components'
import { useAdaptivePolicySetListQuery, useLazyGetCertificateTemplatesQuery, useSearchPersonaGroupListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  PersonaGroup, RulesManagementUrlsInfo,
  trailingNorLeadingSpaces
} from '@acx-ui/rc/utils';
import { useParams } from '@acx-ui/react-router-dom'
import { RolesEnum } from '@acx-ui/types'
import { hasAllowedOperations, hasRoles } from '@acx-ui/user';

import { AdaptivePolicySetForm }            from '../../../AdaptivePolicySetForm'
import { hasCreateIdentityGroupPermission } from '../../../useIdentityGroupUtils'
import { PersonaGroupDrawer }               from '../../../users'
import { MAX_CERTIFICATE_PER_TENANT }       from '../constants'
import { onboardSettingsDescription }       from '../contentsMap'
import { Section, Title }                   from '../styledComponents'
import { getOpsApi } from '@acx-ui/utils';

export default function OnboardForm ({ editMode = false }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [getCertificateTemplateList] = useLazyGetCertificateTemplatesQuery()
  const { policyId } = useParams()
  const policySetId = Form.useWatch('policySetId')
  const identityGroupId = Form.useWatch('identityGroupId')
  const { data: policySetsData } = useAdaptivePolicySetListQuery(
    { payload: { page: 1, pageSize: '2147483647' } })
  const { data: identityGroupList } = useSearchPersonaGroupListQuery({
    payload: { page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC' } })

  const [identityGroupDrawerState, setIdentityGroupDrawerState] = useState({
    visible: false,
    data: {} as PersonaGroup | undefined
  })

  const [policyModalVisible, setPolicyModalVisible] = useState(false)

  useEffect(() => {
    if (policySetId) {
      form.setFieldValue('policySetName',
        policySetsData?.data.find(set => set.id === policySetId)?.name)
    } else {
      form.setFieldValue('policySetName', '')
    }
  }, [policySetId])

  useEffect(() => {
    if (identityGroupId) {
      form.setFieldValue('identityGroupName',
        identityGroupList?.data.find(set => set.id === identityGroupId)?.name)
    } else {
      form.setFieldValue('identityGroupName', '')
    }
  }, [identityGroupId])

  const nameValidator = async (value: string) => {
    try {
      const list = (await getCertificateTemplateList({
        payload:
          {
            page: 1,
            pageSize: MAX_CERTIFICATE_PER_TENANT,
            searchTargetFields: ['name'],
            searchString: value
          }
      }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))
      return checkObjectNotExists(list, { name: value },
        $t({ defaultMessage: 'Certificate Template' }))
    } catch {
      return Promise.reject($t({ defaultMessage: 'Validation error' }))
    }
  }

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <Title>{$t({ defaultMessage: 'Template Details' })}</Title>
      </div>
      <Section>
        <GridRow>
          <GridCol col={{ span: 10 }}>
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Certificate Template Name' })}
              rules={[
                { required: true },
                { min: 2 },
                { max: 32 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
                { validator: (_, value) => nameValidator(value) }
              ]}
              validateTrigger={'onBlur'}
              validateFirst
            >
              <Input placeholder='BYOD Template' />
            </Form.Item>
            <Form.Item
              name={['onboard', 'commonNamePattern']}
              label={$t({ defaultMessage: 'Common Name' })}
              extra={$t(onboardSettingsDescription.CERTIFICATE_TEMPLATE_NAME)}
              rules={[
                { required: true },
                { min: 2 },
                { max: 32 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
              validateTrigger={'onBlur'}
              validateFirst>
              <Input placeholder='${USERNAME}@byod.company.com' />
            </Form.Item>
          </GridCol>
        </GridRow>
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
                      .filter(group => editMode ? group : !group.certificateTemplateId)
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
                    setIdentityGroupDrawerState({ visible: true, data: undefined })
                  }}
                >
                  {$t({ defaultMessage: 'Add' })}
                </Button>
              </Space >
              <PersonaGroupDrawer
                data={identityGroupDrawerState.data}
                isEdit={false}
                visible={identityGroupDrawerState.visible}
                onClose={(result) => {
                  if (result) {
                    form.setFieldValue('identityGroupId', result?.id)
                  }
                  setIdentityGroupDrawerState({ visible: false, data: undefined })
                }} />
            </>
          }
        </GridRow>
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
              hasAllowedOperations([getOpsApi(RulesManagementUrlsInfo.createPolicySet)])) &&
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
        <GridCol col={{ span: 10 }}>
          {policySetId &&
            <Form.Item name='defaultAccess'
              label={$t({ defaultMessage: 'Default Access' })}
              initialValue={'true'}>
              <SelectionControl
                options={[
                  { value: 'true', label: $t({ defaultMessage: 'ACCEPT' }) },
                  { value: 'false', label: $t({ defaultMessage: 'REJECT' }) }]}
              />
            </Form.Item>
          }
        </GridCol>
        <GridRow>
        </GridRow>
      </Section>
    </>
  )
}
