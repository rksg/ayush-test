import { useState, useContext, useEffect } from 'react'

import {
  Form,
  Input,
  List
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Table,
  TableProps,
  Modal
} from '@acx-ui/components'
import { DeleteOutlined } from '@acx-ui/icons'
import {
  networkWifiIpRegExp
} from '@acx-ui/rc/utils'


import { DnsProxyContext, DnsProxy } from './ServicesForm'

const defaultArray: string[] = []

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<DnsProxy>['columns'] = [
    {
      title: $t({ defaultMessage: 'Domain' }),
      dataIndex: 'domainName',
      key: 'domainName'
    },
    {
      title: $t({ defaultMessage: 'IP Addresses' }),
      dataIndex: 'ipList',
      key: 'ipList',
      render: function (data:any) {
        return data?.join('; ')
      }
    }
  ]
  return columns
}

export function DnsProxyModal () {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editRow, setEditRow] = useState([] as DnsProxy[])
  const [cloneList, setCloneList] = useState([] as DnsProxy[])
  const { dnsProxyList, setDnsProxyList } = useContext(DnsProxyContext)

  useEffect(() => {
    setCloneList(dnsProxyList)
  }, [])

  const handleUpdateDnsProxy = () => {
    const list = dnsProxyList?.map(item => ({
      domainName: item.domainName,
      key: item.domainName,
      ipList: item.ipList
    }))
    setCloneList(list)
    setDnsProxyList(list)
    setVisible(false)
  }

  const handleCancel = () => {
    setDnsProxyList(cloneList)
    setEditRow([])
    setEditMode(false)
    setVisible(false)
  }

  return (
    <>
      <Button
        type='link'
        style={{ textAlign: 'left', display: 'inline', marginLeft: '15px' }}
        onClick={() => setVisible(true)}>
        { $t({ defaultMessage: 'Manage' }) }
      </Button>
      <Modal
        title={$t({ defaultMessage: 'DNS Proxy' })}
        visible={visible}
        centered
        okText={$t({ defaultMessage: 'Add' })}
        onCancel={handleCancel}
        onOk={handleUpdateDnsProxy}
      >
        <MultiSelectTable
          {...{ editMode, setEditMode, editRow, setEditRow }}
        />
      </Modal>
    </>
  )
}

export function MultiSelectTable (props: any) {
  const intl = useIntl()
  const { dnsProxyList, setDnsProxyList } = useContext(DnsProxyContext)

  const { editMode, setEditMode, editRow, setEditRow } = props
  const [visible, setVisible] = useState(false)
  const [ipList, setIpList] = useState(defaultArray)

  const actions: TableProps<(typeof dnsProxyList)[0]>['actions'] = [
    {
      label: intl.$t({ defaultMessage: 'Edit' }),
      onClick: (row: DnsProxy[], clearSelection) => {
        setEditMode(true)
        setEditRow(row[0])
        setIpList(row[0]?.ipList)
        setVisible(true)
        clearSelection()
      }
    },
    {
      label: intl.$t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        const keys = rows.map(row => row.domainName)
        setDnsProxyList(dnsProxyList.filter(r => keys.indexOf(r.domainName) === -1))
        clearSelection()
      }
    }
  ]

  return (<>
    <DnsProxyModalRuleModal
      {...{
        visible,
        setVisible,
        ipList,
        setIpList,
        editMode,
        setEditMode,
        editRow,
        setEditRow
      }}
    />
    <Table
      columns={useColumns()}
      dataSource={dnsProxyList}
      actions={actions}
      rowKey='domainName'
      rowSelection={{ type: 'checkbox' }}
    />
  </>
  )
}

