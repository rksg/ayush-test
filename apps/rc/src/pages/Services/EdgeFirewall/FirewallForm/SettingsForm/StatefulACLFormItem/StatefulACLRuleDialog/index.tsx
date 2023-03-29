import { ReactElement, useEffect } from 'react'

import { QuestionCircleOutlined }                                      from '@ant-design/icons'
import { Form, Input, Space, Modal, Radio, Select, Row, Col, Tooltip } from 'antd'
import TextArea                                                        from 'antd/lib/input/TextArea'
import { IntlShape, useIntl }                                          from 'react-intl'

import { cssStr, Drawer, Fieldset }                                 from '@acx-ui/components'
import { SpaceWrapper }                                             from '@acx-ui/rc/components'
import { AddressType, AccessAction, ProtocolType, StatefulAclRule } from '@acx-ui/rc/utils'

import { StyledFlagFilled } from './styledComponents'

export const getProtocolTypeString = ($t: IntlShape['$t'], type: ProtocolType) => {
  switch (type) {
    case ProtocolType.ANY:
      return $t({ defaultMessage: 'ANY' })
    case ProtocolType.TCP:
      return $t({ defaultMessage: 'TCP' })
    case ProtocolType.UDP:
      return $t({ defaultMessage: 'UDP' })
    case ProtocolType.ICMP:
      return $t({ defaultMessage: 'ICMP' })
    case ProtocolType.IGMP:
      return $t({ defaultMessage: 'IGMP' })
    case ProtocolType.ESP:
      return $t({ defaultMessage: 'ESP' })
    case ProtocolType.AH:
      return $t({ defaultMessage: 'AH' })
    case ProtocolType.SCTP:
      return $t({ defaultMessage: 'SCTP' })
    case ProtocolType.CUSTOM:
      return $t({ defaultMessage: 'Custom' })
    default:
      return ''
  }
}

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

