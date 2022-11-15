import { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer, showToast, Table, TableProps } from '@acx-ui/components'
import { DeleteSolid, DownloadOutlined }                from '@acx-ui/icons'

const Layer2Drawer = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const [macAddressList, setMacAddressList] = useState([] as { macAddress: string }[])

  const basicColumns: TableProps<{ macAddress: string }>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      key: 'macAddress',
      searchable: true,
      render: (data, row: { macAddress: string }) => {
        return <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ lineHeight: '21px' }}>{row.macAddress}</span>
          <DeleteSolid height={21} onClick={() => handleDelAction(row.macAddress)}/>
        </div>
      }
    }
  ]

  const handleDelAction = (macAddress: string) => {
    const updateAddressList = macAddressList.filter((address) => address.macAddress !== macAddress)
    setMacAddressList(updateAddressList)
  }

  const handleAddAction = () => {
    if (macAddressList.length === 128) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'reached the maximum number of MAC Adress' })
      })
    } else {
      console.log('handle Add action')
      const updateAddressList = [...macAddressList, { macAddress: Math.round(Math.random() * 100).toString() }]
      setMacAddressList(updateAddressList)
    }
  }

  const handleClearAction = () => {
    setMacAddressList([])
  }

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }, {
    label: $t({ defaultMessage: 'Clear list' }),
    onClick: handleClearAction
  }]

  const content = <Form layout='horizontal'
    onFinish={(data) => {
      console.log(data)
      form.resetFields()
    }}>
    <Form.Item
      name='layer2Access'
      label={$t({ defaultMessage: 'Access' })}
    >
      <div style={{ width: '100%' }}>
        <Button style={{ height: '50px', width: '50%', borderRadius: '0' }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <div style={{
            display: 'flex', flexDirection: 'column',
            flexWrap: 'wrap', textAlign: 'left'
          }}>
            <span style={{ fontWeight: 600, fontSize: '12px' }}>
              {$t({ defaultMessage: 'Allow connections' })}
            </span>
            <span style={{ width: '140px', whiteSpace: 'normal', fontSize: '9px' }}>
              {$t({ defaultMessage: 'only from MAC addresses listed below' })}
            </span>
          </div>
        </Button>
        <Button style={{ height: '50px', width: '50%', borderRadius: '0' }}>
          <DownloadOutlined height={50} style={{ width: '40px', height: '40px' }}/>
          <div style={{
            display: 'flex', flexDirection: 'column',
            flexWrap: 'wrap', textAlign: 'left'
          }}>
            <span style={{ fontWeight: 600, fontSize: '12px' }}>
              {$t({ defaultMessage: 'Block connections' })}
            </span>
            <span style={{ width: '140px', whiteSpace: 'normal', fontSize: '9px' }}>
              {$t({ defaultMessage: 'from MAC addresses listed below' })}
            </span>
          </div>
        </Button>
      </div>
    </Form.Item>
    <Form.Item
      name='layer2AccessMacAddress'
      label={`${$t({ defaultMessage: 'MAC Address' })} ( ${macAddressList.length}/128 )`}
      style={{ flexDirection: 'column' }}
    >
    </Form.Item>
    <Table
      columns={basicColumns}
      dataSource={macAddressList}
      rowKey='macAddress'
      actions={actions}
    />
  </Form>

  console.log(macAddressList)

  return (
    <Drawer
      title={$t({ defaultMessage: 'Layer 2 Settings' })}
      visible={true}
      onClose={() => {}}
      destroyOnClose={true}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          onCancel={() => {}}
          onSave={async (addAnotherRuleChecked: boolean) => {
            try {
              console.log('on save event', addAnotherRuleChecked)
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
      width={'530px'}
    />
  )
}

export default Layer2Drawer
