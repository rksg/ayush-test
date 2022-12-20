import React, { SetStateAction, useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select, Tag } from 'antd'
import _                                      from 'lodash'
import { useIntl }                            from 'react-intl'
import styled, { css }                        from 'styled-components/macro'

import { Button, Drawer, showToast, Table, TableProps }                               from '@acx-ui/components'
import { DeleteSolid, DownloadOutlined }                                              from '@acx-ui/icons'
import { useAddL2AclPolicyMutation, useGetL2AclPolicyQuery, useL2AclPolicyListQuery } from '@acx-ui/rc/services'
import { CommonResult }                                                               from '@acx-ui/rc/utils'
import { useParams }                                                                  from '@acx-ui/react-router-dom'

const { useWatch } = Form
const { Option } = Select

export enum AccessStatus {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK'
}

export interface Layer2DrawerObject {
  l2AclPolicyId: string
}

export interface Layer2DrawerProps {
  inputName?: string[]
}

const RuleContentWrapper = styled.div`
  border: 1px solid var(--acx-neutrals-50);
  padding: 10px;
  border-radius: 4px;
`

const ViewDetailsWrapper = styled.span<{ $policyId: string }>`
  ${props => props.$policyId
    ? css`cursor: pointer;`
    : css`cursor: not-allowed; color: darkgray;`}
`

