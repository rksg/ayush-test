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
import { DeleteOutlined }       from '@acx-ui/icons'
import { checkObjectNotExists } from '@acx-ui/rc/utils'
import {
  networkWifiIpRegExp
} from '@acx-ui/rc/utils'

import { DnsProxyContext, DnsProxy } from './ServicesForm'

interface DnsProxyListData {
  cloneList: DnsProxy[] | [],
  dnsModalvisible: boolean,
  editMode: boolean,
  editRow: DnsProxy,
  editModalVisible: boolean,
  ipList: string[],
  disabledSaveBtn: boolean,
  disabledAddBtn: boolean  
}

const state: DnsProxyListData = {
  cloneList: [],
  dnsModalvisible: false,
  editMode: false,
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
  const columns: TableProps<DnsProxy>['columns'] = [{
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
  const { $t } = useIntl()
  const { dnsProxyList, setDnsProxyList } = useContext(DnsProxyContext)
  const [modalState, setModalState] = useState(state)

  useEffect(() => {
    setModalState({
      ...modalState,
      cloneList: dnsProxyList
    })
  }, [])

  const handleUpdateDnsProxy = () => {
    const list = dnsProxyList?.map(item => ({    
      domainName: item.domainName,
      key: item.domainName,
      ipList: item.ipList
    })) || []
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
      editMode: false,
      dnsModalvisible: false
    })
  }

  return (
    <>
      <Button
        type='link'
        style={{ textAlign: 'left', display: 'inline', marginLeft: '15px' }}
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
        onOk={handleUpdateDnsProxy}
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

  const actions: TableProps<(typeof dnsProxyList)[0]>['actions'] = [
    {
      label: intl.$t({ defaultMessage: 'Edit' }),
      onClick: (row: DnsProxy[], clearSelection) => {
        setModalState({
          ...modalState,
          editMode: true,
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
    <DnsProxyModalRuleModal
      {...{ modalState, setModalState }}
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
  modalState: DnsProxyListData,
  setModalState: (data: DnsProxyListData) => void  
}) {
  const intl = useIntl()
  const [form] = Form.useForm()
  const { modalState, setModalState } = props
  const { dnsProxyList, setDnsProxyList } = useContext(DnsProxyContext)

  const resetProxyRuleModal = () => {
    setModalState({
      ...modalState,
      editModalVisible: false,
      editRow: {},
      ipList: [],
      disabledAddBtn: true
    })
    form.resetFields()
  }

  const handleUpdateDnsProxyList = () => {
    const { name } = form.getFieldsValue()
    const updateData = modalState.editMode ? dnsProxyList.map(r => {
      if (r.key === modalState.editRow.key) {
        r = {
          domainName: name,
          key: name,
          ipList: modalState.ipList
        }
      }
      return r
    }) : [
      ...dnsProxyList, {
        domainName: name,
        key: name,
        ipList: modalState.ipList
      }
    ]
    setDnsProxyList(updateData)
    resetProxyRuleModal()
  }

  const handleUpdateIpList = () => {
    setModalState({
      ...modalState,
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
    onFinish={() => {
      setModalState({
        ...modalState,
        editModalVisible: false
      })
    }}
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
          const domainList = dnsProxyList.map(list => list.domainName)
          return checkObjectNotExists(intl, domainList, value, 
            intl.$t({ defaultMessage: 'Domain Name' }), 'domainName')
        } }
        // TODO: validata domain
        // { validator: (_, value) =>  }
      ]}
      initialValue={modalState.editRow?.domainName}
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

  return (<>
    <Button
      type='link'
      style={{ float: 'right' }}
      onClick={() => {
        setModalState({
          ...modalState,
          editModalVisible: true,
          editMode: false
        })
      }}
    >
      {intl.$t({ defaultMessage: 'Add Rule' })}
    </Button>
    <Modal
      title={modalState.editMode
        ? intl.$t({ defaultMessage: 'Edit DNS Proxy Rule' })
        : intl.$t({ defaultMessage: 'Add DNS Proxy Rule' })}
      visible={modalState.editModalVisible}
      width={400}
      centered
      getContainer={false}
      okText={intl.$t({ defaultMessage: 'Save' })}
      onCancel={resetProxyRuleModal}
      onOk={handleUpdateDnsProxyList}
      okButtonProps={{
        disabled: modalState.disabledSaveBtn
      }}
    >
      {formContent}
    </Modal>
  </>
  )  
}
