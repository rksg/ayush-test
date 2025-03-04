/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useRef, useState, useMemo } from 'react'

import { Form, Input, Space, FormInstance, InputRef } from 'antd'
import { Rule }                                       from 'antd/lib/form'
import { useIntl }                                    from 'react-intl'

import {
  Button,
  Drawer,
  Select,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useAddSwitchMacAclMutation,
  useUpdateSwitchMacAclMutation
} from '@acx-ui/rc/services'
import { MacAcl, MacAclRule, MacAddressFilterRegExp } from '@acx-ui/rc/utils'
import { useParams }                                  from '@acx-ui/react-router-dom'

// Interfaces
interface MacACLDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  editMode: boolean
  macACLData?: MacAcl
  venueId: string
}

interface EditableRowProps {
  index: number;
  [key: string]: any;
}

interface EditableCellProps {
  title: string;
  children: React.ReactNode;
  dataIndex: string;
  record: MacAclRule;
  handleSave: (record: MacAclRule) => void;
  [key: string]: any;
}

const EditableContext = React.createContext<FormInstance<any> | null>(null)

const EditableRow: React.FC<EditableRowProps> = ({ index, record, ...props }) => {
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
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const { $t } = useIntl()
  const inputRef = useRef<InputRef>(null)
  const form = useContext(EditableContext)

  useEffect(() => {
    if (form && record && dataIndex) {
      form.setFieldsValue({ [dataIndex]: record[dataIndex as keyof MacAclRule] })
    }
  }, [form, record, dataIndex])

  const save = async () => {
    try {
      const values = form?.getFieldsValue()
      if (dataIndex === 'sourceAddress' || dataIndex === 'destinationAddress') {
        const macAddress = values[dataIndex]

        try {
          await MacAddressFilterRegExp(macAddress)

          let mask = ''
          if (macAddress.includes(':')) {
            mask = 'FF:FF:FF:FF:FF:FF'
          } else if (macAddress.includes('-')) {
            mask = 'FF-FF-FF-FF-FF-FF'
          } else if (macAddress.includes('.')) {
            mask = 'FFFF.FFFF.FFFF'
          } else {
            mask = 'FFFFFFFFFFFF'
          }

          // Update the corresponding mask field
          const maskField = dataIndex === 'sourceAddress' ? 'sourceMask' : 'destinationMask'
          const updatedValues = { ...values, [maskField]: mask }

          handleSave({ ...record, ...updatedValues })
          return
        } catch {
        }
      }
      handleSave({ ...record, ...values })
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.log('Save failed:', errInfo)
    }
  }

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  let childNode = children

  childNode = (
    <Form.Item
      style={{ margin: 0 }}
      name={dataIndex}
      initialValue={dataIndex === 'action' ? 'permit' : ''}
      validateFirst
      rules={[
        ...(dataIndex === 'sourceAddress' || dataIndex === 'destinationAddress' ? [
          {
            validator: (_: Rule, value: string) => value === 'any' ? Promise.resolve()
              : MacAddressFilterRegExp(value)
          }
        ] : [])
      ]}
    >
      {dataIndex !== undefined ? dataIndex === 'action' ? (
        <Select
          options={[
            { label: $t({ defaultMessage: 'Permit' }), value: 'permit' },
            { label: $t({ defaultMessage: 'Deny' }), value: 'deny' }
          ]}
          defaultValue={'permit'}
          onBlur={save}
          onClick={stopPropagation}
          style={{ width: '100%' }}
        />
      ) : (
        <Input
          ref={inputRef}
          onBlur={save}
          onClick={stopPropagation}
        />
      ) : children }
    </Form.Item>
  )

  return <td {...restProps}>{childNode}</td>
}

