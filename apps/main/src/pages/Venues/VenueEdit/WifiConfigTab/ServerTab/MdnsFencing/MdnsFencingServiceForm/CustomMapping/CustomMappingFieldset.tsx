import { CSSProperties, useContext, useEffect, useRef, useState } from 'react'

import { Form, Input }                              from 'antd'
import _                                            from 'lodash'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Modal, showActionModal, Table, TableProps } from '@acx-ui/components'
import { trailingNorLeadingSpaces }                  from '@acx-ui/rc/utils'

import { MdnsFencingServiceContext }        from '../../MdnsFencingServiceTable'
import { FieldsetItem, ProtocolRadioGroup } from '../../utils'

interface CustomMappingTableEntry {
  rowId?: string,
  id: string,
  customString: string,
  protocol: string
}

interface CustomMappingModalPorps {
  isEditMode: boolean,
  visible: boolean,
  curCustomString: CustomMappingTableEntry
  usedCustomStrings: CustomMappingTableEntry[],
  handleUpdate: (data: CustomMappingTableEntry) => void,
  onCancel: () => void
}

const initCustomMappingFormData = {
  customString: ''
}

const CustomMappingModal = (props: CustomMappingModalPorps) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { visible, isEditMode, curCustomString, usedCustomStrings=[], handleUpdate } = props
  const [disabledAddBtn, setDisableAddBtn] = useState(true)

  // reset form fields when modal is closed
  const prevOpenRef = useRef(false)
  useEffect(() => {
    prevOpenRef.current = visible
  }, [visible])

  const prevOpen = prevOpenRef.current
  useEffect(() => {
    if (!visible && prevOpen) {
      form.resetFields()
      setDisableAddBtn(true)
    }
  }, [form, prevOpen, visible])

  useEffect(() => {
    form.setFieldsValue(curCustomString)
  }, [form, curCustomString])

  const content = <Form
    form={form}
    layout='vertical'
    initialValues={initCustomMappingFormData}
    onFieldsChange={() => {
      const hasErrors = form.getFieldsError().some(item => item.errors.length > 0)
      setDisableAddBtn(hasErrors)
    }}
  >
    <Form.Item name='rowId' noStyle>
      <Input type='hidden' />
    </Form.Item>
    <Form.Item required
      name='customString'
      label={$t({ defaultMessage: 'Custom string' })}
      style={{ width: '280px' }}
      children={<Input />}
      rules={[
        { min: 2 },
        { max: 65 },
        { required: true },
        { validator: (_, value) => trailingNorLeadingSpaces(value) }
      ]}
    />
    <ProtocolRadioGroup
      fieldName={'protocol'}
    />
  </Form>

  const handleOK = () => {
    const { customString, protocol, rowId } = form.getFieldsValue()
    const id = `_${customString}._${protocol}.`

    const isDuplicated = _.find(usedCustomStrings, (entry) => (entry.id === id))

    if (!!isDuplicated) {
      const errMessageFormat = defineMessage({
        defaultMessage:
        'Following string already exist in the list and was not added:{br}{br}{customString}'
      })

      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Custom String Already Exists' }),
        content: <FormattedMessage {...errMessageFormat}
          values={{
            br: <br />,
            customString: id
          }}
        />
      })

    } else {
      handleUpdate({ id, rowId, customString, protocol })
    }
  }

  return (
    <Modal
      title={isEditMode
        ? $t({ defaultMessage: 'Edit Custom String' })
        : $t({ defaultMessage: 'Add Custom String' })}
      visible={visible}
      centered
      maskClosable={false}
      keyboard={false}
      children={content}
      okText={isEditMode
        ? $t({ defaultMessage: 'Save' })
        : $t({ defaultMessage: 'Add' })}
      onCancel={props.onCancel}
      onOk={handleOK}
      okButtonProps={{
        disabled: disabledAddBtn
      }}
    />
  )
}

interface CustomMappingTableProps {
  tableData: CustomMappingTableEntry[],
  tableDataChanged:(data: CustomMappingTableEntry[]) => void,
  style?: CSSProperties
}

