import { CSSProperties, useContext, useEffect, useRef, useState } from 'react'

import { Form, Input, Select } from 'antd'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'


import { Button, Modal, Table, TableProps } from '@acx-ui/components'
import { DeleteOutlinedIcon }               from '@acx-ui/icons'
import { MdnsFencingWiredRule, trailingNorLeadingSpaces, whitespaceOnlyRegExp }             from '@acx-ui/rc/utils'

import { MdnsFencingServiceContext }            from '../../MdnsFencingServiceTable'
import { FencingRangeRadioGroup, FieldsetItem } from '../../utils'

import { MacAddressesTags, TagData } from './MacAddressTags'


interface DeviceMacAddressTableEntry {
  deviceMacAddresses: string
}

interface DeviceMacAddressModalProps {
  visible: boolean,
  setVisible: (v: boolean) => void,
  handleUpdate: (data: DeviceMacAddressTableEntry[]) => void,
  maxAllowLen: number,
  usedMacAddrs: string[],
  otherUsedMacAddrs: string[]
}

const DeviceMacAddressModal = (props: DeviceMacAddressModalProps) => {
  const { $t } = useIntl()

  const [form] = Form.useForm()
  const { visible, setVisible, handleUpdate, maxAllowLen, usedMacAddrs, otherUsedMacAddrs } = props
  const [disabledAddBtn, setDisableAddBtn] = useState(true)
  const [tags, setTags] = useState<TagData[]>([])
  const tagConfirmFuncRef = useRef<Function>()
  const tagInputValueRef = useRef<string | boolean>(false)
  const clickAddButton = useRef<boolean>(false)

  const handleTagsChanged = (newtags: TagData[]) => {
    const tagsLen = newtags.length
    const hasAnyInvalid = _.some(newtags, ['isInValid', true])
    const hasAnyUsed = _.some(newtags, ['isUsed', true])
    const hasAnyOtherRulesUsed = _.some(newtags, ['isUsedOtherRules', true])

    const hasAnyError = (tagsLen === 0 || tagsLen > maxAllowLen) ||
                        !!hasAnyInvalid ||
                        !!hasAnyUsed || !!hasAnyOtherRulesUsed

    setDisableAddBtn(hasAnyError)
    setTags(newtags)

    if (clickAddButton.current === true && !hasAnyError) {
      clickAddButton.current = false
      handleOK()
    }
  }

  const handleTagInputChanged = (value: string | boolean) => {
    tagInputValueRef.current = value

    if (tags.length === 0 && value !== false) {
      setDisableAddBtn(value === '')
    }
  }

  const content = <Form
    form={form}
    layout='vertical'
    initialValues={{}}
  >
    <Form.Item
      label={$t({
        defaultMessage: 'The maximum number of device MAC addresses for wired connection is 4.'
      })}
      children={
        <MacAddressesTags
          maxNumOfTags={maxAllowLen}
          usedMacAddrs={usedMacAddrs}
          otherUsedMacAddrs={otherUsedMacAddrs}
          tags={tags}
          tagsChanged={handleTagsChanged}
          tagInputChanged={handleTagInputChanged}
          confirmFunction={tagConfirmFuncRef}
        />
      }
    />
  </Form>

  const resetTempSettings = () => {
    setTags([])
    setDisableAddBtn(true)
    tagInputValueRef.current = false
    clickAddButton.current = false
  }

  const handleOK = () => {
    if (tagInputValueRef.current !== false) {
      clickAddButton.current = true
      tagConfirmFuncRef.current?.()
    } else {
      const data = tags.map(tag => ({ deviceMacAddresses: tag.value }))
      handleUpdate(data)
      resetTempSettings()
    }
  }

  const handleCancel = () => {
    setVisible(false)
    // reset tags
    resetTempSettings()
  }

  return (<Modal
    title={$t({ defaultMessage: 'Add MAC Address' })}
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
  />)
}


interface DeviceMacAddressTableProps {
  tableData: DeviceMacAddressTableEntry[],
  tableDataChanged: (d: DeviceMacAddressTableEntry[]) => void,
  otherUsedMacAddrs: string[]
}

