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
  networkWifiIpRegExp,
  domainNameRegExp,
  checkObjectNotExists,
  checkItemNotIncluded,
  DnsProxyRule
} from '@acx-ui/rc/utils'

import { DnsProxyContext } from './ServicesForm'

interface DnsProxyListData {
  cloneList: DnsProxyRule[] | [],
  dnsModalvisible: boolean,
  editRow: DnsProxyRule,
  editModalVisible: boolean,
  ipList: string[],
  disabledSaveBtn: boolean,
  disabledAddBtn: boolean
}

const state: DnsProxyListData = {
  cloneList: [],
  dnsModalvisible: false,
  editRow: {
    domainName: '',
    key: '',
    ipList: []
  },
  editModalVisible: false,
  ipList: [],
  disabledSaveBtn: true,
  disabledAddBtn: true
}

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<DnsProxyRule>['columns'] = [{
    title: $t({ defaultMessage: 'Domain' }),
    dataIndex: 'domainName',
    key: 'domainName'
  }, {
    title: $t({ defaultMessage: 'IP Addresses' }),
    dataIndex: 'ipList',
    key: 'ipList',
    render: (data) => (data as string[])?.join('; ')
  }]
  return columns
}

export function DnsProxyModal () {
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const { dnsProxyList, setDnsProxyList } = useContext(DnsProxyContext)
  const [modalState, setModalState] = useState(state)

  useEffect(() => {
    setModalState({
      ...modalState,
      cloneList: dnsProxyList
    })
  }, [])

  const handleUpdate = () => {
    form.setFieldsValue({
      dnsProxyRules: dnsProxyList
    })
    const list = dnsProxyList?.map(item => ({
      domainName: item.domainName,
      key: item.domainName,
      ipList: item.ipList
    }))
    setDnsProxyList(list)
    setModalState({
      ...modalState,
      cloneList: list,
      dnsModalvisible: false
    })
  }

  const handleCancel = () => {
    setDnsProxyList(modalState.cloneList)
    setModalState({
      ...modalState,
      editRow: {},
      dnsModalvisible: false
    })
  }

  return (
    <>
      <Button
        type='link'
        style={{ marginInlineStart: '15px' }}
        onClick={() => setModalState({
          ...modalState,
          dnsModalvisible: true
        })}>
        { $t({ defaultMessage: 'Manage' }) }
      </Button>
      <Modal
        title={$t({ defaultMessage: 'DNS Proxy' })}
        visible={modalState.dnsModalvisible}
        centered
        okText={$t({ defaultMessage: 'Add' })}
        onCancel={handleCancel}
        onOk={handleUpdate}
      >
        <MultiSelectTable
          {...{ modalState, setModalState }}
        />
      </Modal>
    </>
  )
}

