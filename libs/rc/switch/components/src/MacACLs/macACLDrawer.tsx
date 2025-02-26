/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useRef, useState, useMemo } from 'react'

import { Form, Input, Space, FormInstance } from 'antd'
import { useIntl }                          from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  Select,
  Table
} from '@acx-ui/components'
import {
  useSwitchDetailHeaderQuery,
  usePortDisableRecoverySettingQuery,
  useAddSwitchMacAclMutation
} from '@acx-ui/rc/services'
import { MacAcl }    from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

// Interfaces
interface MacACLDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  macACLData: MacAcl
}

interface EditableRowProps {
  index: number;
  [key: string]: any;
}

interface EditableCellProps {
  title: string;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: DataSourceItem;
  handleSave: (record: DataSourceItem) => void;
  [key: string]: any;
}

interface DataSourceItem {
  key: string;
  action?: string;
  srcMacAddress?: string;
  mask?: string;
  destMacAddress?: string;
  destMask?: string;
  [key: string]: any;
}

const EditableContext = React.createContext<FormInstance<any> | null>(null)

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<any>(null)
  const form = useContext(EditableContext)

  useEffect(() => {
    if (form && record) {
      form.setFieldsValue({ [dataIndex]: record[dataIndex] })
    }
  }, [form, record, dataIndex])

  const toggleEdit = () => {
    setEditing(!editing)
    if (form) {
      form.setFieldsValue({ [dataIndex]: record[dataIndex] })
    }
  }

  const save = async () => {
    try {
      const values = await form?.validateFields()
      toggleEdit()
      handleSave({ ...record, ...values })
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.log('Save failed:', errInfo)
    }
  }

  let childNode = children

  childNode = (
    <Form.Item
      style={{ margin: 0 }}
      name={dataIndex}
      rules={[{ required: true, message: `${title} is required.` }]}
    >
      {dataIndex !== undefined ? dataIndex === 'action' ? (
        <Select
          autoFocus={editing} // Add this line
          onBlur={save}
          options={[
            { label: 'Permit', value: 'permit' },
            { label: 'Deny', value: 'deny' }
          ]}
          style={{ width: '100%' }}
        />
      ) : (
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      ) : ''}
    </Form.Item>
  )

  return <td {...restProps}>{childNode}</td>
}

export const MacACLDrawer: React.FC<MacACLDrawerProps> = ({
  visible,
  setVisible,
  isEditMode,
  macACLData
}) => {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const [form] = Form.useForm()
  const [dataSource, setDataSource] = useState<DataSourceItem[]>([
    {
      key: '0',
      action: 'permit',
      srcMacAddress: '00:11:22:33:44:55',
      mask: 'FF:FF:FF:FF:FF:FF',
      destMacAddress: '00:11:22:33:44:55',
      destMask: 'FF:FF:FF:FF:FF:FF'
    },
    {
      key: '1',
      action: 'deny',
      srcMacAddress: 'AA:BB:CC:DD:EE:FF',
      mask: 'FF:FF:FF:FF:FF:FF',
      destMacAddress: 'AA:BB:CC:DD:EE:FF',
      destMask: 'FF:FF:FF:FF:FF:FF'
    }
  ])

  // API Hooks with proper error handling
  const [addSwitchMacAcl] = useAddSwitchMacAclMutation()

  const {
    data: switchDetail,
    isLoading: isSwitchDetailLoading
  } = useSwitchDetailHeaderQuery({
    params: { tenantId, switchId }
  })

  const {
    data,
    isLoading
  } = usePortDisableRecoverySettingQuery({
    params: { switchId, venueId: switchDetail?.venueId }
  }, {
    skip: !switchDetail?.venueId || isSwitchDetailLoading
  })

  // Table columns definition
  const defaultColumns = useMemo(() => [
    {
      title: 'Action',
      dataIndex: 'action',
      width: '15%',
      editable: true,
      render: (text: string) => (
        <span>{text}</span>
      )
    },
    {
      title: 'Source MAC Address',
      dataIndex: 'srcMacAddress',
      width: '25%',
      editable: true
    },
    {
      title: 'Mask',
      dataIndex: 'mask',
      width: '15%',
      editable: true
    },
    {
      title: 'Dest. MAC Address',
      dataIndex: 'destMacAddress',
      width: '25%',
      editable: true
    },
    {
      title: 'Dest. Mask',
      dataIndex: 'destMask',
      width: '15%',
      editable: true
    }
  ], [dataSource, $t])

  useEffect(() => {
    if (data) {
    }
  }, [data, form])

  useEffect(() => {
    if (isEditMode && macACLData) {
      form.setFieldValue('name', macACLData.name)
    }
  }, [isEditMode, macACLData, form])

  // const handleDelete = (key: string) => {
  //   setDataSource(prevData => prevData.filter(item => item.key !== key))
  // }

  const handleAdd = () => {
    const newKey = `${Date.now()}`
    const newRow = {
      key: newKey,
      action: 'permit',
      srcMacAddress: '',
      mask: '',
      destMacAddress: '',
      destMask: ''
    }
    setDataSource([...dataSource, newRow])
  }

  const handleSave = (row: DataSourceItem) => {
    setDataSource(prevData => {
      const index = prevData.findIndex(item => row.key === item.key)
      if (index > -1) {
        const newData = [...prevData]
        newData.splice(index, 1, { ...prevData[index], ...row })
        return newData
      }
      return prevData
    })
  }

  // Close drawer
  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  // Apply changes
  const onApply = async () => {
    try {
      await form.validateFields()

      // Get form values
      const formValues = form.getFieldsValue()

      // Get the table data from dataSource state
      const tableData = dataSource.map(row => {
        const { key, ...rowData } = row
        return rowData
      })

      const payload = { ...formValues, switchMacAclRules: tableData }

      // Example of API call for port disable recovery settings
      if (switchDetail?.venueId) {
        await addSwitchMacAcl({
          payload,
          params: { switchId, venueId: switchDetail.venueId }
        }).unwrap()
      }

      onClose()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Form validation failed or API error:', error)
    }
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  }

  const columns = defaultColumns.map(col => {
    if (!('editable' in col) || !col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: DataSourceItem) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave
      })
    }
  })

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

  return (
    <Drawer
      title={isEditMode
        ? $t({ defaultMessage: 'Edit MAC ACL' })
        : $t({ defaultMessage: 'Add MAC ACL' })}
      visible={visible}
      onClose={onClose}
      width={800}
      footer={footer}
    >
      <Loader
        states={[
          { isLoading: isLoading || isSwitchDetailLoading }
        ]}
      >
        <Form
          layout='vertical'
          form={form}
          onFinish={onApply}
        >
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'MAC ACL Name' })}
            rules={[{ required: true, message: 'Please enter MAC ACL name' }]}
          >
            <Input />
          </Form.Item>
        </Form>

        <div style={{ marginBottom: 16 }}>
          <Button onClick={handleAdd} type='primary'>
            {$t({ defaultMessage: 'Add Rule' })}
          </Button>
        </div>

        <Table
          components={components}
          dataSource={dataSource}
          columns={columns as any}
          pagination={false}
        />
      </Loader>
    </Drawer>
  )
}