const DeviceMacAddressTable = (props: DeviceMacAddressTableProps) => {
  const { $t } = useIntl()
  const maxNumOfMACAddress = 4

  const { tableData = [], tableDataChanged, otherUsedMacAddrs } = props

  const [showMacAddressModal, setShowMacAddressModal] = useState(false)

  const currentUsedMacAddr = tableData.map(d => d.deviceMacAddresses)

  const handleAdd = () => {
    // show
    setShowMacAddressModal(true)
  }

  const handleDelete = (macAddresses: string) => {
    const newData = tableData.filter(data => data.deviceMacAddresses !== macAddresses)
    tableDataChanged(newData)
  }

  const columns : TableProps<DeviceMacAddressTableEntry>['columns'] = [{
    title: $t({ defaultMessage: 'MAC Address' }),
    dataIndex: 'deviceMacAddresses',
    key: 'deviceMacAddresses'
  }, {
    key: 'action',
    dataIndex: 'action',
    render: (_, row) => <Button
      key='delete'
      role='deleteBtn'
      ghost={true}
      icon={<DeleteOutlinedIcon />}
      style={{ height: '16px' }}
      onClick={() => handleDelete(row.deviceMacAddresses)}
    />
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAdd,
    disabled: tableData && (tableData.length >= maxNumOfMACAddress)
  }]

  const updateTableData = (data: DeviceMacAddressTableEntry[]) => {
    const newData = tableData.concat(data)
    tableDataChanged(newData)
    setShowMacAddressModal(false)
  }

  return (
    <Form.Item
      name='deviceMacAddresses'
      required
      label={
        $t({ defaultMessage: 'Device MAC Address ( {count}/{count_limit} )' },
          { count: tableData.length, count_limit: maxNumOfMACAddress })
      }
      children={<>
        <DeviceMacAddressModal
          visible={showMacAddressModal}
          setVisible={setShowMacAddressModal}
          handleUpdate={updateTableData}
          maxAllowLen={maxNumOfMACAddress - tableData.length}
          usedMacAddrs={currentUsedMacAddr}
          otherUsedMacAddrs={otherUsedMacAddrs}

        />
        <Table
          type='form'
          rowKey='deviceMacAddresses'
          columns={columns}
          dataSource={tableData}
          actions={actions}
        />
      </>}
    />
  )
}


interface WiredRulesTableEntry extends MdnsFencingWiredRule {
  rowId?: string
}

interface WiredRulesModalProps {
  visible: boolean,
  isEditMode: boolean,
  currentRule: WiredRulesTableEntry,
  existedRules: WiredRulesTableEntry[],
  handleUpdate: (data: WiredRulesTableEntry) => void,
  onCancel: () => void
}

const initWiredRuleFormData = {
  name: '',
  //fencingRange: 'SAME_AP',
  deviceMacAddresses: [],
  closestApMac: ''
}