const CustomMappingTable = (props: CustomMappingTableProps) => {
  const { $t } = useIntl()
  const maxNumberOfCustomMappingLen = 3

  const { tableData = [], tableDataChanged, style } = props

  const [customMappingModalState, setCustomMappingModalState] = useState({
    isEditMode: false,
    visible: false,
    curCustomString: {} as CustomMappingTableEntry,
    usedCustomStrings: [] as CustomMappingTableEntry[]
  })


  const handleAdd = () => {
    const usedCustomStrings = tableData

    setCustomMappingModalState({
      ...customMappingModalState,
      isEditMode: false,
      visible: true,
      curCustomString: {} as CustomMappingTableEntry,
      usedCustomStrings
    })
  }

  const updateRowId = (data: CustomMappingTableEntry) => {
    return { ...data, rowId: data.id }
  }

  const updateTableData = (data: CustomMappingTableEntry) => {
    const newTableData = [ ...tableData ]

    const targetIdx = newTableData.findIndex((r: CustomMappingTableEntry) => r.rowId === data.rowId)

    const newData = updateRowId(data)

    if (targetIdx === -1) {
      newTableData.push(newData)
    } else {
      newTableData.splice(targetIdx, 1, newData)
    }

    tableDataChanged(newTableData)

    setCustomMappingModalState({
      ...customMappingModalState,
      visible: false
    })

  }

  const columns: TableProps<CustomMappingTableEntry>['columns'] = [{
    title: $t({ defaultMessage: 'Custom String' }),
    dataIndex: 'customString',
    key: 'customString'
  }, {
    title: $t({ defaultMessage: 'Protocol' }),
    dataIndex: 'protocol',
    key: 'protocol'
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAdd,
    disabled: tableData && (tableData.length >= maxNumberOfCustomMappingLen)
  }]

  const rowActions: TableProps<(typeof tableData)[0]>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      disabled: customMappingModalState.visible,
      onClick: (selectedRows, clearSelection) => {
        const selectData = { ...selectedRows[0] }
        const usedCustomStrings = tableData.filter( d => d.rowId !== selectData.rowId )

        setCustomMappingModalState({
          ...customMappingModalState,
          isEditMode: true,
          visible: true,
          curCustomString: selectData,
          usedCustomStrings
        })

        clearSelection()
      }
    }, {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: customMappingModalState.visible,
      onClick: (selectedRows, clearSelection) => {
        const keys = selectedRows.map(row => row.rowId)
        const newData = tableData.filter(d => keys.indexOf(d.rowId) === -1)
        tableDataChanged(newData)

        clearSelection()
      }
    }
  ]

  const handleCustomMappingModalCancel = () => {
    setCustomMappingModalState({
      ...customMappingModalState,
      visible: false
    })
  }

  return (
    <Form.Item
      style={style}
      name='customStrings'
      required
      label={
        $t({ defaultMessage: 'Custom String List ( {count}/{count_limit} )' },
          {
            count: tableData.length,
            count_limit: maxNumberOfCustomMappingLen
          })
      }
      children={<>
        <CustomMappingModal
          {...customMappingModalState}
          handleUpdate={updateTableData}
          onCancel={handleCustomMappingModalCancel}
        />
        <Table
          rowKey='rowId'
          columns={columns}
          dataSource={tableData}
          actions={actions}
          rowActions={rowActions}
          rowSelection={{ type: 'checkbox' }}
        />
      </>
      }
    />
  )
}

export const CustomMappingFieldset = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const { currentService } = useContext(MdnsFencingServiceContext)

  const [ tableData, setTableData ] = useState<CustomMappingTableEntry[]>([])

  useEffect(() => {
    const customStrings = currentService?.customStrings || []
    const initData = getTableDataFromCustomMapping(customStrings)

    setTableData(initData)
  }, [currentService])

  const getTableDataFromCustomMapping = (customMappingData: string[]) => {
    return customMappingData.map((data: string) => {
      const [customString, protocol] = data.split('.')

      return {
        rowId: data,
        id: data,
        customString: customString.replace('_', ''),
        protocol: protocol.replace('_', '')
      }
    })
  }

  const handleTableDataChanged = (data: CustomMappingTableEntry[]) => {
    setTableData(data)

    form.setFieldValue('customStrings', data.map((d) => d.id))
  }

  return (
    <FieldsetItem
      name='customMappingEnabled'
      label={$t({ defaultMessage: 'Custom Mapping' })}
      initialValue={false}
      children={
        <CustomMappingTable
          style={{ paddingBottom: '16px' }}
          tableData={tableData}
          tableDataChanged={handleTableDataChanged} />
      }
      switchStyle={{ marginLeft: '40px' }}/>
  )
}