export const MacACLDrawer: React.FC<MacACLDrawerProps> = ({
  visible,
  setVisible,
  editMode,
  macACLData,
  venueId
}) => {
  const { $t } = useIntl()
  const { switchId } = useParams()
  const [form] = Form.useForm()
  const [dataSource, setDataSource] = useState<MacAclRule[]>()

  const [addSwitchMacAcl] = useAddSwitchMacAclMutation()
  const [updateSwitchMacAcl] = useUpdateSwitchMacAclMutation()

  const defaultColumns = useMemo(() => [
    {
      title: $t({ defaultMessage: 'Action' }),
      dataIndex: 'action'
    },
    {
      title: $t({ defaultMessage: 'Source MAC Address' }),
      dataIndex: 'sourceAddress'
    },
    {
      title: $t({ defaultMessage: 'Mask' }),
      dataIndex: 'sourceMask'
    },
    {
      title: $t({ defaultMessage: 'Dest. MAC Address' }),
      dataIndex: 'destinationAddress'
    },
    {
      title: $t({ defaultMessage: 'Dest. Mask' }),
      dataIndex: 'destinationMask'
    }
  ], [dataSource])

  useEffect(() => {
    if (editMode && macACLData) {
      form.setFieldValue('name', macACLData.name)

      if (macACLData.switchMacAclRules && macACLData.switchMacAclRules.length > 0) {
        const formattedRules = macACLData.switchMacAclRules.map((rule, index) => ({
          key: `${index}`,
          action: rule.action || 'permit',
          sourceAddress: rule.sourceAddress || '',
          sourceMask: rule.sourceMask || '',
          destinationAddress: rule.destinationAddress || '',
          destinationMask: rule.destinationMask || ''
        }))
        setDataSource(formattedRules)
      }
    }
  }, [editMode, macACLData, form])

  const handleAdd = () => {
    const newKey = `${Date.now()}`
    const newRow = {
      key: newKey,
      action: 'permit',
      sourceAddress: '',
      sourceMask: '',
      destinationAddress: '',
      destinationMask: ''
    }
    const rows = Array.isArray(dataSource) ? [...dataSource, newRow] : [newRow]
    setDataSource(rows)
  }

  const handleSave = (row: MacAclRule) => {
    setDataSource(prevData => {
      if (!prevData) return [row]
      const index = prevData.findIndex(item => row.key === item.key)
      if (index > -1) {
        const newData = [...prevData]
        newData.splice(index, 1, { ...prevData[index], ...row })
        return newData
      }
      return prevData
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  }

  const columns = defaultColumns.map(col => {
    return {
      ...col,
      onCell: (record: MacAclRule) => ({
        record,
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

  const rowActions: TableProps<MacAclRule>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        setDataSource(dataSource?.filter(option=>{
          return !selectedRows.map(r=>r.key).includes(option?.key)
        }))
        clearSelection()
      }
    }
  ]

  return (
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
        onFinish={onApply}
      >
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'MAC ACL Name' })}
          rules={[{ required: true, message: 'Please enter MAC ACL name' }]}
        >
          <Input style={{ width: '400px' }} />
        </Form.Item>
        <Form.Item
          name='switchMacAclRules'
          label={$t({ defaultMessage: 'Rules' })}
          rules={[{ required: true ,
            validator: () => {
              if (!dataSource || dataSource.length === 0) {
                return Promise.reject($t({ defaultMessage: 'At least one rule must be added' }))
              }

              const invalidRule = dataSource.find(rule =>
                !rule.sourceAddress || rule.sourceAddress.trim() === '' ||
                !rule.destinationAddress || rule.destinationAddress.trim() === ''
              )

              if (invalidRule) {
                return Promise.reject($t({
                  defaultMessage: 'Source MAC Address and Destination MAC Address cannot be empty'
                }))
              }

              return Promise.resolve()
            } }]}
        >
          <Table
            components={components}
            dataSource={dataSource}
            columns={columns as any}
            rowActions={rowActions}
            rowSelection={{
              type: 'checkbox'
            }}
            actions={[{
              label: $t({ defaultMessage: 'Add Rule' }),
              onClick: () => handleAdd()
            }]}
            pagination={{ pageSize: 10000 }}
            rowKey='key'
          />
        </Form.Item>
      </Form>

    </Drawer>
  )
}