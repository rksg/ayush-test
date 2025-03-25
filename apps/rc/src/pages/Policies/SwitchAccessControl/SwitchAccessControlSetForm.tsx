import { ReactNode, useEffect, useState } from 'react'

import { Button, Form, Input, Select, Switch } from 'antd'
import { useIntl }                             from 'react-intl'
import styled                                  from 'styled-components/macro'

import {
  GridCol,
  GridRow,
  Loader,
  PageHeader,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useAddLayer2AclMutation,
  useGetLayer2AclByIdQuery,
  useLazyGetLayer2AclsQuery,
  useUpdateLayer2AclMutation
} from '@acx-ui/rc/services'
import {
  MacAclRule,
  PolicyType,
  usePolicyListBreadcrumb,
  SwitchRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }                          from '@acx-ui/types'
import { getOpsApi }                             from '@acx-ui/utils'

import { SwitchLayer2ACLDrawer } from './SwitchLayer2ACLDrawer'

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

const defaultPayload ={
  fields: [
    'id',
    'name'
  ],
  page: 1,
  pageSize: 10,
  defaultPageSize: 10,
  total: 0,
  sortField: 'name',
  sortOrder: 'ASC',
  searchString: '',
  searchTargetFields: [
    'name'
  ],
  filters: { id: [] as string[] }
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
  const [dataSource, setDataSource] = useState<MacAclRule[]>()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [layer2ProfileVisible, setLayer2ProfileVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState<MacAclRule>()

  const switchAccessControlPage = '/policies/accessControl/switch/layer2'
  const switchAccessControlLink = useTenantLink(switchAccessControlPage)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SWITCH_ACCESS_CONTROL)
  breadcrumb[2].link = switchAccessControlPage
  const pageTitle = editMode ? $t({ defaultMessage: 'Edit Switch Access Control' }) :
    $t({ defaultMessage: 'Add Switch Access Control' })

  const [addAccessControl] = useAddLayer2AclMutation()
  const [updateAccessControl] = useUpdateLayer2AclMutation()
  const [getAccessControls] = useLazyGetLayer2AclsQuery()
  const { data, isLoading, isFetching } = useGetLayer2AclByIdQuery(
    { params: { accessControlId }, skip: !accessControlId })

  useEffect(() => {
    if(data) {
      if(data && data.macAclRules){
        form.setFieldValue('name', data.name)
        setDataSource(data.macAclRules.map((rule: MacAclRule) => {
          return {
            ...rule,
            key: rule.id
          }
        }))
      }
    }
  }, [data])

  const columns: TableProps<MacAclRule>['columns'] = [
    {
      key: 'action',
      title: $t({ defaultMessage: 'Action' }),
      dataIndex: 'action'
    },
    {
      key: 'sourceAddress',
      title: $t({ defaultMessage: 'Source MAC Address' }),
      dataIndex: 'sourceAddress'
    },
    {
      key: 'sourceMask',
      title: $t({ defaultMessage: 'Mask' }),
      dataIndex: 'sourceMask'
    },
    {
      key: 'destinationAddress',
      title: $t({ defaultMessage: 'Dest. MAC Address' }),
      dataIndex: 'destinationAddress'
    },
    {
      key: 'destinationMask',
      title: $t({ defaultMessage: 'Dest. Mask' }),
      dataIndex: 'destinationMask'
    }
  ]

  const onCancel = () => {
    navigate(switchAccessControlLink, { replace: true })
  }


  const rowActions: TableProps<MacAclRule>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateAccessControl)],
      onClick: (selectedRows, clearSelection) => {
        if (selectedRows.length === 1) {
          setSelectedRow(selectedRows[0])
          setDrawerVisible(true)
        }
        clearSelection()
      },
      disabled: (selectedRows) => selectedRows.length > 1
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [SwitchScopes.DELETE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteAccessControl)],
      onClick: (selectedRows, clearSelection) => {
        setDataSource(dataSource?.filter(option=>{
          return !selectedRows.map(r=>r.key).includes(option?.key)
        }))
        clearSelection()
      }
    }
  ]

  const handleAddRule = () => {
    setSelectedRow({} as MacAclRule)
    setDrawerVisible(true)
  }

  const handleSaveRule = (row: MacAclRule) => {
    setDataSource(prevData => {
      if (!prevData) return [row]
      const index = prevData.findIndex(
        item => (row.key && row.key === item.key))
      if (index > -1) {
        const newData = [...prevData]
        newData.splice(index, 1, { ...prevData[index], ...row })
        return newData
      }else{
        return [...prevData, row]
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateMacAclName = async (_: any, value: string) => {
    if (!value) return Promise.resolve()

    const response = await getAccessControls({
      payload: {
        ...defaultPayload,
        searchString: value,
        searchTargetFields: ['name']
      }
    }).unwrap()

    const existingACLs = response.data

    const duplicateACL = existingACLs.find(acl =>
      acl.name === value && (!editMode || acl.id !== accessControlId)
    )

    if (duplicateACL) {
      return Promise.reject($t({
        defaultMessage: 'MAC ACL name is duplicated.'
      }))
    }

    return Promise.resolve()
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb} />
      <Loader states={[{ isLoading: isLoading, isFetching: isFetching }]}>
        <StepsForm
          form={form}
          editMode={editMode}
          onCancel={onCancel}
          onFinish={async (data) => {

            const formValues = data

            const macAclRules = dataSource?.map(row => {
              const { key, ...rowData } = row
              return rowData
            })

            const payload = { ...formValues, macAclRules }

            if (editMode) {
              await updateAccessControl({ params: { l2AclId: accessControlId }, payload }).unwrap()
            } else {
              await addAccessControl({ payload }).unwrap()
            }
            navigate(switchAccessControlLink, { replace: true })
          }}
        >
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
          >
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'MAC ACL Name' })}
              rules={[
                { required: true, message: 'Please enter MAC ACL name' },
                { validator: validateMacAclName }
              ]}
            >
              <Input disabled={editMode} style={{ width: '400px' }} />
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
                      style={{ marginBottom: '10px' }}
                      valuePropName='checked'
                      initialValue={false}
                      children={<Switch />}
                    />
                    <GridRow style={{ width: '350px' }}>
                      <GridCol col={{ span: 12 }}>
                        <Form.Item
                          name={['layer2AclName']}
                          rules={[{
                            required: true,
                            message: $t({ defaultMessage: 'Please select Layer 2 profile' })
                          }]}
                          children={
                            <Select
                              style={{ width: '150px' }}
                              placeholder={$t({ defaultMessage: 'Select profile...' })}
                              disabled={layer2ProfileVisible}
                              onChange={(value) => {

                              }}
                              children={[]}
                            />
                          }
                        />
                      </GridCol>
                      <AclGridCol>
                        {/* {hasEditPermission && */}
                        <Button type='link'
                          onClick={() => {
                            // if (l2AclPolicyId) {
                            //   setDrawerVisible(true)
                            //   setQueryPolicyId(l2AclPolicyId)
                            //   setLocalEdiMode({ id: l2AclPolicyId, isEdit: true })
                            // }
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
                            // setDrawerVisible(true)
                            // setQueryPolicyId('')
                          }}>
                          {$t({ defaultMessage: 'Add New' })}
                        </Button>
                        {/* } */}
                      </AclGridCol>
                    </GridRow>
                  </AccessComponentWrapper>
                </FieldLabel>}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
      <SwitchLayer2ACLDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        data={selectedRow}
        handleSaveRule={handleSaveRule}
      />
    </>
  )
}