const WiredRulesModal = (props: WiredRulesModalProps) => {
  const { $t } = useIntl()
  const { Option } = Select

  const [form] = Form.useForm()
  const { visible = false, isEditMode, handleUpdate, currentRule, existedRules } = props
  const [disabledAddBtn, setDisableAddBtn] = useState(true)
  const [macAddrs, setMacAddrs] = useState<DeviceMacAddressTableEntry[]>([])
  const [usedRuleNames, setUsedRuleNames] = useState<string[]>()
  const [usedMacAddrs, setUsedMacAddrs] = useState<string[]>([])
  const [usedClosestAps, setUsedClosedAps] = useState<string[]>()
  const [conflictMacAddes, setConflictMacAddes] = useState('')
  const { venueAps } = useContext(MdnsFencingServiceContext)

  // reset form fields when modal is closed
  const prevOpenRef = useRef(false)
  useEffect(() => {
    prevOpenRef.current = visible
  }, [visible])

  const prevOpen = prevOpenRef.current
  useEffect(() => {
    if (!visible && prevOpen) {
      form.resetFields()
      setMacAddrs([])
      setDisableAddBtn(true)
    }
  }, [form, prevOpen, visible])

  useEffect(() => {
    form.setFieldsValue(currentRule)

    const { deviceMacAddresses } = currentRule
    if ( Array.isArray(deviceMacAddresses) && deviceMacAddresses.length > 0) {
      const devMacAddrs = deviceMacAddresses.map(addr => ({ deviceMacAddresses: addr }))
      setMacAddrs(devMacAddrs)
    }

  }, [form, currentRule ])

  useEffect(() => {
    const rules = existedRules || []

    let usedNames: string[] = []
    let usedMac: string[] = []
    let usedAps: string[] = []

    rules.forEach(r => {
      usedMac = _.concat(usedMac, r.deviceMacAddresses)
      usedNames.push(r.name)
      usedAps.push(r.closestApMac)
    })

    setUsedRuleNames(usedNames)
    setUsedMacAddrs(usedMac)
    setUsedClosedAps(usedAps)

  }, [existedRules])

  const handleAddMacAddrs = (macAddrs: DeviceMacAddressTableEntry[]) => {
    setMacAddrs(macAddrs)
    const macList = macAddrs.map(addrEntry => addrEntry.deviceMacAddresses)
    form.setFieldValue('deviceMacAddresses', macList)
    validateFormData()
  }

  const validateFormData = () => {
    const { closestApMac='', deviceMacAddresses=[] } = form.getFieldsValue()
    const hasErrors = form.getFieldsError().some(item => item.errors.length > 0)

    const isClosestApConflict = !!closestApMac && _.includes(deviceMacAddresses, closestApMac)
    const isValid = (!hasErrors && deviceMacAddresses.length > 0 &&
      !!closestApMac && !isClosestApConflict)

    setConflictMacAddes(isClosestApConflict? closestApMac : '')

    setDisableAddBtn(!isValid)
  }

  const ruleNameDuplicationValidator = async () => {
    const ruleName = form.getFieldValue('name')

    return (usedRuleNames && usedRuleNames.includes(ruleName))
      ? Promise.reject($t({ defaultMessage: 'The Rule Name already exists' }))
      : Promise.resolve()
  }

  const content = <Form
    form={form}
    layout='vertical'
    initialValues={initWiredRuleFormData}
    onFieldsChange={validateFormData}
  >
    <Form.Item name='rowId' noStyle>
      <Input type='hidden' />
    </Form.Item>
    <Form.Item
      required
      name='name'
      label={$t({ defaultMessage: 'Rule Name' })}
      style={{ width: '280px' }}
      children={<Input />}
      rules={[
        { min: 2 },
        { max: 32 },
        { required: true },
        { validator: () => ruleNameDuplicationValidator() },
        { validator: (_, value) => trailingNorLeadingSpaces(value) }
      ]}
    />
    <FencingRangeRadioGroup
      fieldName={'fencingRange'}
    />
    <DeviceMacAddressTable
      tableData={macAddrs}
      tableDataChanged={handleAddMacAddrs}
      otherUsedMacAddrs={usedMacAddrs}
    />
    <Form.Item
      required
      name='closestApMac'
      label={$t({ defaultMessage: 'Closest AP' })}
      style={{ width: '280px' }}
      rules={[{ required: true }]}
    >
      <Select
        placeholder={$t({ defaultMessage: 'Select closest AP...' })}
        getPopupContainer={trigger => trigger.parentElement}
        children={
          venueAps.map((ap) => {
            const { name, apMac } = ap
            const isUsed = usedClosestAps && usedClosestAps.includes(apMac)
            return (
              <Option key={apMac} value={apMac} disabled={isUsed}>
                { name }
              </Option>
            )
          })
        }
      />
    </Form.Item>
    <Form.Item
      label={
        $t({ defaultMessage: 'You can choose only APs that already connected to the cloud' })
      }
      style={{ paddingBottom: '20px' }}
      children={conflictMacAddes &&
        <div style={{ color: 'red' }}>
          {$t({
            // eslint-disable-next-line max-len
            defaultMessage: ' You have entered the same MAC address for both the device and the closest AP. Only Unique MAC addresses allowed.'
          })}
        </div>
      }
    />
  </Form>

  const handleOK = () => {
    const data = form.getFieldsValue()
    handleUpdate(data)
  }

  return (
    <Modal
      title={isEditMode
        ? $t({ defaultMessage: 'Edit Wired Connection' })
        : $t({ defaultMessage: 'Add Wired Connection' })}
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

interface WiredRulesTableProps {
  tableData: WiredRulesTableEntry[],
  tableDataChanged:(data: WiredRulesTableEntry[]) => void,
  style?: CSSProperties
}

const WiredRulesTable = (props: WiredRulesTableProps) => {
  const { $t } = useIntl()
  const { tableData, tableDataChanged, style } = props
  const [ wiredRuleNodalState, setWiredRuleNodalState ] = useState({
    isEditMode: false,
    visible: false,
    currentRule: {} as WiredRulesTableEntry,
    existedRules: [] as WiredRulesTableEntry[]
  })

  const { venueAps } = useContext(MdnsFencingServiceContext)

  const handleAdd = () => {
    const existedRules = tableData

    setWiredRuleNodalState({
      ...wiredRuleNodalState,
      isEditMode: false,
      visible: true,
      currentRule: {} as WiredRulesTableEntry,
      existedRules
    })
  }

  const columns: TableProps<WiredRulesTableEntry>['columns'] = [{
    title: $t({ defaultMessage: 'Name' }),
    dataIndex: 'name',
    key: 'name'
  }, {
    title: $t({ defaultMessage: 'Fencing Range' }),
    dataIndex: 'fencingRange',
    key: 'fencingRange',
    render: function (_, { fencingRange }) {
      return (fencingRange === 'SAME_AP')?
        $t({ defaultMessage: 'Same AP' }) : $t({ defaultMessage: '1-hop AP neighbors' })
    }
  }, {
    title: $t({ defaultMessage: 'MAC Address' }),
    dataIndex: 'deviceMacAddresses',
    key: 'deviceMacAddresses',
    render: function (_, row) {
      const { deviceMacAddresses: macAddrs } = row
      return macAddrs.map(d => <div>{d}</div>)
    }
  }, {
    title: $t({ defaultMessage: 'Closest AP' }),
    dataIndex: 'closestApMac',
    key: 'closestApMac',
    render: function (__, { closestApMac }) {
      const ap = _.find(venueAps, (ap) => ap.apMac === closestApMac)
      return ap?.name || closestApMac
    }
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAdd
  }]

  const rowActions: TableProps<(typeof tableData)[0]>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      disabled: wiredRuleNodalState.visible,
      onClick: (selectedRows, clearSelection) => {
        const selectData = { ...selectedRows[0] }
        const existedRules = tableData.filter( d => d.rowId !== selectData.rowId )

        setWiredRuleNodalState({
          ...wiredRuleNodalState,
          isEditMode: true,
          visible: true,
          currentRule: selectData,
          existedRules
        })

        clearSelection()
      }
    }, {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: wiredRuleNodalState.visible,
      onClick: (selectedRows, clearSelection) => {
        const keys = selectedRows.map(row => row.rowId)
        const newData = tableData.filter(d => keys.indexOf(d.rowId) === -1)
        tableDataChanged(newData)

        clearSelection()
      }
    }
  ]

  const updateRowId = (data: WiredRulesTableEntry) => {
    return { ...data, rowId: data.name }
  }

  const updateTableData = (data: WiredRulesTableEntry) => {
    const newTableData = [ ...tableData ]

    const targetIdx = newTableData.findIndex((r: WiredRulesTableEntry) => r.rowId === data.rowId)

    const newData = updateRowId(data)

    if (targetIdx === -1) {
      newTableData.push(newData)
    } else {
      newTableData.splice(targetIdx, 1, newData)
    }

    tableDataChanged(newTableData)

    setWiredRuleNodalState({
      ...wiredRuleNodalState,
      visible: false
    })
  }

  const handleWireRulesModalCancel = () => {
    setWiredRuleNodalState({
      ...wiredRuleNodalState,
      visible: false
    })
  }

  return <Form.Item
    name='wiredRules'
    style={style}
    required
    label={$t({ defaultMessage: 'Fencing Rule' })}
    children={<>
      <WiredRulesModal
        {...wiredRuleNodalState}
        handleUpdate={updateTableData}
        onCancel={handleWireRulesModalCancel} />
      <Table
        rowKey='rowId'
        columns={columns}
        dataSource={tableData}
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
      />
    </>}
  />
}

export const WiredConnectionFieldset = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const { currentService } = useContext(MdnsFencingServiceContext)

  const [ tableData, setTableData ] = useState<WiredRulesTableEntry[]>([])

  useEffect(() => {
    const wiredRules = currentService?.wiredRules || []
    const newData = wiredRules.map(wr => ({ ...wr, rowId: wr.name }))
    setTableData(newData)
  }, [ currentService ] )

  const handleTableDataChanged = (data: WiredRulesTableEntry[]) => {
    setTableData(data)
    const newFormData = data.map(d => _.omit(d, ['rowId']))
    form.setFieldValue('wiredRules', newFormData)
  }

  return (
    <FieldsetItem
      name='wiredEnabled'
      label={$t({ defaultMessage: 'Wired Connection' })}
      initialValue={false}
      children={<WiredRulesTable
        style={{ paddingBottom: '16px' }}
        tableData={tableData}
        tableDataChanged={handleTableDataChanged}
      />}
      switchStyle={{ marginLeft: '35px' }}/>
  )
}