// inbound will not have "inspect"
export const getAccessActionString = ($t: IntlShape['$t'], type: AccessAction) => {
  switch (type) {
    case AccessAction.ALLOW:
      return $t({ defaultMessage: 'Allow' })
    case AccessAction.BLOCK:
      return $t({ defaultMessage: 'Block' })
    case AccessAction.INSPECT:
      return $t({ defaultMessage: 'Inspect' })
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

export const getAddressTypeString = ($t: IntlShape['$t'], type: AddressType) => {
  switch (type) {
    case AddressType.ANY_IP_ADDRESS:
      return $t({ defaultMessage: 'Any IP Address' })
    case AddressType.SUBNET_ADDRESS:
      return $t({ defaultMessage: 'Subnet IP Address' })
    case AddressType.IP_ADDRESS:
      return $t({ defaultMessage: 'IP Address' })
    default:
      return ''
  }
}

export const getAddressTypes = ($t: IntlShape['$t'])
  : Array<{ label: string, value: AddressType }> => {
  return Object.keys(AddressType)
    .map(key => ({
      label: getAddressTypeString($t, key as AddressType),
      value: key as AddressType
    }))
}

export interface StatefulACLRuleDialogProps {
  className?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editMode: boolean;
  editData: StatefulAclRule;
  onSubmit: (newData: StatefulAclRule, isEdit: boolean) => void
}

export const StatefulACLRuleDialog = (props: StatefulACLRuleDialogProps) => {
  const { visible, setVisible, editMode, editData, onSubmit } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const protocolTypes = getProtocolTypes($t)
  const accessActs = getAccessActions($t)
  const addressTypes = getAddressTypes($t)

  const handleSubmit = async () => {
    const data = form.getFieldsValue(true)
    onSubmit(data as StatefulAclRule, editMode)
    form.resetFields()
  }

  const handleClose = () => {
    setVisible(false)
  }

  const footer = [
    <Drawer.FormFooter
      buttonLabel={({
        addAnother: $t({ defaultMessage: 'Add another rule' }),
        save: $t({ defaultMessage: 'Apply' })
      })}
      showAddAnother={!editMode}
      onCancel={handleClose}
      onSave={async (addAnotherRuleChecked: boolean) => {
        form.submit()

        if (!addAnotherRuleChecked) {
          handleClose()
        }
      }}
    />
  ]

  const handleProtocolTypeChange = () => {}

  useEffect(() => {
    if (editMode && visible) {
      form.setFieldsValue(editData)
    }
  }, [editMode, visible])

  // const disableSubmitBtn = false

  return (
    <Modal
      title={editMode ?
        $t({ defaultMessage: 'Edit ACL Rule' }) :
        $t({ defaultMessage: 'Add ACL Rule' })}
      width='30%'
      visible={visible}
      footer={footer}
      onCancel={handleClose}
      maskClosable={false}
      // okButtonProps={{
      //   disabled: disabledOkButton
      // }}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        style={{ height: '100%', overflowY: 'auto' }}
      >
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
        >
          <TextArea
            rows={3}
            maxLength={64}
            placeholder='Enter a short description, up to 255 characters'
          />
        </Form.Item>

        <Form.Item
          name='accessAction'
          label={$t({ defaultMessage: 'Access Action' })}
        >
          <Radio.Group buttonStyle='solid'>
            {accessActs.map(({ label, value, color }) => {
              return <Radio.Button value={value}>
                <SpaceWrapper>
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
        >
          <Select
            onChange={handleProtocolTypeChange}
          >
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
              >
                <Input placeholder='1-255' />
              </Form.Item>
              : ''
          }}
        </Form.Item>

        <Fieldset
          label={$t({ defaultMessage: 'Source' })}
          switchStyle={{ display: 'none' }}
          checked={true}
        >
          <Form.Item name='sourceAddressType'>
            <Radio.Group>
              <Space direction='vertical'>
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
                          return sourceAddressType === AddressType.SUBNET_ADDRESS && <>
                            <Form.Item
                              name='sourceAddress'
                            >
                              <Input placeholder='Network address' />
                            </Form.Item>
                            <Form.Item
                              name='sourceAddressMask'
                            >
                              <Input placeholder='Mask' />
                            </Form.Item>
                          </>
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
                            >
                              <Input />
                            </Form.Item>
                        }}
                      </Form.Item>
                      break
                    default:
                  }

                  return <Row justify='space-between'>
                    <Col span={8}>
                      <Radio value={value}>{label}</Radio>
                    </Col>
                    <Col span={15}>
                      {inputContainer}
                    </Col>
                  </Row>
                })}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name='sourcePort'
            label={$t({ defaultMessage: 'Port' })}
          >
            <Input placeholder='Enter a port number or range (x-xxxx)' />
          </Form.Item>
        </Fieldset>

        <Fieldset
          label={$t({ defaultMessage: 'Destination' })}
          switchStyle={{ display: 'none' }}
          checked={true}
        >
          <Form.Item name='destinationAddressType'>
            <Radio.Group>
              <Space direction='vertical'>
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
                          return destinationAddressType === AddressType.SUBNET_ADDRESS && <>
                            <Form.Item
                              name='destinationAddress'
                            >
                              <Input placeholder='Network address' />
                            </Form.Item>
                            <Form.Item
                              name='destinationAddressMask'
                            >
                              <Input placeholder='Mask' />
                            </Form.Item>

                          </>
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
                          >
                            <Input />
                          </Form.Item>
                        }}
                      </Form.Item>
                      break
                    default:
                  }

                  return <Row justify='space-between'>
                    <Col span={8}>
                      <Radio value={value}>{label}</Radio>
                    </Col>
                    <Col span={15}>
                      {inputContainer}
                    </Col>
                  </Row>
                })}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name='destinationPort'
            label={$t({ defaultMessage: 'Port' })}
          >
            <Input placeholder='Enter a port number or range (x-xxxx)' />
          </Form.Item>
        </Fieldset>
      </Form>
    </Modal>
  )
}