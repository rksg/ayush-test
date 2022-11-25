import React, { Dispatch, SetStateAction, useRef, useState } from 'react'

import { Form, Input, Tag } from 'antd'
import { useIntl }          from 'react-intl'

import { Button, Drawer, showToast, Table, TableProps } from '@acx-ui/components'
import { DeleteSolid, DownloadOutlined }                from '@acx-ui/icons'

const { useWatch } = Form

export interface Layer2DrawerObject {
  macAddressList: { macAddress: string }[],
  access: string
}

export interface Layer2DrawerProps {
  fields?: Layer2DrawerObject,
  setFields?: Dispatch<Layer2DrawerObject>
}

const Layer2Drawer = (props: Layer2DrawerProps) => {
  const { $t } = useIntl()
  const { fields, setFields } = props
  const inputRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [addressTags, setAddressTags] = useState([] as string[])
  const [inputValue, setInputValue] = useState('')
  const form = Form.useFormInstance()
  const [contentForm] = Form.useForm()
  const MAC_ADDRESS_LIMIT = 128

  const [
    accessStatus
  ] = [
    useWatch<string>(['accessControlComponent', 'layer2', 'access'])
  ]

  const initMacAddressList = fields && fields.macAddressList
    ? fields.macAddressList
    : form.getFieldValue([
      'accessControlComponent', 'layer2', 'macAddressList'
    ])

  const [macAddressList, setMacAddressList] = useState(
    initMacAddressList ?? [] as { macAddress: string }[]
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
          <DeleteSolid
            data-testid={row.macAddress}
            height={21}
            onClick={() => handleDelAction(row.macAddress)}
          />
        </div>
      }
    }
  ]

  const handleDelAction = (macAddress: string) => {
    const updateAddressList = macAddressList
      .filter((address: { macAddress: string }) => address.macAddress !== macAddress)
    setMacAddressList(updateAddressList)
  }

  const handleAddAction = () => {
    if (macAddressList.length === MAC_ADDRESS_LIMIT) {
      showToast({
        type: 'error',
        duration: 10,
        content: $t({ defaultMessage: 'reached the maximum number of MAC Address' })
      })
    } else {
      setRuleDrawerVisible(true)
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

  const validateAccessStatus = () => {
    if (accessStatus === '' || fields?.access === '') {
      return Promise.reject($t({ defaultMessage: 'Please select one of the status' }))
    }
    return Promise.resolve()
  }

  const validateMacAddressCount = () => {
    if (!macAddressList.length) {
      return Promise.reject($t({ defaultMessage: 'No MAC addresses were added yet' }))
    }
    return Promise.resolve()
  }

  const handleInputChange = (event: { target: { value: SetStateAction<string> } }) => {
    const split = [',', ';']
    let inputValue = event.target.value
    split.forEach(char => {
      if (event.target.value.toString().includes(char)) {
        inputValue = event.target.value.toString().split(char)[0]
        setInputValue(inputValue)
        handleInputConfirm()
        inputValue = ''
      }
    })

    setInputValue(inputValue)
  }

  const handleInputConfirm = () => {
    if (!inputValue || !ruleDrawerVisible) return
    if (inputValue && addressTags.indexOf(inputValue) === -1 && macAddressRegExp(inputValue)) {
      setAddressTags([...addressTags, inputValue])
    } else {
      showToast({
        type: 'error',
        duration: 10,
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

  const content = <>
    <Form layout='horizontal' form={contentForm}>
      <Form.Item
        name='layer2Access'
        label={$t({ defaultMessage: 'Access' })}
        rules={[
          { validator: () => validateAccessStatus() }
        ]}
      >
        {/*TODO: use toggle bottom with subtitle when the component ready in DS */}
        <div style={{ width: '100%' }}>
          <Button
            onClick={() => {
              form && form.setFieldValue(['accessControlComponent', 'layer2', 'access'], 'ALLOW')
              if (fields && setFields) {
                setFields({
                  ...fields,
                  access: 'ALLOW'
                })
              }
            }}
            style={{
              height: '50px',
              width: '50%',
              borderRadius: '0',
              backgroundColor: accessStatus === 'ALLOW' || fields?.access === 'ALLOW'
                ? '#dff0f9'
                : '#fff'
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
            onClick={() => {
              form && form.setFieldValue(['accessControlComponent', 'layer2', 'access'], 'BLOCK')
              if (fields && setFields) {
                setFields({
                  ...fields,
                  access: 'BLOCK'
                })
              }
            }}
            style={{
              height: '50px',
              width: '50%',
              borderRadius: '0',
              backgroundColor: accessStatus === 'BLOCK' || fields?.access === 'BLOCK'
                ? '#dff0f9'
                : '#fff'
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
    </Form>
    <Form layout='vertical' form={contentForm}>
      <Form.Item
        name='layer2AccessMacAddress'
        label={`${$t({ defaultMessage: 'MAC Address' })} ( ${macAddressList.length}/128 )`}
        style={{ flexDirection: 'column' }}
        rules={[
          { validator: () => validateMacAddressCount() }
        ]}
      >
        <Table
          columns={basicColumns}
          dataSource={macAddressList}
          rowKey='macAddress'
          actions={actions}
        />
      </Form.Item>
    </Form>
  </>


  const tagChild = addressTags.map((tag: string) => {
    return (
      <span key={tag} style={{ display: 'inline-block', marginBottom: '7px' }}>
        <Tag
          data-testid={tag}
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

  const ruleContent = <div style={{
    border: '1px solid var(--acx-neutrals-50)',
    padding: '10px',
    borderRadius: '4px'
  }}>
    {tagChild}
    <Input
      ref={inputRef}
      style={{ width: '100%', border: 'none' }}
      value={inputValue}
      placeholder={$t({ defaultMessage: 'Enter MAC addresses, separated by comma or semicolon' })}
      onChange={handleInputChange}
      onBlur={handleInputConfirm}
      onPressEnter={handleInputConfirm}
    />
  </div>

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
        children={content}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleLayer2DrawerClose}
            onSave={async () => {
              try {
                await contentForm.validateFields()
                form && form.setFieldValue(['accessControlComponent', 'layer2'], {
                  macAddressList: macAddressList
                })
                if (fields && setFields) {
                  setFields({
                    ...fields,
                    macAddressList: macAddressList
                  })
                }
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
            onSave={async () => {
              try {
                if (addressTags.length
                  && macAddressList.length + addressTags.length <= MAC_ADDRESS_LIMIT
                ) {
                  setMacAddressList([...macAddressList, ...addressTags.map(tag => {
                    return {
                      macAddress: tag
                    }
                  })])
                } else {
                  showToast({
                    type: 'error',
                    duration: 10,
                    content: $t({ defaultMessage: 'reached the maximum number of MAC Address' })
                  })
                }

                handleRuleDrawerClose()
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
