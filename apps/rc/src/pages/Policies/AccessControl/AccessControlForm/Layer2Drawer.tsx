import React, { ReactNode, SetStateAction, useEffect, useRef, useState } from 'react'

import { Form, FormItemProps, Input, Select, Tag } from 'antd'
import TextArea                                    from 'antd/lib/input/TextArea'
import _                                           from 'lodash'
import { useIntl }                                 from 'react-intl'
import styled                                      from 'styled-components/macro'

import {
  Button,
  Drawer,
  GridCol,
  GridRow,
  showToast,
  Table,
  TableProps
} from '@acx-ui/components'
import { DeleteSolid, DownloadOutlined } from '@acx-ui/icons'
import {
  useAddL2AclPolicyMutation,
  useGetL2AclPolicyQuery,
  useL2AclPolicyListQuery,
  useUpdateL2AclPolicyMutation
} from '@acx-ui/rc/services'
import {
  AccessStatus,
  CommonResult,
  defaultSort,
  MacAddressFilterRegExp,
  sortProp
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { PROFILE_MAX_COUNT_LAYER2_POLICY } from '../constants'

import { AddModeProps, editModeProps } from './AccessControlForm'

const { useWatch } = Form
const { Option } = Select

export interface Layer2DrawerProps {
  inputName?: string[]
  onlyViewMode?: {
    id: string,
    viewText: string
  },
  isOnlyViewMode?: boolean,
  onlyAddMode?: AddModeProps,
  editMode?: editModeProps,
  setEditMode?: (editMode: editModeProps) => void
}

const RuleContentWrapper = styled.div`
  border: 1px solid var(--acx-neutrals-50);
  padding: 10px;
  border-radius: 4px;
`

const DrawerFormItem = (props: FormItemProps) => {
  return (
    <Form.Item
      labelAlign={'left'}
      labelCol={{ span: 5 }}
      style={{ marginBottom: '5px' }}
      {...props} />
  )
}

const AclGridCol = ({ children }: { children: ReactNode }) => {
  return (
    <GridCol col={{ span: 6 }} style={{ marginTop: '6px' }}>
      {children}
    </GridCol>
  )
}

const Layer2Drawer = (props: Layer2DrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const {
    inputName = [],
    onlyViewMode = {} as { id: string, viewText: string },
    isOnlyViewMode = false,
    onlyAddMode = { enable: false, visible: false } as AddModeProps,
    editMode = { id: '', isEdit: false } as editModeProps,
    setEditMode = () => {}
  } = props
  const inputRef = useRef(null)
  const [visible, setVisible] = useState(onlyAddMode.enable ? onlyAddMode.visible : false)
  const [localEditMode, setLocalEdiMode] = useState(
    { id: '', isEdit: false } as editModeProps
  )
  const [ruleDrawerVisible, setRuleDrawerVisible] = useState(false)
  const [addressTags, setAddressTags] = useState([] as string[])
  const [inputValue, setInputValue] = useState('')
  const [queryPolicyId, setQueryPolicyId] = useState('')
  const [queryPolicyName, setQueryPolicyName] = useState('')
  const [requestId, setRequestId] = useState('')
  const [skipFetch, setSkipFetch] = useState(true)
  const form = Form.useFormInstance()
  const [contentForm] = Form.useForm()
  const MAC_ADDRESS_LIMIT = 128

  const [
    accessStatus,
    policyName,
    description,
    l2AclPolicyId
  ] = [
    useWatch<string>('layer2Access', contentForm),
    useWatch<string>('policyName', contentForm),
    useWatch<string>('description', contentForm),
    useWatch<string>([...inputName, 'l2AclPolicyId'])
  ]

  const [ createL2AclPolicy ] = useAddL2AclPolicyMutation()

  const [ updateL2AclPolicy ] = useUpdateL2AclPolicyMutation()

  const { layer2SelectOptions, layer2List } = useL2AclPolicyListQuery({
    params: { ...params, requestId: requestId }
  }, {
    selectFromResult ({ data }) {
      return {
        layer2SelectOptions: data ? data.map(
          item => {
            return <Option key={item.id}>{item.name}</Option>
          }) : [],
        layer2List: data ? data.map(item => item.name) : []
      }
    }
  })

  const { data: layer2PolicyInfo } = useGetL2AclPolicyQuery(
    {
      params: { ...params, l2AclPolicyId: isOnlyViewMode ? onlyViewMode.id : l2AclPolicyId }
    },
    { skip: skipFetch }
  )

  const isViewMode = () => {
    if (queryPolicyId === '') {
      return false
    }

    if (editMode.isEdit || localEditMode.isEdit) {
      return false
    }

    return !_.isNil(layer2PolicyInfo)
  }

  useEffect(() => {
    setSkipFetch(!isOnlyViewMode && (l2AclPolicyId === '' || l2AclPolicyId === undefined))
  }, [isOnlyViewMode, l2AclPolicyId])

  useEffect(() => {
    if (editMode.isEdit && editMode.id !== '') {
      setVisible(true)
      setQueryPolicyId(editMode.id)
    }
  }, [editMode])

  useEffect(() => {
    if (layer2PolicyInfo && (isViewMode() || editMode.isEdit || localEditMode.isEdit)) {
      contentForm.setFieldValue('policyName', layer2PolicyInfo.name)
      contentForm.setFieldValue('description', layer2PolicyInfo.description)
      contentForm.setFieldValue('layer2Access', layer2PolicyInfo.access)
      setMacAddressList(layer2PolicyInfo.macAddresses.map(address => ({
        macAddress: address
      })))
    }
  }, [layer2PolicyInfo, queryPolicyId])

  // use policyName to find corresponding id before API return profile id
  useEffect(() => {
    if (requestId && queryPolicyName) {
      layer2SelectOptions.map(option => {
        if (option.props.children === queryPolicyName) {
          if (!onlyAddMode.enable) {
            form.setFieldValue([...inputName, 'l2AclPolicyId'], option.key)
          }
          setQueryPolicyId(option.key as string)
          setQueryPolicyName('')
          setRequestId('')
        }
      })
    }
  }, [layer2SelectOptions, requestId, policyName])

  useEffect(() => {
    if (onlyAddMode.enable && onlyAddMode.visible) {
      setVisible(onlyAddMode.visible)
    }
  }, [onlyAddMode])

  const [macAddressList, setMacAddressList] = useState([] as { macAddress: string }[])

  const basicColumns: TableProps<{ macAddress: string }>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      key: 'macAddress',
      searchable: true,
      sorter: { compare: sortProp('macAddress', defaultSort) },
      render: (_, row: { macAddress: string }) => {
        return row.macAddress
      }
    },
    {
      dataIndex: 'macAddress',
      key: 'macAddress',
      align: 'right',
      render: (_, row: { macAddress: string }) => {
        return <div>
          { !isViewMode() && <DeleteSolid
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
    contentForm.setFieldValue('description', undefined)
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
    if (editMode.isEdit) {
      setEditMode({
        id: '', isEdit: false
      })
    }
    if (localEditMode.isEdit) {
      setLocalEdiMode({
        id: '', isEdit: false
      })
    }
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

  const invalidateMacToast = () => {
    showToast({
      type: 'error',
      duration: 10,
      content: $t({ defaultMessage: 'invalided or existing MAC Address has been found' })
    })
  }

  const handleInputChange = async (event: { target: { value: SetStateAction<string> } }) => {
    const split = [',', ';']
    let inputValue = event.target.value
    for (const char of split) {
      let inputValueString = inputValue.toString()
      if (!inputValueString.includes(char)) {
        continue
      }

      let inputValues = inputValueString.split(char).map(async (inputValue) => {
        const trimValue = inputValue.trim()
        const macAddressValidation = await MacAddressFilterRegExp(trimValue)
        if (addressTags.indexOf(trimValue) === -1 && macAddressValidation === undefined) {
          return Promise.resolve(trimValue)
        }
        return Promise.reject()
      })
      const results = await Promise.allSettled(inputValues)
      const addAddressTags = results.filter(result => {
        return result.status === 'fulfilled' && result.value !== ''
      }).map(result=> (result as { status: 'fulfilled', value: string }).value)

      if (results.findIndex(result => result.status === 'rejected') !== -1) {
        invalidateMacToast()
      }
      setAddressTags([...addressTags, ...addAddressTags])
      inputValue = ''
    }

    setInputValue(inputValue)
  }

  const handleInputConfirm = async (inputValue: string) => {
    if (!inputValue || !ruleDrawerVisible) return

    try {
      const macAddressValidation = await MacAddressFilterRegExp(inputValue)
      // eslint-disable-next-line max-len
      if (inputValue && addressTags.indexOf(inputValue) === -1 && macAddressValidation === undefined) {
        await new Promise((resolve) => {
          setAddressTags([...addressTags, inputValue])
          return resolve
        })
      } else {
        invalidateMacToast()
      }
      setInputValue('')
    } catch (e) {
      console.log(e) // eslint-disable-line no-console
    }
  }

  const actions = !isViewMode() ? [{
    label: $t({ defaultMessage: 'Add' }),
    onClick: handleAddAction
  }, {
    label: $t({ defaultMessage: 'Clear list' }),
    onClick: handleClearAction
  }] : []

  const convertToPayload = (policyId?: string) => {
    let id = {}
    if (policyId) {
      id = { id: policyId }
    }
    let payload = {
      name: policyName,
      access: accessStatus,
      macAddresses: macAddressList.map((item: { macAddress: string }) =>
        item.macAddress
      ),
      description: description
    }

    return {
      ...id,
      ...payload
    }
  }

  const handleL2AclPolicy = async (edit: boolean) => {
    try {
      if (!edit) {
        const l2AclRes: CommonResult = await createL2AclPolicy({
          params: params,
          payload: convertToPayload()
        }).unwrap()
        // let responseData = l2AclRes.response as {
        //   [key: string]: string
        // }
        // form.setFieldValue('l2AclPolicyId', responseData.id)
        // setQueryPolicyId(responseData.id)
        setRequestId(l2AclRes.requestId)
        setQueryPolicyName(policyName)
      } else {
        await updateL2AclPolicy({
          params: { ...params, l2AclPolicyId: queryPolicyId },
          payload: convertToPayload(queryPolicyId)
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const content = <>
    <Form layout='horizontal' form={contentForm}>
      <DrawerFormItem
        name={'policyName'}
        label={$t({ defaultMessage: 'Policy Name:' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 32 },
          { validator: (_, value) => {
            if (layer2List && layer2List
              .filter(layer2 => editMode ? (layer2PolicyInfo?.name !== layer2) : true)
              .findIndex(layer2 => layer2 === value) !== -1) {
              return Promise.reject($t({
                defaultMessage: 'A policy with that name already exists'
              }))
            }
            return Promise.resolve()}
          }
        ]}
        children={<Input disabled={isViewMode()}/>}
      />
      <DrawerFormItem
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        rules={[
          { max: 255 }
        ]}
        children={<TextArea disabled={isViewMode()} />}
      />
      <DrawerFormItem
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
      </DrawerFormItem>
    </Form>
    <Form layout='vertical' form={contentForm}>
      <Form.Item
        name='layer2AccessMacAddress'
        label={$t(
          { defaultMessage: 'MAC Address ( {count}/{count_limit} )' },
          { count: macAddressList.length, count_limit: MAC_ADDRESS_LIMIT })
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
          actions={filterByAccess(actions)}
        />
      </Form.Item>
    </Form>
  </>


  const tagChild = addressTags.map((tag: string) => {
    return (
      <span key={tag} style={{ display: 'inline-block', marginBottom: '7px' }}>
        <Tag
          data-testid={`${tag}_tag`}
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

  const modeContent = () => {
    if (onlyAddMode.enable) {
      return null
    }

    if (isOnlyViewMode) {
      return <Button
        type='link'
        size={'small'}
        onClick={() => {
          setVisible(true)
          setQueryPolicyId(onlyViewMode.id)
        }
        }>
        {onlyViewMode.viewText}
      </Button>
    }

    return <GridRow style={{ width: '350px' }}>
      <GridCol col={{ span: 12 }}>
        <Form.Item
          name={[...inputName, 'l2AclPolicyId']}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please select Layer 2 profile' })
          }]}
          children={
            <Select
              style={{ width: '150px' }}
              placeholder={$t({ defaultMessage: 'Select profile...' })}
              onChange={(value) => {
                setQueryPolicyId(value)
              }}
              children={layer2SelectOptions}
            />
          }
        />
      </GridCol>
      <AclGridCol>
        <Button type='link'
          disabled={!l2AclPolicyId}
          onClick={() => {
            if (l2AclPolicyId) {
              setVisible(true)
              setQueryPolicyId(l2AclPolicyId)
              setLocalEdiMode({ id: l2AclPolicyId, isEdit: true })
            }
          }
          }>
          {$t({ defaultMessage: 'Edit Details' })}
        </Button>
      </AclGridCol>
      <AclGridCol>
        <Button type='link'
          disabled={layer2List.length >= PROFILE_MAX_COUNT_LAYER2_POLICY}
          onClick={() => {
            setVisible(true)
            setQueryPolicyId('')
          }}>
          {$t({ defaultMessage: 'Add New' })}
        </Button>
      </AclGridCol>
    </GridRow>
  }

  return (
    <>
      {modeContent()}
      <Drawer
        title={$t({ defaultMessage: 'Layer 2 Settings' })}
        visible={visible}
        onClose={() => handleLayer2DrawerClose()
        }
        destroyOnClose={true}
        children={content}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            showSaveButton={!isViewMode()}
            onCancel={handleLayer2DrawerClose}
            onSave={async () => {
              try {
                await contentForm.validateFields()
                if (!isViewMode()) {
                  await handleL2AclPolicy(editMode.isEdit || localEditMode.isEdit)
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
                if (!addressTags.length) {
                  showToast({
                    type: 'error',
                    duration: 10,
                    content: $t({ defaultMessage: 'No validate MAC Address could add' })
                  })
                } else {
                  if (macAddressList.length + addressTags.length <= MAC_ADDRESS_LIMIT) {
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