export function MultiSelectTable (props: {
  modalState: DnsProxyListData,
  setModalState: (data: DnsProxyListData) => void
}) {
  const intl = useIntl()
  const { dnsProxyList, setDnsProxyList } = useContext(DnsProxyContext)
  const { modalState, setModalState } = props

  const rowActions: TableProps<(typeof dnsProxyList)[0]>['rowActions'] = [
    {
      label: intl.$t({ defaultMessage: 'Edit' }),
      onClick: (row: DnsProxyRule[], clearSelection) => {
        setModalState({
          ...modalState,
          editRow: row[0],
          ipList: row[0].ipList ?? [],
          editModalVisible: true
        })
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
    <Button
      type='link'
      style={{ float: 'right' }}
      onClick={() => {
        setModalState({
          ...modalState,
          editModalVisible: true
        })
      }}
    >
      {intl.$t({ defaultMessage: 'Add Rule' })}
    </Button>
    <DnsProxyModalRuleModal
      {...{ modalState, setModalState }}
    />
    <Table
      columns={useColumns()}
      dataSource={dnsProxyList}
      rowActions={rowActions}
      rowKey='domainName'
      rowSelection={{ type: 'checkbox' }}
    />
  </>
  )
}

export function DnsProxyModalRuleModal (props: {
  modalState: DnsProxyListData,
  setModalState: (data: DnsProxyListData) => void
}) {
  const intl = useIntl()
  const [form] = Form.useForm()
  const { modalState, setModalState } = props
  const { dnsProxyList, setDnsProxyList } = useContext(DnsProxyContext)

  const resetRuleModal = () => {
    setModalState({
      ...modalState,
      editModalVisible: false,
      editRow: {},
      ipList: [],
      disabledAddBtn: true
    })
    form.resetFields()
  }

  const handleUpdateRule = () => {
    const { name } = form.getFieldsValue()
    const updateData = modalState.editRow?.key ? dnsProxyList?.map(data => {
      if (data.key === modalState.editRow?.key) {
        data = {
          domainName: name,
          key: name,
          ipList: modalState.ipList
        }
      }
      return data
    }) : [
      ...dnsProxyList, {
        domainName: name,
        key: name,
        ipList: modalState.ipList
      }
    ]
    setDnsProxyList(updateData)
    resetRuleModal()
  }

  const handleUpdateIpList = () => {
    setModalState({
      ...modalState,
      disabledAddBtn: true,
      ipList: [
        ...modalState.ipList,
        form.getFieldValue('ip')
      ]
    })
    form.setFieldsValue({ ip: '' })
  }

  useEffect(()=>{
    form.setFieldsValue({ name: modalState.editRow?.domainName || '' })
  }, [modalState.editRow])

  useEffect(()=>{
    const { name } = form.getFieldsValue()
    const hasNameErrors = form.getFieldError('name').length > 0
    setModalState({
      ...modalState,
      disabledSaveBtn: !(name && !hasNameErrors && modalState.ipList.length > 0)
    })
  }, [modalState.ipList])

  const formContent = <Form
    form={form}
    layout='vertical'
    validateTrigger='onBlur'
    onFieldsChange={() => {
      const { name, ip } = form.getFieldsValue()
      const hasErrors = form.getFieldsError().map(item => item.errors).flat().length > 0
      const hasNameErrors = form.getFieldError('name').length > 0
      const hasIpExisted = modalState.ipList.indexOf(ip) > -1
      setModalState({
        ...modalState,
        disabledSaveBtn: !(name && !hasNameErrors && modalState.ipList.length > 0),
        disabledAddBtn: !(name && ip && !hasErrors && !hasIpExisted)
      })
    }}
  >
    <Form.Item
      label={intl.$t({ defaultMessage: 'Domain Name' })}
      name='name'
      rules={[
        { required: true },
        { validator: (_, value) => {
          const editRowKey = modalState?.editRow?.key
          const domainList = dnsProxyList.filter(list => list.key !== editRowKey)
            .map(list => list.domainName)
          return checkObjectNotExists(domainList, value,
            intl.$t({ defaultMessage: 'Domain Name' }), 'domainName')
        } },
        { validator: (_, value) => domainNameRegExp(value) },
        { validator: (_, value) => {
          const excludedDomain = ['my.ruckus', 'scg.ruckuswireless.com']
          return checkItemNotIncluded(excludedDomain, value.toLowerCase(),
            intl.$t({ defaultMessage: 'Domain Name' }),
            excludedDomain.map(item => `"${item}"`).join(' or '))
        } }
      ]}
      children={<Input />}
    />
    <Form.Item
      label={intl.$t({ defaultMessage: 'IP Addresses' })}
      name='ip'
      rules={[
        { required: true },
        { validator: (_, value) => networkWifiIpRegExp(value) }
      ]}
      validateFirst
      children={<Input />}
    />
    <Button
      type='link'
      style={{ display: 'flex', marginLeft: 'auto' }}
      onClick={handleUpdateIpList}
      disabled={modalState.disabledAddBtn}
    >
      {intl.$t({ defaultMessage: 'Add' })}
    </Button>
    {
      modalState.ipList.length ? <List
        itemLayout='horizontal'
        dataSource={modalState.ipList}
        renderItem={(item: string, index: number) => (
          <List.Item
            actions={[<Button
              key='delete'
              role='deleteBtn'
              ghost={true}
              icon={<DeleteOutlined />}
              onClick={() => {
                setModalState({
                  ...modalState,
                  ipList: modalState.ipList.filter((item, idx) => idx !== index)
                })
              }}
            />]}
          >
            {item}
          </List.Item>
        )}
      /> : intl.$t({ defaultMessage: 'No IP Addresses' })
    }

  </Form>

  return (<Modal
    title={modalState.editRow?.key
      ? intl.$t({ defaultMessage: 'Edit DNS Proxy Rule' })
      : intl.$t({ defaultMessage: 'Add DNS Proxy Rule' })}
    visible={modalState.editModalVisible}
    width={400}
    centered
    getContainer={false}
    okText={intl.$t({ defaultMessage: 'Save' })}
    onCancel={resetRuleModal}
    onOk={handleUpdateRule}
    okButtonProps={{
      disabled: modalState.disabledSaveBtn
    }}
  >
    {formContent}
  </Modal>)
}
