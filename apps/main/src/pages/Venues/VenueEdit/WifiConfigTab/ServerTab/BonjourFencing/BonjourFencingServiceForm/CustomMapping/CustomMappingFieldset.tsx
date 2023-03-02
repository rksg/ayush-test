import { CSSProperties, useEffect, useState } from 'react'

import { Form, Input }                              from 'antd'
import _                                            from 'lodash'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Button, Modal, showActionModal, Table, TableProps } from '@acx-ui/components'
import { DeleteOutlinedIcon }                                from '@acx-ui/icons'


import { FieldsetItem, ProtocolRadioGroup } from '../../utils'

interface CustomMappingTableEntry {
  id: string,
  customString: string,
  protocol: string
}

interface CustomMappingModalPorps {
  visible: boolean,
  setVisible: (v: boolean) => void,
  handleUpdate: (data: CustomMappingTableEntry) => void,
  usedCustomStrings: CustomMappingTableEntry[]
}

const CustomMappingModal = (props: CustomMappingModalPorps) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { visible, setVisible, handleUpdate, usedCustomStrings=[] } = props
  const [disabledAddBtn, setDisableAddBtn] = useState(true)


  const content = <Form
    form={form}
    layout='vertical'
    initialValues={{}}
    onFieldsChange={() => {
      const { customString } = form.getFieldsValue()
      setDisableAddBtn(!customString)
    }}
  >
    <Form.Item required
      name='customString'
      label={$t({ defaultMessage: 'Custom string' })}
      style={{ width: '280px' }}
      children={<Input />}
      rules={[
        { min: 2 },
        { max: 64 },
        { required: true }
      ]}
    />
    <ProtocolRadioGroup
      fieldName={'protocol'}
    />
  </Form>

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
    setDisableAddBtn(true)
  }

  const handleOK = () => {
    const { customString, protocol } = form.getFieldsValue()
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
      handleUpdate({ id, customString, protocol })
      form.resetFields()
      setDisableAddBtn(true)
    }
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Add Custom String' })}
      visible={visible}
      centered
      maskClosable={false}
      keyboard={false}
      children={content}
      okText={$t({ defaultMessage: 'Add' })}
      onCancel={handleCancel}
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

  const [showCustomMappingModal, setShowCustomMappingModal] = useState(false)


  const handleAdd = () => {
    setShowCustomMappingModal(true)
  }

  const handleDelete = (id: string) => {
    const newData = tableData.filter(data => data.id !== id)
    tableDataChanged(newData)
  }

  const addTableData = (data: CustomMappingTableEntry) => {
    const newData = [ ...tableData ]
    newData.push(data)
    tableDataChanged(newData)
    setShowCustomMappingModal(false)
  }

  const columns: TableProps<CustomMappingTableEntry>['columns'] = [{
    title: $t({ defaultMessage: 'Custom String' }),
    dataIndex: 'customString',
    key: 'customString'
  }, {
    title: $t({ defaultMessage: 'Protocol' }),
    dataIndex: 'protocol',
    key: 'protocol'
  }, {
    key: 'action',
    dataIndex: 'action',
    render: (data, row) => <Button
      key='delete'
      role='deleteBtn'
      ghost={true}
      icon={<DeleteOutlinedIcon />}
      style={{ height: '16px' }}
      onClick={() => handleDelete(row.id)}
    />
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAdd,
    disabled: tableData && (tableData.length >= maxNumberOfCustomMappingLen)
  }]

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
          visible={showCustomMappingModal}
          setVisible={setShowCustomMappingModal}
          handleUpdate={addTableData}
          usedCustomStrings={tableData}
        />
        <Table type='form'
          rowKey='id'
          columns={columns}
          dataSource={tableData}
          actions={actions}
        />
      </>
      }
    />
  )
}

export const CustomMappingFieldset = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const [ tableData, setTableData ] = useState<CustomMappingTableEntry[]>([])

  useEffect(() => {
    const customStrings = form.getFieldValue('customStrings') || []
    const initData = getTableDataFromCustomMapping(customStrings)

    setTableData(initData)
  }, [ form ] )

  const getTableDataFromCustomMapping = (customMappingData: string[]) => {
    return customMappingData.map((data: string) => {
      const [customString, protocol] = data.split('.')

      return {
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
