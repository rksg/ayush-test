import { ReactElement, useEffect } from 'react'

import { QuestionCircleOutlined }                                            from '@ant-design/icons'
import { Form, Input, Modal, Radio, Select, Row, Col, Tooltip, InputNumber } from 'antd'
import TextArea                                                              from 'antd/lib/input/TextArea'
import classNames                                                            from 'classnames'
import { IntlShape, useIntl }                                                from 'react-intl'
import styled                                                                from 'styled-components'

import { cssStr, Drawer, Fieldset } from '@acx-ui/components'
import { SpaceWrapper }             from '@acx-ui/rc/components'
import {
  AddressType,
  AccessAction,
  ProtocolType,
  StatefulAclRule,
  subnetMaskIpRegExp,
  getProtocolTypeString,
  getAccessActionString,
  getAddressTypeString,
  ACLDirection,
  networkWifiIpRegExp
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { StyledFlagFilled, ModalStyles } from './styledComponents'

export const getProtocolTypes = ($t: IntlShape['$t'])
  : Array<{ label: string, value: ProtocolType }> => {
  return Object.keys(ProtocolType)
    .map(key => ({
      label: getProtocolTypeString($t, key as ProtocolType),
      value: key as ProtocolType
    }))
}

const getAccessActionColor = (type: AccessAction) => {
  switch (type) {
    case AccessAction.ALLOW:
      // green
      return cssStr('--acx-semantics-green-60')
    case AccessAction.BLOCK:
      // red
      return cssStr('--acx-semantics-red-70')
    case AccessAction.INSPECT:
      // orange
      return cssStr('--acx-accents-orange-50')
    default:
      return ''
  }
}

export const getAccessActions = ($t: IntlShape['$t'])
  : Array<{ label: string, value: AccessAction, color?: string }> => {
  return Object.keys(AccessAction)
    .map((key) => {
      const typedKey = key as AccessAction
      return {
        label: getAccessActionString($t, typedKey),
        value: typedKey,
        color: getAccessActionColor(typedKey)
      }
    })
}

export const getAddressTypes = ($t: IntlShape['$t'])
  : Array<{ label: string, value: AddressType }> => {
  return Object.keys(AddressType)
    .map(key => ({
      label: getAddressTypeString($t, key as AddressType),
      value: key as AddressType
    }))
}

export function portRangeCheck (value: string) {
  if (!value) return Promise.resolve()

  const { $t } = getIntl()
  const splitChar = '-'
  const rangeArray = value.split(splitChar)
  if (rangeArray.length === 1)
    return Promise.reject($t({ defaultMessage: 'Range should be splitted by -' }))

  const start = Number(rangeArray[0])
  const end = Number(rangeArray[1])
  if (isNaN(start) || isNaN(end) || start >= end) {
    return Promise.reject($t({ defaultMessage: 'Invalid port range' }))
  }

  return Promise.resolve()
}

export function portNumberOrRangeCheck (value: string) {
  if (!value) return Promise.resolve()
  const portNum = Number(value)
  const isNotNumber = isNaN(portNum)
  if (isNotNumber) {
    return portRangeCheck(value)
  } else {
    const { $t } = getIntl()
    if (portNum < 1 || portNum > 65535) {
      return Promise.reject($t({ defaultMessage: 'Invalid port number' }))
    } else {
      return Promise.resolve()
    }
  }
}


export interface StatefulACLRuleDialogProps {
  className?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editMode: boolean;
  editData: StatefulAclRule;
  onSubmit: (newData: StatefulAclRule, isEdit: boolean) => void
}

export const StatefulACLRuleDialog = styled((props: StatefulACLRuleDialogProps) => {
  const {
    className,
    visible,
    setVisible,
    editMode,
    editData,
    onSubmit
  } = props
  const { $t } = useIntl()
  const drawerForm = Form.useFormInstance()
  const [form] = Form.useForm()
  const protocolTypes = getProtocolTypes($t)
  const addressTypes = getAddressTypes($t)
  const direction = Form.useWatch('direction', drawerForm)
  const accessActs = getAccessActions($t).filter(
    (o) => direction === ACLDirection.OUTBOUND
            || (direction === ACLDirection.INBOUND && o.value !== AccessAction.INSPECT))

  const handleSubmit = async () => {
    const data = form.getFieldsValue()
    const addAnotherRuleChecked = form.getFieldValue('addAnotherRuleChecked')
    const priority = form.getFieldValue('priority')
    onSubmit({ ...data, priority } as StatefulAclRule, editMode)

    if (addAnotherRuleChecked) {
      form.resetFields()
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const footer = <Drawer.FormFooter
    buttonLabel={({
      addAnother: $t({ defaultMessage: 'Add another rule' }),
      save: $t({ defaultMessage: 'Add' })
    })}
    showAddAnother={!editMode}
    onCancel={handleClose}
    onSave={async (addAnotherRuleChecked: boolean) => {
      form.setFieldValue('addAnotherRuleChecked', addAnotherRuleChecked)
      form.submit()
    }}
  />

  useEffect(() => {
    if (editMode && visible) {
      form.setFieldsValue(editData)
    }
  }, [editMode, visible])

  return (
    <Modal
      className={classNames(className, 'modal-long')}
      title={editMode ?
        $t({ defaultMessage: 'Edit ACL Rule' }) :
        $t({ defaultMessage: 'Add ACL Rule' })}
      width='35%'
      visible={visible}
      footer={footer}
      onCancel={handleClose}
      maskClosable={false}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        style={{ height: '100%' }}
      >
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          rules={[{ max: 255 }]}
        >
          <TextArea
            rows={3}
            maxLength={255}
            placeholder='Enter a short description, up to 255 characters'
          />
        </Form.Item>

        <Form.Item
          name='accessAction'
          label={$t({ defaultMessage: 'Access Action' })}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please select access action' })
          }]}
        >
          <Radio.Group buttonStyle='solid'>
            {accessActs.map(({ label, value, color }) => {
              return <Radio.Button key={value} value={value}>
                <SpaceWrapper full>
                  <StyledFlagFilled color={color} />
                  {label}
                  {value === AccessAction.INSPECT &&
                    <Tooltip
                      placement='topRight'
                      title={
                      // eslint-disable-next-line max-len
                        $t({ defaultMessage: 'Traffic is allowed if outgoing internet traffic matches ACL rule criteria and also creates Flow entry to permit reverse traffic from Internet.' })
                      }
                    >
                      <QuestionCircleOutlined />
                    </Tooltip>
                  }
                </SpaceWrapper>
              </Radio.Button>
            })}
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name='protocolType'
          label={$t({ defaultMessage: 'Protocol Type' })}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please select protocol type' })
          }]}
          initialValue={ProtocolType.ANY}
        >
          <Select>
            {protocolTypes.map(({ label, value }) =>
              (<Select.Option value={value} key={value} children={label} />)
            )}
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => {
            return prevValues.protocolType !== currentValues.protocolType
          }}
        >
          {({ getFieldValue }) => {
            const protocolType = getFieldValue('protocolType')

            return protocolType === ProtocolType.CUSTOM
              ? <Form.Item
                name='protocolValue'
                label={$t({ defaultMessage: 'Protocol Value' })}
                rules={[
                  {
                    required: true,
                    message: $t({ defaultMessage: 'Please enter protocol value' })
                  },
                  { type: 'number', min: 1, max: 255 }
                ]}
              >
                <InputNumber placeholder='1-255' />
              </Form.Item>
              : ''
          }}
        </Form.Item>

        <Fieldset
          label={$t({ defaultMessage: 'Source' })}
          switchStyle={{ display: 'none' }}
          checked={true}
          style={{ marginBottom: cssStr('--acx-content-vertical-space') }}
        >
          <Form.Item
            name='sourceAddressType'
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Please select source address type' })
            }]}
            initialValue={AddressType.ANY_IP_ADDRESS}
          >
            <Radio.Group style={{ width: '100%' }}>
              <SpaceWrapper full direction='vertical' size='large'>
                {addressTypes.map(({ label, value }) => {
                  let inputContainer: ReactElement | undefined

                  switch(value) {
                    case AddressType.SUBNET_ADDRESS:
                      inputContainer = <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => {
                          return prevValues.sourceAddressType !== currentValues.sourceAddressType
                        }}
                      >
                        {({ getFieldValue }) => {
                          const sourceAddressType = getFieldValue('sourceAddressType')
                          return sourceAddressType === AddressType.SUBNET_ADDRESS &&
                          <Form.Item>
                            <Row justify='space-between'>
                              <Col span={12}>
                                <Form.Item
                                  name='sourceAddress'
                                  noStyle
                                  rules={[{
                                    required: true,
                                    message: $t({ defaultMessage: 'Please enter network address' })
                                  },
                                  { validator: (_, value) => networkWifiIpRegExp(value) }
                                  ]}
                                >
                                  <Input placeholder={$t({ defaultMessage: 'Network address' })} />
                                </Form.Item>
                              </Col>
                              <Col span={11}>
                                <Form.Item
                                  name='sourceAddressMask'
                                  noStyle
                                  rules={[
                                    {
                                      required: true,
                                      // eslint-disable-next-line max-len
                                      message: $t({ defaultMessage: 'Please enter address mask' })
                                    },
                                    { validator: (_, value) => subnetMaskIpRegExp(value) }
                                  ]}
                                >
                                  <Input placeholder={$t({ defaultMessage: 'Mask' })} />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Form.Item>
                        }}
                      </Form.Item>
                      break
                    case AddressType.IP_ADDRESS:
                      inputContainer = <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => {
                          return prevValues.sourceAddressType !== currentValues.sourceAddressType
                        }}
                      >
                        {({ getFieldValue }) => {
                          const sourceAddressType = getFieldValue('sourceAddressType')
                          return sourceAddressType === AddressType.IP_ADDRESS &&
                            <Form.Item
                              name='sourceAddress'
                              rules={[{
                                required: true,
                                message: $t({ defaultMessage: 'Please enter IP address' })
                              },
                              { validator: (_, value) => networkWifiIpRegExp(value) }
                              ]}
                            >
                              <Input />
                            </Form.Item>
                        }}
                      </Form.Item>
                      break
                    default:
                  }

                  return <Row key={`srcAddressType_${value}`} justify='space-between'>
                    <Col span={8}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => {
                          // eslint-disable-next-line max-len
                          return prevValues.sourceAddressType !== currentValues.sourceAddressType
                        }}
                      >
                        {({ getFieldValue }) => {
                          const sourceAddressType = getFieldValue('sourceAddressType')
                          return <Radio
                            value={value}
                            className={classNames(
                              // eslint-disable-next-line max-len
                              (value !== AddressType.ANY_IP_ADDRESS && value === sourceAddressType)
                              && 'required'
                            )}
                          >
                            {label}
                          </Radio>
                        }}
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      {inputContainer}
                    </Col>
                  </Row>
                })}
              </SpaceWrapper>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name='sourcePort'
            label={$t({ defaultMessage: 'Port' })}
            rules={[
              {
                validator: (_, value) => portNumberOrRangeCheck(value)
              }
            ]}
          >
            <Input placeholder='Enter a port number or range (x-xxxx)' />
          </Form.Item>
        </Fieldset>

        <Fieldset
          label={$t({ defaultMessage: 'Destination' })}
          switchStyle={{ display: 'none' }}
          checked={true}
        >
          <Form.Item
            name='destinationAddressType'
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Please select destination address type' })
            }]}
            initialValue={AddressType.ANY_IP_ADDRESS}
          >
            <Radio.Group style={{ width: '100%' }}>
              <SpaceWrapper full direction='vertical' size='large'>
                {addressTypes.map(({ label, value }) => {
                  let inputContainer: ReactElement | undefined

                  switch(value) {
                    case AddressType.SUBNET_ADDRESS:
                      inputContainer = <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => {
                          // eslint-disable-next-line max-len
                          return prevValues.destinationAddressType !== currentValues.destinationAddressType
                        }}
                      >
                        {({ getFieldValue }) => {
                          const destinationAddressType = getFieldValue('destinationAddressType')
                          return destinationAddressType === AddressType.SUBNET_ADDRESS &&
                          <Form.Item>
                            <Row justify='space-between'>
                              <Col span={12}>
                                <Form.Item
                                  name='destinationAddress'
                                  noStyle
                                  rules={[{
                                    required: true,
                                    message: $t({ defaultMessage: 'Please enter network address' })
                                  },
                                  { validator: (_, value) => networkWifiIpRegExp(value) }
                                  ]}
                                >
                                  <Input placeholder={$t({ defaultMessage: 'Network address' })} />
                                </Form.Item>
                              </Col>
                              <Col span={11}>
                                <Form.Item
                                  name='destinationAddressMask'
                                  noStyle
                                  rules={[
                                    {
                                      required: true,
                                      message: $t({ defaultMessage: 'Please enter address mask' })
                                    },
                                    { validator: (_, value) => subnetMaskIpRegExp(value) }
                                  ]}
                                >
                                  <Input placeholder={$t({ defaultMessage: 'Mask' })} />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Form.Item>
                        }}
                      </Form.Item>
                      break
                    case AddressType.IP_ADDRESS:
                      inputContainer = <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => {
                          // eslint-disable-next-line max-len
                          return prevValues.destinationAddressType !== currentValues.destinationAddressType
                        }}
                      >
                        {({ getFieldValue }) => {
                          const destinationAddressType = getFieldValue('destinationAddressType')
                          return destinationAddressType === AddressType.IP_ADDRESS &&
                          <Form.Item
                            name='destinationAddress'
                            rules={[{
                              required: true,
                              message: $t({ defaultMessage: 'Please enter IP address' })
                            },
                            { validator: (_, value) => networkWifiIpRegExp(value) }
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        }}
                      </Form.Item>
                      break
                    default:
                  }

                  return <Row key={`desAddressType_${value}`} justify='space-between'>
                    <Col span={8}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => {
                          // eslint-disable-next-line max-len
                          return prevValues.destinationAddressType !== currentValues.destinationAddressType
                        }}
                      >
                        {({ getFieldValue }) => {
                          const destinationAddressType = getFieldValue('destinationAddressType')
                          return <Radio
                            value={value}
                            className={classNames(
                              // eslint-disable-next-line max-len
                              (value !== AddressType.ANY_IP_ADDRESS && value === destinationAddressType)
                              && 'required'
                            )}
                          >
                            {label}
                          </Radio>
                        }}
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      {inputContainer}
                    </Col>
                  </Row>
                })}
              </SpaceWrapper>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name='destinationPort'
            label={$t({ defaultMessage: 'Port' })}
            rules={[
              {
                validator: (_, value) => portNumberOrRangeCheck(value)
              }
            ]}
          >
            <Input placeholder='Enter a port number or range (x-xxxx)' />
          </Form.Item>
        </Fieldset>
      </Form>
    </Modal>
  )
})`${ModalStyles}`