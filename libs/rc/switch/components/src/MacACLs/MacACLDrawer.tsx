import { useEffect, useState } from 'react'

import { Button, Drawer, Form, Input, Space } from 'antd'
import { useIntl }                            from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useLazyGetAccessControlsListQuery,
  useAddSwitchMacAclMutation,
  useUpdateSwitchMacAclMutation
} from '@acx-ui/rc/services'
import {
  MacAclRule,
  PolicyType,
  usePolicyListBreadcrumb,
  SwitchRbacUrlsInfo,
  MacAcl
} from '@acx-ui/rc/utils'
import { useParams }    from '@acx-ui/react-router-dom'
import { SwitchScopes } from '@acx-ui/types'
import { getOpsApi }    from '@acx-ui/utils'

import { SwitchAccessControlDrawer } from './SwitchAccessControlDrawer'

interface SwitchAccessControlFormProps {
  editMode: boolean
  visible: boolean
  setVisible: (visible: boolean) => void
  macACLData?: MacAcl
  venueId: string
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

export const MacACLDrawer =(props: SwitchAccessControlFormProps) => {
  const { editMode, visible, setVisible, macACLData, venueId } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { accessControlId, switchId } = useParams()
  const [dataSource, setDataSource] = useState<MacAclRule[]>()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState<MacAclRule>()

  const switchAccessControlPage = '/policies/accessControl/switch'
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SWITCH_ACCESS_CONTROL)
  breadcrumb[2].link = switchAccessControlPage

  const [getAccessControls] = useLazyGetAccessControlsListQuery()
  const [addSwitchMacAcl] = useAddSwitchMacAclMutation()
  const [updateSwitchMacAcl] = useUpdateSwitchMacAclMutation()

  useEffect(() => {
    if(macACLData) {
      console.log(macACLData)
      if(macACLData && macACLData.switchMacAclRules){
        form.setFieldValue('name', macACLData.name)
        setDataSource(macACLData.switchMacAclRules.map((rule: MacAclRule) => {
          return {
            ...rule,
            key: rule.id
          }
        }))
      }
    }
  }, [macACLData])

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

  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  const onApply = async () => {
    try {
      await form.validateFields()

      const formValues = form.getFieldsValue()

      const switchMacAclRules = dataSource?.map(row => {
        const { key, ...rowData } = row
        return rowData
      })

      const payload = { ...formValues, switchMacAclRules }

      if (editMode) {
        await updateSwitchMacAcl({
          payload,
          params: {
            switchId,
            venueId: venueId,
            macAclId: macACLData?.id
          }
        }).unwrap()
      } else {
        await addSwitchMacAcl({
          payload: [payload],
          params: {
            switchId,
            venueId: venueId
          }
        }).unwrap()
      }

      form.resetFields()
      setDataSource([])
      setVisible(false)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Form validation failed or API error:', error)
    }
  }

  const footer = (
    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        key='okBtn'
        type='primary'
        onClick={onApply}
      >
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    </Space>
  )

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
      <Drawer
        title={editMode
          ? $t({ defaultMessage: 'Edit MAC ACL' })
          : $t({ defaultMessage: 'Add MAC ACL' })}
        visible={visible}
        onClose={onClose}
        width={1000}
        footer={footer}
      >
        <Form
          layout='vertical'
          form={form}
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
        </Form>
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
      </Drawer>

      <SwitchAccessControlDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        data={selectedRow}
        handleSaveRule={handleSaveRule}
      />
    </>
  )
}