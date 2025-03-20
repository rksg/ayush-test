import { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useLazyGetAccessControlsListQuery,
  useAddAccessControlMutation,
  useUpdateAccessControlMutation
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

import { SwitchAccessControlDrawer } from './SwitchAccessControlDrawer'

interface SwitchAccessControlFormProps {
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

export const SwitchAccessControlForm = (props:SwitchAccessControlFormProps) => {
  const { editMode } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { accessControlId } = useParams()
  const [dataSource, setDataSource] = useState<MacAclRule[]>()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState<MacAclRule>()

  const switchAccessControlPage = '/policies/accessControl/switch'
  const switchAccessControlLink = useTenantLink(switchAccessControlPage)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SWITCH_ACCESS_CONTROL)
  breadcrumb[2].link = switchAccessControlPage
  const pageTitle = editMode ? $t({ defaultMessage: 'Edit Switch Access Control' }) :
    $t({ defaultMessage: 'Add Switch Access Control' })

  const [addAccessControl] = useAddAccessControlMutation()
  const [updateAccessControl] = useUpdateAccessControlMutation()
  const [getAccessControls] = useLazyGetAccessControlsListQuery()

  useEffect(() => {
    if(accessControlId) {
      const payload = { ...defaultPayload, filters: { id: [accessControlId] } }
      getAccessControls({ payload }).unwrap().then(response => {
        if(response.data[0]){
          form.setFieldValue('name', response.data[0].name)
          setDataSource(response.data[0].macAclRules)
        }
      })
    }
  }, [accessControlId])
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
        item => (row.id && row.id === item.id) || (
          row.sourceAddress === item.sourceAddress &&
        row.destinationAddress === item.destinationAddress)
      )
      if (index > -1) {
        const newData = [...prevData]
        newData.splice(index, 1, { ...prevData[index], ...row })
        return newData
      }else{
        return [...prevData, row]
      }
    })
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
            rules={[{ required: true, message: 'Please enter MAC ACL name' }]}
          >
            <Input style={{ width: '400px' }} />
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
            rowKey='id' />
        </StepsForm.StepForm>
      </StepsForm>
      <SwitchAccessControlDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        data={selectedRow}
        handleSaveRule={handleSaveRule}
      />
    </>
  )
}