const Layer2Drawer = (props: Layer2DrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { inputName = [] } = props
  const inputRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [addressTags, setAddressTags] = useState([] as string[])
  const [inputValue, setInputValue] = useState('')
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [requestId, setRequestId] = useState('')
  const form = Form.useFormInstance()
  const [contentForm] = Form.useForm()
  const MAC_ADDRESS_LIMIT = 128

  const [
    accessStatus,
    policyName,
    l2AclPolicyId
  ] = [
    useWatch<string>('layer2Access', contentForm),
    useWatch<string>('policyName', contentForm),
    useWatch<string>([...inputName, 'l2AclPolicyId'])
  ]

  const [ createL2AclPolicy ] = useAddL2AclPolicyMutation()

  const { layer2SelectOptions, layer2List } = useL2AclPolicyListQuery({
    params: { ...params, requestId: requestId },
    payload: {
      fields: ['name', 'id'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    }
  }, {
    selectFromResult ({ data }) {
      return {
        layer2SelectOptions: data?.data?.map(
          item => {
            return <Option key={item.id}>{item.name}</Option>
          }) ?? [],
        layer2List: data?.data?.map(item => item.name)
      }
    }
  })

  const { data: layer2PolicyInfo } = useGetL2AclPolicyQuery(
    {
      params: { ...params, l2AclPolicyId: l2AclPolicyId }
    },
    { skip: l2AclPolicyId === '' || l2AclPolicyId === undefined }
  )

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    return !_.isNil(layer2PolicyInfo)
  }

  useEffect(() => {
    if (isViewMode() && layer2PolicyInfo) {
      contentForm.setFieldValue('policyName', layer2PolicyInfo.name)
      contentForm.setFieldValue('layer2Access', layer2PolicyInfo.access)
      setMacAddressList(layer2PolicyInfo.macAddresses.map(address => ({
        macAddress: address
      })))
    }
  }, [layer2PolicyInfo, queryPolicyId])

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
          { _.isNil(layer2PolicyInfo) && <DeleteSolid
            data-testid={row.macAddress}
            height={21}
            onClick={() => handleDelAction(row.macAddress)}
          /> }
        </div>
      }
    }
  ]

  const handleDelAction = (macAddress: string) => {
    const updateAddressList = macAddressList
      .filter((address: { macAddress: string }) => address.macAddress !== macAddress)
    setMacAddressList(updateAddressList)
  }

  const clearFieldsValue = () => {
    contentForm.setFieldValue('policyName', undefined)
    contentForm.setFieldValue('layer2Access', undefined)
    setMacAddressList([])
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
    setQueryPolicyId('')
    clearFieldsValue()
  }

  const handleTagClose = (removedTag: string) => {
    const updateAddressTags = addressTags.filter((tag) => tag !== removedTag)
    setAddressTags(updateAddressTags)
  }

  const validateAccessStatus = () => {
    if (accessStatus === undefined) {
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
        handleInputConfirm(inputValue)
        inputValue = ''
      }
    })

    setInputValue(inputValue)
  }

  const handleInputConfirm = (inputValue: string) => {
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

  const actions = !isViewMode() ? [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }, {
    label: $t({ defaultMessage: 'Clear list' }),
    onClick: handleClearAction
  }] : []

  const handleL2AclPolicy = async (edit: boolean) => {
    try {
      if (!edit) {
        const l2AclRes: CommonResult = await createL2AclPolicy({
          params: params,
          payload: {
            name: policyName,
            access: accessStatus,
            macAddresses: macAddressList.map((item: { macAddress: string }) =>
              item.macAddress
            ),
            description: null
          }
        }).unwrap()
        let responseData = l2AclRes.response as {
          [key: string]: string
        }
        form.setFieldValue('l2AclPolicyId', responseData.id)
        setQueryPolicyId(responseData.id)
        setRequestId(l2AclRes.requestId)
      }
    } catch(error) {
      const responseData = error as { status: number, data: { [key: string]: string } }
      showToast({
        type: 'error',
        duration: 10,
        content: $t({ defaultMessage: 'An error occurred: {error}' }, {
          error: responseData.data.error
        })
      })
    }
  }

  const content = <>
    <Form layout='horizontal' form={contentForm}>
      <Form.Item
        name={'policyName'}
        label={$t({ defaultMessage: 'Policy Name:' })}
        rules={[
          { required: true,
            validator: (_, value) => {
              if (layer2List && layer2List.find(layer2 => layer2 === value)) {
                return Promise.reject($t({
                  defaultMessage: 'A policy with that name already exists'
                }))
              }
              return Promise.resolve()}
          }
        ]}
        labelCol={{ span: 5 }}
        labelAlign={'left'}
        children={<Input disabled={isViewMode()}/>}
      />
      <Form.Item
        name='layer2Access'
        label={$t({ defaultMessage: 'Access' })}
        labelCol={{ span: 5 }}
        labelAlign={'left'}
        rules={[
          { validator: () => validateAccessStatus() }
        ]}
      >
        {/*TODO: use toggle bottom with subtitle when the component ready in DS */}
        <div style={{ width: '100%' }}>
          <Button
            onClick={() => {
              contentForm.setFieldValue('layer2Access', AccessStatus.ALLOW)
            }}
            disabled={isViewMode()}
            style={{
              height: '50px',
              width: '50%',
              borderRadius: '0',
              // eslint-disable-next-line max-len
              backgroundColor: accessStatus === AccessStatus.ALLOW
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
              contentForm.setFieldValue('layer2Access', AccessStatus.BLOCK)
            }}
            disabled={isViewMode()}
            style={{
              height: '50px',
              width: '50%',
              borderRadius: '0',
              // eslint-disable-next-line max-len
              backgroundColor: accessStatus === AccessStatus.BLOCK
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
        label={$t(
          { defaultMessage: 'MAC Address ( {count}/128 )' },
          { count: macAddressList.length })
        }
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

  const ruleContent = <RuleContentWrapper>
    {tagChild}
    <Input
      ref={inputRef}
      style={{ width: '100%', border: 'none' }}
      value={inputValue}
      placeholder={$t({ defaultMessage: 'Enter MAC addresses, separated by comma or semicolon' })}
      onChange={handleInputChange}
      onBlur={() => handleInputConfirm(inputValue)}
      onPressEnter={() => handleInputConfirm(inputValue)}
    />
  </RuleContentWrapper>

  return (
    <>
      <Row justify={'space-between'} style={{ width: '300px' }}>
        <Col span={12} style={{ textAlign: 'center' }}>
          <Form.Item
            name={[...inputName, 'l2AclPolicyId']}
            rules={[{
              message: $t({ defaultMessage: 'Please select Layer 2 profile' })
            }]}
            children={
              <Select
                placeholder={$t({ defaultMessage: 'Select profile...' })}
                onChange={(value) => {
                  setQueryPolicyId(value)
                  // contentForm.setFieldValue('l2AclPolicyId', value)
                }}
                children={layer2SelectOptions}
              />
            }
          />
        </Col>
        <Col span={6} style={{ textAlign: 'center' }}>
          <ViewDetailsWrapper $policyId={l2AclPolicyId}
            onClick={() => {
              if (l2AclPolicyId) {
                setVisible(true)
                setQueryPolicyId(l2AclPolicyId)
              }
            }}>
            {$t({ defaultMessage: 'View Details' })}
          </ViewDetailsWrapper>
        </Col>
        <Col span={5} style={{ textAlign: 'center' }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setVisible(true)
              setQueryPolicyId('')
            }}>
            {$t({ defaultMessage: 'Add New' })}
          </span>
        </Col>
      </Row>
      <Drawer
        title={$t({ defaultMessage: 'Layer 2 Settings' })}
        visible={visible}
        onClose={handleLayer2DrawerClose}
        destroyOnClose={true}
        children={content}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleLayer2DrawerClose}
            onSave={async () => {
              try {
                await contentForm.validateFields()
                if (!isViewMode()) {
                  await handleL2AclPolicy(false)
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
