import { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import {
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

interface SwitchLayer2ACLFormProps {
  editMode: boolean
  layer2AclId?: string
  drawerOnClose?: () => void
}

const defaultPayload ={
  fields: [
    'id',
    'name'
  ],
  page: 1,
  pageSize: 10000,
  defaultPageSize: 10000,
  total: 0,
  sortField: 'name',
  sortOrder: 'ASC',
  searchString: '',
  searchTargetFields: [
    'name'
  ],
  filters: { id: [] as string[] }
}

export const SwitchLayer2ACLForm = (props: SwitchLayer2ACLFormProps) => {
  const { editMode, layer2AclId, drawerOnClose } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { accessControlId } = useParams()
  const [dataSource, setDataSource] = useState<MacAclRule[]>()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState<MacAclRule>()

  const switchAccessControlPage = '/policies/accessControl/switch/layer2'
  const switchAccessControlLink = useTenantLink(switchAccessControlPage)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SWITCH_ACCESS_CONTROL)
  breadcrumb[2].link = switchAccessControlPage
  const pageTitle = editMode ? $t({ defaultMessage: 'Edit Layer 2 Settings' }) :
    $t({ defaultMessage: 'Add Layer 2 Settings' })

  const [addAccessControl] = useAddLayer2AclMutation()
  const [updateAccessControl] = useUpdateLayer2AclMutation()
  const [getAccessControls] = useLazyGetLayer2AclsQuery()
  const { data, isLoading, isFetching } = useGetLayer2AclByIdQuery(
    { params: { accessControlId: layer2AclId || accessControlId } },
    { skip: !editMode })

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
    if(drawerOnClose){
      drawerOnClose()
    }else{
      navigate(switchAccessControlLink, { replace: false })
    }
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
      acl.name === value && (!editMode || acl.id !== (layer2AclId || accessControlId))
    )

    if (duplicateACL) {
      return Promise.reject($t({
        defaultMessage: 'MAC ACL name is duplicated.'
      }))
    }

    return Promise.resolve()
  }

  const handleFinish = async (data: MacAclRule) => {
    const formValues = data

    const macAclRules = dataSource?.map(row => {
      const { key, ...rowData } = row
      return rowData
    })

    const payload = { ...formValues, macAclRules }

    if (editMode) {
      await updateAccessControl({
        params: { l2AclId: (layer2AclId || accessControlId) },
        payload
      }).unwrap()
    } else {
      await addAccessControl({ payload }).unwrap()
    }

    if (drawerOnClose) {
      drawerOnClose()
    } else {
      navigate(switchAccessControlLink, { replace: false })
    }
  }

  return (
    <>
      {!drawerOnClose &&
        <PageHeader
          title={pageTitle}
          breadcrumb={breadcrumb}
        />
      }
      <Loader states={[{ isLoading: isLoading, isFetching: isFetching }]}>
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
              name='name'
              label={$t({ defaultMessage: 'MAC ACL Name' })}
              rules={[
                { required: true, message: 'Please enter MAC ACL name' },
                { validator: validateMacAclName }
              ]}
              validateTrigger='onBlur'
            >
              <Input disabled={editMode} style={{ width: '400px' }} maxLength={255} />
            </Form.Item>
            <Table
              dataSource={dataSource}
              columns={columns}
              rowActions={rowActions}
              rowSelection={{
                type: 'checkbox'
              }}
              actions={[{
                label: $t({ defaultMessage: 'Add Rule' }),
                onClick: () => handleAddRule()
              }]}
              pagination={{ pageSize: 10000 }}
              rowKey='key' />
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