export function DnsProxyModalRuleModal (props: {
  visible: boolean,
  ipList: string[],
  editMode: boolean,
  editRow: DnsProxy,
  setVisible: (visible: boolean) => void,
  setIpList: (ipList: string[]) => void,
  setEditRow: (row: DnsProxy | []) => void
  setEditMode: (isEdit: boolean) => void
}) {
  const intl = useIntl()
  const [form] = Form.useForm()
  const { dnsProxyList, setDnsProxyList } = useContext(DnsProxyContext)

  const { visible, ipList, setVisible, setIpList,
    editMode, setEditMode, setEditRow, editRow } = props
  const [disabledBtn, setDisabledBtn] = useState(false)
  const [disabledAddBtn, setDisabledAddBtn] = useState(true)

  const resetProxyRuleModal = () => {
    setVisible(false)
    setEditRow([])
    setIpList(defaultArray)
    setDisabledAddBtn(true)
    form.resetFields()
  }

  const handleUpdateDnsProxyList = () => {
    const { name } = form.getFieldsValue()
    const updateData = editMode ? dnsProxyList.map(r => {
      if (r.key === editRow.key) {
        r = {
          domainName: name,
          key: name,
          ipList: ipList
        }
      }
      return r
    }) : [
      ...dnsProxyList, {
        domainName: name,
        key: name,
        ipList: ipList
      }
    ]
    setDnsProxyList(updateData)
    resetProxyRuleModal()
  }

  const handleUpdateIpList = () => {
    setIpList([
      ...ipList,
      form.getFieldValue('ip')
    ])
  }

  useEffect(()=>{
    form.setFieldsValue({ name: editRow?.domainName || '' })
  }, [editRow])

  useEffect(()=>{
    const { name } = form.getFieldsValue()
    const hasNameErrors = form.getFieldError('name').length > 0
    setDisabledBtn(!(name && !hasNameErrors && ipList.length > 0))
  }, [ipList])

  const formContent = <Form
    form={form}
    layout='vertical'
    validateTrigger='onBlur'
    onFinish={() => setVisible(false)}
    onFieldsChange={() => {
      const { name, ip } = form.getFieldsValue()
      const hasErrors = form.getFieldsError().map(item => item.errors).flat().length > 0
      const hasNameErrors = form.getFieldError('name').length > 0
      setDisabledBtn(!(name && !hasNameErrors && ipList.length > 0))
      setDisabledAddBtn(!(name && ip && !hasErrors))
    }}
  >
    <Form.Item
      label={intl.$t({ defaultMessage: 'Domain Name' })}
      name='name'
      rules={[
        { required: true }
        // TODO
        // { validator: (_, value) =>  }
      ]}
      children={<Input />}
    />
    <Form.Item
      label={intl.$t({ defaultMessage: 'IP Addresses' })}
      name='ip'
      rules={[
        { required: true },
        { validator: (_, value) => networkWifiIpRegExp(intl, value) }
      ]}
      children={<Input />}
    />
    <Button
      type='link'
      style={{ display: 'flex', marginLeft: 'auto' }}
      onClick={handleUpdateIpList}
      disabled={disabledAddBtn}
    >
      {intl.$t({ defaultMessage: 'Add' })}
    </Button>
    {
      ipList.length ? <List
        itemLayout='horizontal'
        dataSource={ipList}
        renderItem={(item, index: number) => (
          <List.Item
            actions={[<Button
              key='delete'
              role='deleteBtn'
              ghost={true}
              icon={<DeleteOutlined />}
              onClick={() => setIpList(ipList.filter((item, idx) => idx !== index))}
            />]}
          >
            {item}
          </List.Item>
        )}
      /> : intl.$t({ defaultMessage: 'No IP Addresses' })
    }

  </Form>

  return (<>
    <Button
      type='link'
      style={{ float: 'right' }}
      onClick={() => {
        setVisible(true)
        setEditMode(false)
      }}
    >
      {intl.$t({ defaultMessage: 'Add Rule' })}
    </Button>
    <Modal
      title={editMode ? intl.$t({ defaultMessage: 'Edit DNS Proxy Rule' })
        : intl.$t({ defaultMessage: 'Add DNS Proxy Rule' })}
      visible={visible}
      width={400}
      centered
      okText={intl.$t({ defaultMessage: 'Save' })}
      onCancel={resetProxyRuleModal}
      onOk={handleUpdateDnsProxyList}
      okButtonProps={{
        disabled: disabledBtn
      }}
    >
      {formContent}
    </Modal>
  </>
  )
}
