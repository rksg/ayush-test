import { ReactNode, useEffect, useState } from 'react'

import { Button, Form, Input, Select, Switch } from 'antd'
import { useIntl }                             from 'react-intl'
import styled                                  from 'styled-components/macro'

import {
  GridCol,
  GridRow,
  Drawer,
  PageHeader,
  StepsForm } from '@acx-ui/components'
import {
  useGetLayer2AclsQuery,
  useAddSwitchAccessControlSetMutation,
  useGetSwitchAccessControlSetByIdQuery,
  useLazyGetSwitchAccessControlSetQuery,
  useUpdateSwitchAccessControlSetMutation
} from '@acx-ui/rc/services'
import {
  MacAcl,
  PolicyType,
  SwitchAccessControl,
  usePolicyListBreadcrumb } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { SwitchLayer2ACLForm } from './SwitchLayer2/SwitchLayer2ACLForm'

const AccessComponentWrapper = styled.div`
  display: grid;
  grid-template-columns: 50px 190px auto;
`

const FieldLabel = styled.div`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: 175px 1fr;
`

interface SwitchLayer2ACLFormProps {
  editMode: boolean
}

const payload ={
  fields: [
    'id',
    'name'
  ],
  page: 1,
  pageSize: 10000,
  defaultPageSize: 10000,
  total: 0,
  sortField: 'name',
  sortOrder: 'ASC'
}

const AclGridCol = ({ children }: { children: ReactNode }) => {
  return (
    <GridCol col={{ span: 6 }} style={{ marginTop: '6px' }}>
      {children}
    </GridCol>
  )
}

