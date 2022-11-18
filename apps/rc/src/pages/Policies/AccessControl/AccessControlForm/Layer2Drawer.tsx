import React, { SetStateAction, useRef, useState } from 'react'

import { Form, Input, Tag } from 'antd'
import { useIntl }          from 'react-intl'

import { Button, Drawer, showToast, StepsFormInstance, Table, TableProps } from '@acx-ui/components'
import { DeleteSolid, DownloadOutlined }                                   from '@acx-ui/icons'

const { useWatch } = Form

const Layer2Drawer = () => {
  const { $t } = useIntl()
  const inputRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [addressTags, setAddressTags] = useState([] as string[])
  const [inputValue, setInputValue] = useState('')
  const form = Form.useFormInstance()

  console.log(form.getFieldValue(['accessControlComponent', 'layer2', 'macAddressList']))
  console.log(form.getFieldValue('accessControlComponent'))

  const [
    accessStatus
  ] = [
    useWatch<string>(['accessControlComponent', 'layer2', 'access'])
  ]

  const [macAddressList, setMacAddressList] = useState(
    form.getFieldValue(['accessControlComponent', 'layer2', 'macAddressList']) ?? [] as { macAddress: string }[]
  )

  const basicColumns: TableProps<{ macAddress: string }>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      key: 'macAddress',
      searchable: true,
      render: (data, row: { macAddress: string }) => {
        return <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ lineHeight: '21px' }}>{row.macAddress}</span>
          <DeleteSolid height={21} onClick={() => handleDelAction(row.macAddress)} />
        </div>
      }
    }
  ]

  const handleDelAction = (macAddress: string) => {
    const updateAddressList = macAddressList.filter((address: { macAddress: string }) => address.macAddress !== macAddress)
    setMacAddressList(updateAddressList)
  }

  const handleAddAction = () => {
    if (macAddressList.length === 128) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'reached the maximum number of MAC Address' })
      })
    } else {
      setRuleDrawerVisible(true)
      console.log('handle Add action')
    }
  }

  const macAddressRegExp = (value: string) => {
    const re = new RegExp(/^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/)
    return !(value !== '' && !re.test(value))
  }

  const handleClearAction = () => {
    setMacAddressList([])
  }

  const handleRuleDrawerClose = () => {
    setRuleDrawerVisible(false)
    setAddressTags([])
  }

  const handleLayer2DrawerClose = () => {
    setVisible(false)
  }

  const handleTagClose = (removedTag: string) => {
    const updateAddressTags = addressTags.filter((tag) => tag !== removedTag)
    setAddressTags(updateAddressTags)
  }

  const handleInputChange = (event: { target: { value: SetStateAction<string> } }) => {
    setInputValue(event.target.value)
  }
  const handleInputConfirm = () => {
    if (!inputValue || !ruleDrawerVisible) return
    if (inputValue && addressTags.indexOf(inputValue) === -1 && macAddressRegExp(inputValue)) {
      setAddressTags([...addressTags, inputValue])
    } else {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'invalided or existing MAC Address' })
      })
    }
    setInputValue('')
  }

  const actions = [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }, {
    label: $t({ defaultMessage: 'Clear list' }),
    onClick: handleClearAction
  }]

  const content = <Form layout='horizontal'>
    <Form.Item
      name='layer2Access'
      label={$t({ defaultMessage: 'Access' })}
    >
      <div style={{ width: '100%' }}>
        <Button
          onClick={() =>
            form.setFieldValue(['accessControlComponent', 'layer2', 'access'], 'ALLOW')
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: accessStatus === 'ALLOW' ? '#dff0f9' : '#fff'
          }}>
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
        <Button
          onClick={() =>
            form.setFieldValue(['accessControlComponent', 'layer2', 'access'], 'BLOCK')
          }
          style={{
            height: '50px',
            width: '50%',
            borderRadius: '0',
            backgroundColor: accessStatus === 'BLOCK' ? '#dff0f9' : '#fff'
          }}>
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

  const tagChild = addressTags.map((tag: string) => {
    return (
      <span key={tag} style={{ display: 'inline-block', marginBottom: '7px' }}>
        <Tag
          closable
          onClose={(e) => {
            e.preventDefault()
            handleTagClose(tag)
          }}
        >
          {tag}
        </Tag>
      </span>
    )
  })

  const ruleContent = <div>
    {tagChild}
    <Input
      ref={inputRef}
      style={{ width: '100%' }}
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleInputConfirm}
      onPressEnter={handleInputConfirm}
    />
  </div>

  console.log(macAddressList)

  return (
    <>
      <span
        style={{ cursor: 'pointer' }}
        onClick={() => setVisible(true)}>
        {$t({ defaultMessage: 'Change' })}
      </span>
      <Drawer
        title={$t({ defaultMessage: 'Layer 2 Settings' })}
        visible={visible}
        onClose={handleLayer2DrawerClose}
        // destroyOnClose={true}
        children={content}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleLayer2DrawerClose}
            onSave={async (addAnotherRuleChecked: boolean) => {
              try {
                console.log('on save event', addAnotherRuleChecked)
                console.log(form.getFieldValue('accessControlComponent'))
                form.setFieldValue(['accessControlComponent', 'layer2'], {
                  macAddressList: macAddressList
                })
                handleLayer2DrawerClose()
              } catch (error) {
                if (error instanceof Error) throw error
              }
            }}
          />
        }
        width={'530px'}
      />
      <Drawer
        title={$t({ defaultMessage: 'Add MAC Address' })}
        visible={ruleDrawerVisible}
        onClose={handleRuleDrawerClose}
        destroyOnClose={true}
        children={ruleContent}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleRuleDrawerClose}
            onSave={async (addAnotherRuleChecked: boolean) => {
              try {
                if (addressTags.length) {
                  console.log('on save event', addAnotherRuleChecked)
                  setMacAddressList([...macAddressList, ...addressTags.map(tag => {
                    return {
                      macAddress: tag
                    }
                  })])
                  handleRuleDrawerClose()
                }
              } catch (error) {
                if (error instanceof Error) throw error
              }
            }}
          />
        }
        width={'500px'}
      />
    </>
  )
}

export default Layer2Drawer
