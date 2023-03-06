import { CSSProperties, useContext, useEffect, useState } from 'react'

import { Form, Input, Select } from 'antd'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'


import { Button, Modal, Table, TableProps } from '@acx-ui/components'
import { DeleteOutlinedIcon }               from '@acx-ui/icons'

import { BonjourFencingServiceContext }         from '../../BonjourFencingServiceTable'
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
  usedMacAddrs: string[]
}

const DeviceMacAddressModal = (props: DeviceMacAddressModalProps) => {
  const { $t } = useIntl()

  const [form] = Form.useForm()
  const { visible, setVisible, handleUpdate, maxAllowLen, usedMacAddrs } = props
  const [disabledAddBtn, setDisableAddBtn] = useState(true)
  const [tags, setTags] = useState<TagData[]>([])

  const handleTagsChanged = (newtags: TagData[]) => {
    const tagsLen = newtags.length
    const hasAnyInvalid = _.some(newtags, ['isInValid', true])
    const hasAnyUsed = _.some(newtags, ['isUsed', true])

    const hasAnyError = (tagsLen === 0 || tagsLen > maxAllowLen) ||
                        !!hasAnyInvalid ||
                        !!hasAnyUsed

    setDisableAddBtn(hasAnyError)
    setTags(newtags)
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
          tags={tags}
          tagsChanged={handleTagsChanged}
        />
      }
    />
  </Form>

  const handleOK = () => {
    const data = tags.map(tag => ({ deviceMacAddresses: tag.value }))
    handleUpdate(data)
    // reset tags
    setTags([])
    setDisableAddBtn(true)
  }

  const handleCancel = () => {
    setVisible(false)
    // reset tags
    setTags([])
    setDisableAddBtn(true)
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


  const getUsedAddress = () => {
    const currentUsedMacAddr = tableData.map(d => d.deviceMacAddresses)
    return _.concat(otherUsedMacAddrs, currentUsedMacAddr)
  }

  let usedMacAddrs = getUsedAddress()

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
    render: (data, row) => <Button
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
          usedMacAddrs={usedMacAddrs}
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


interface WiredRulesTableEntry {
  name: string,
  fencingRange: string,
  closestApMac: string,
  deviceMacAddresses: string[]
}

interface WiredRulesModalProps {
  visible: boolean,
  setVisible: (v: boolean) => void,
  existedRules: WiredRulesTableEntry[],
  handleUpdate: (data: WiredRulesTableEntry) => void
}

const WiredRulesModal = (props: WiredRulesModalProps) => {
  const { $t } = useIntl()
  const { Option } = Select

  const [form] = Form.useForm()
  const { visible, setVisible, handleUpdate, existedRules } = props
  const [disabledAddBtn, setDisableAddBtn] = useState(true)
  const [macAddrs, setMacAddrs] = useState<DeviceMacAddressTableEntry[]>([])
  const [usedMacAddrs, setUsedMacAddrs] = useState<string[]>([])
  const [conflictMacAddes, setConflictMacAddes] = useState('')
  const { venueAps } = useContext(BonjourFencingServiceContext)

  useEffect(() => {
    let usedMac: string[] = []
    if (existedRules) {
      existedRules.forEach(r => {
        usedMac = _.concat(usedMac, r.deviceMacAddresses)
      })
    }

    setUsedMacAddrs(usedMac)

  }, [existedRules])

  const handleAddMacAddrs = (macAddrs: DeviceMacAddressTableEntry[]) => {
    setMacAddrs(macAddrs)
    const macList = macAddrs.map(addrEntry => addrEntry.deviceMacAddresses)
    form.setFieldValue('deviceMacAddresses', macList)
    validateFormData()
  }

  const validateFormData = () => {
    const { name, closestApMac='', deviceMacAddresses=[] } = form.getFieldsValue()


    const isClosestApConflict = !!closestApMac && _.includes(deviceMacAddresses, closestApMac)
    const isValid = (!!name && deviceMacAddresses.length > 0 &&
      !!closestApMac && !isClosestApConflict)

    setConflictMacAddes(isClosestApConflict? closestApMac : '')

    setDisableAddBtn(!isValid)
  }

  const content = <Form
    form={form}
    layout='vertical'
    initialValues={{}}
    onFieldsChange={validateFormData}
  >
    <Form.Item
      required
      name='name'
      label={$t({ defaultMessage: 'Rule Name' })}
      style={{ width: '280px' }}
      children={<Input />}
      rules={[
        { min: 2 },
        { max: 32 },
        { required: true }
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
            const isUsed = false//usedServices.includes(key)
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
            defaultMessage: 'The MAC Address list can\'t contain the Closest AP MAC address.{br}{apName}:[{apMac}]'
          }, {
            br: <br/>,
            apName: _.find(venueAps, (ap) => (ap.apMac === conflictMacAddes))?.name,
            apMac: conflictMacAddes
          })}
        </div>
      }
    />
  </Form>

  const resetFormData = () => {
    form.resetFields()
    setMacAddrs([])
  }

  const handleOK = () => {
    const data = form.getFieldsValue()
    handleUpdate(data)
    resetFormData()
    setDisableAddBtn(true)
  }

  const handleCancel = () => {
    setVisible(false)
    resetFormData()
    setDisableAddBtn(true)
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Wired Connection' })}
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

interface WiredRulesTableProps {
  tableData: WiredRulesTableEntry[],
  tableDataChanged:(data: WiredRulesTableEntry[]) => void,
  style?: CSSProperties
}

const WiredRulesTable = (props: WiredRulesTableProps) => {
  const { $t } = useIntl()
  const { tableData, tableDataChanged, style } = props
  const [ showWiredRuleModal, setShowWiredRuleModal ] = useState(false)

  const { venueAps } = useContext(BonjourFencingServiceContext)

  const handleAdd = () => {
    setShowWiredRuleModal(true)
  }

  const handleDelete = (ruleName: string) => {
    const newData = tableData.filter( d => d.name !== ruleName )
    tableDataChanged(newData)
  }

  const columns: TableProps<WiredRulesTableEntry>['columns'] = [{
    title: $t({ defaultMessage: 'Name' }),
    dataIndex: 'name',
    key: 'name'
  }, {
    title: $t({ defaultMessage: 'Fencing Range' }),
    dataIndex: 'fencingRange',
    key: 'fencingRange',
    render: function (data) {
      return (data === 'SAME_AP')?
        $t({ defaultMessage: 'Same AP' }) : $t({ defaultMessage: '1-hop AP neighbors' })
    }
  }, {
    title: $t({ defaultMessage: 'MAC Address' }),
    dataIndex: 'deviceMacAddresses',
    key: 'deviceMacAddresses',
    render: function (data, row) {
      const { deviceMacAddresses: macAddrs } = row
      return macAddrs.map(d => <div>{d}</div>)
    }
  }, {
    title: $t({ defaultMessage: 'Closest AP' }),
    dataIndex: 'closestApMac',
    key: 'closestApMac',
    render: function (data) {
      const ap = _.find(venueAps, (ap) => ap.apMac === data)
      return ap?.name || data
    }
  }, {
    key: 'action',
    dataIndex: 'action',
    render: (data, row) => <Button
      key='delete'
      role='deleteBtn'
      ghost={true}
      icon={<DeleteOutlinedIcon />}
      style={{ height: '16px' }}
      onClick={() => handleDelete(row.name)}
    />
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAdd
  }]

  const addTableData = (data: WiredRulesTableEntry) => {
    const newData = [ ...tableData ]
    newData.push(data)
    tableDataChanged(newData)
    setShowWiredRuleModal(false)
  }

  return <Form.Item
    name='wiredRules'
    style={style}
    required
    label={$t({ defaultMessage: 'Fencing Rule' })}
    children={<>
      <WiredRulesModal
        visible={showWiredRuleModal}
        setVisible={setShowWiredRuleModal}
        existedRules={tableData}
        handleUpdate={addTableData}
      />
      <Table
        rowKey='name'
        type='form'
        columns={columns}
        dataSource={tableData}
        actions={actions}
      />
    </>}
  />
}

export const WiredConnectionFieldset = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const { currentService } = useContext(BonjourFencingServiceContext)

  const [ tableData, setTableData ] = useState<WiredRulesTableEntry[]>([])

  useEffect(() => {
    const wiredRules = currentService?.wiredRules || []
    //console.log('===== set WiredConnectFieldset data =====')
    //console.log(wiredRules)
    setTableData(wiredRules)
  }, [ currentService ] )

  const handleTableDataChanged = (data: WiredRulesTableEntry[]) => {
    setTableData(data)

    form.setFieldValue('wiredRules', data)
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