export const SwitchAccessControlSetForm = (props: SwitchLayer2ACLFormProps) => {
  const { editMode } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { accessControlId } = useParams()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerEditMode, setDrawerEditMode] = useState(false)
  const [layer2ProfileVisible, setLayer2ProfileVisible] = useState(false)
  const [layer2AclDrawerId, setLayer2AclDrawerId] = useState('')

  const switchAccessControlPage = '/policies/accessControl/switch'
  const switchAccessControlLink = useTenantLink(switchAccessControlPage)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SWITCH_ACCESS_CONTROL)
  breadcrumb[2].link = switchAccessControlPage
  const pageTitle = editMode ? $t({ defaultMessage: 'Edit Switch Access Control' }) :
    $t({ defaultMessage: 'Add Switch Access Control' })

  const [addAccessControl] = useAddSwitchAccessControlSetMutation()
  const [updateAccessControl] = useUpdateSwitchAccessControlSetMutation()
  const [getAccessControls] = useLazyGetSwitchAccessControlSetQuery()

  const { data: layer2ProfileList } = useGetLayer2AclsQuery(
    { payload }, { skip: !layer2ProfileVisible })

  const { data } = useGetSwitchAccessControlSetByIdQuery(
    { params: { accessControlId } }, { skip: !editMode })

  const layer2Toggle = Form.useWatch('layer2Toggle', form)
  const layer2AclPolicyId = Form.useWatch('layer2AclPolicyId', form)

  useEffect (() => {
    if(data){
      form.setFieldsValue(data)

      if(data?.layer2AclPolicyName){
        form.setFieldValue('layer2Toggle', true)
        setLayer2ProfileVisible(true)
      }
    }

    if(layer2ProfileList){
      if(data?.layer2AclPolicyName){
        form.setFieldValue('layer2AclPolicyId', layer2ProfileList?.data?.find(
          item => item.id === layer2AclPolicyId)?.id)
      }
    }
  }, [data, layer2ProfileList])

  const onCancel = () => {
    navigate(switchAccessControlLink, { replace: false })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateMacAclName = async (_: any, value: string) => {
    if (!value) return Promise.resolve()

    const response = await getAccessControls({
      payload: {
        ...payload,
        fields: [
          'id',
          'policyName'
        ],
        sortField: 'policyName',
        sortOrder: 'ASC',
        searchString: value,
        searchTargetFields: ['policyName']
      }
    }).unwrap()

    const existingACLs = response.data

    const duplicateACL = existingACLs.find(acl =>
      acl.accessControlPolicyName === value && (!editMode || acl.id !== accessControlId)
    )

    if (duplicateACL) {
      return Promise.reject($t({
        defaultMessage: 'MAC ACL name is duplicated.'
      }))
    }

    return Promise.resolve()
  }

  const handleFinish = async (data: SwitchAccessControl) => {
    const formValues = data

    const payload = {
      description: data.description,
      layer2AclName: layer2Toggle ? layer2ProfileList?.data?.filter(
        (acl: MacAcl) => acl.id === formValues.layer2AclPolicyId)[0].name : '',
      policyName: data.policyName
    }
    if (editMode) {
      await updateAccessControl({ params: { accessControlId }, payload }).unwrap()
    } else {
      await addAccessControl({ payload }).unwrap()
    }
    navigate(switchAccessControlLink, { replace: false })
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb} />
      <StepsForm
        form={form}
        editMode={editMode}
        onCancel={onCancel}
        onFinish={handleFinish}
      >
        <StepsForm.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <Form.Item
            name='policyName'
            label={$t({ defaultMessage: 'Policy Name' })}
            rules={[
              { required: true, message: 'Please enter Policy name' },
              { validator: validateMacAclName }
            ]}
            validateTrigger='onBlur'
          >
            <Input style={{ width: '400px' }} maxLength={255} disabled={editMode} />
          </Form.Item>
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            initialValue={''}
            rules={[
              { min: 1, transform: (value) => value.trim() },
              { max: 255, transform: (value) => value.trim() }
            ]}
            children={<Input.TextArea
              rows={4}
              maxLength={180}
              style={{ width: '400px' }}
            />}
          />
          <Form.Item
            name='accessControlComponent'
            label={$t({ defaultMessage: 'Access Control Components' })}
            children={
              <FieldLabel>
                {$t({ defaultMessage: 'Layer 2' })}
                <AccessComponentWrapper>
                  <Form.Item
                    name='layer2Toggle'
                    style={{ marginBottom: '10px' }}
                    valuePropName='checked'
                    initialValue={false}
                    children={<Switch onChange={(value) => setLayer2ProfileVisible(value)}/>}
                  />
                  {layer2ProfileVisible && <GridRow style={{ width: '350px' }}>
                    <GridCol col={{ span: 12 }}>
                      <Form.Item
                        name='layer2AclPolicyId'
                        rules={[{
                          required: true,
                          message: $t({ defaultMessage: 'Please select Layer 2 profile' })
                        }]}
                        children={
                          <Select
                            style={{ width: '150px' }}
                            placeholder={$t({ defaultMessage: 'Select profile...' })}
                            options={layer2ProfileList?.data?.map(
                              item => ({ label: item.name, value: item.id }))}
                          />
                        }
                      />
                    </GridCol>
                    <AclGridCol>
                      {/* {hasEditPermission && */}
                      <Button type='link'
                        disabled={!layer2AclPolicyId}
                        onClick={() => {
                          if (layer2AclPolicyId && layer2ProfileList?.data) {
                            setLayer2AclDrawerId(layer2ProfileList.data?.find(
                              (acl: MacAcl) => acl.id === layer2AclPolicyId)?.id ?? '')
                            setDrawerEditMode(true)
                            setDrawerVisible(true)
                          }
                        }
                        }>
                        {$t({ defaultMessage: 'Edit Details' })}
                      </Button>
                      {/* } */}
                    </AclGridCol>
                    <AclGridCol>
                      {/* {hasCreatePermission && */}
                      <Button type='link'
                        onClick={() => {
                          setLayer2AclDrawerId('')
                          setDrawerEditMode(false)
                          setDrawerVisible(true)
                        }}>
                        {$t({ defaultMessage: 'Add New' })}
                      </Button>
                      {/* } */}
                    </AclGridCol>
                  </GridRow>
                  }
                </AccessComponentWrapper>
              </FieldLabel>}
          />
        </StepsForm.StepForm>
      </StepsForm>
      {drawerVisible &&
      <Drawer
        title={drawerEditMode ? $t({ defaultMessage: 'Edit Layer 2 Settings' }) :
          $t({ defaultMessage: 'Add Layer 2 Settings' })}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={800}
        destroyOnClose={true}
      >
        <SwitchLayer2ACLForm
          editMode={drawerEditMode}
          layer2AclId={drawerEditMode ? layer2AclDrawerId : undefined}
          drawerOnClose={() => setDrawerVisible(false)}
        />
      </Drawer>
      }
    </>
  )
}
