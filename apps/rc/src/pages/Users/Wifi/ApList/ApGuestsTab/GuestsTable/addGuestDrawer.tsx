import { useEffect, useState } from 'react'


import { Checkbox, Col, Divider, Form, Input, InputNumber, Radio, Row, Select } from 'antd'
import { PhoneNumberUtil }                                                      from 'google-libphonenumber'
import _                                                                        from 'lodash'
import { useIntl }                                                              from 'react-intl'
import { useParams }                                                            from 'react-router-dom'

import { Loader, Button, Drawer, cssStr, showActionModal }          from '@acx-ui/components'
import { useLazyGetGuestNetworkListQuery, useAddGuestPassMutation } from '@acx-ui/rc/services'
import {
  excludeExclamationRegExp,
  phoneRegExp,
  emailRegExp,
  NetworkTypeEnum,
  GuestNetworkTypeEnum,
  Network
} from '@acx-ui/rc/utils'

import {
  MobilePhoneSolidIcon,
  EnvelopClosedSolidIcon,
  PrintIcon,
  CheckboxLabel,
  FooterDiv
}   from './styledComponents'

interface AddGuestProps {
    visible: boolean
    setVisible: (visible: boolean) => void
}

const payload = {
  fields: ['name', 'defaultGuestCountry', 'id'],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000,
  filters: {
    nwSubType: [NetworkTypeEnum.CAPTIVEPORTAL],
    captiveType: [GuestNetworkTypeEnum.GuestPass]
  },
  url: '/api/viewmodel/tenant/{tenantId}/network'
}

export function AddGuestDrawer (props: AddGuestProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { visible, setVisible } = props
  const params = useParams()
  const [phoneNumberError, setPhoneNumberError] = useState(true)
  const [emailError, setEmailError] = useState(true)
  const [allowedNetworkList, setAllowedNetworkList] = useState<Network[]>()

  const timeTypeValidPassOptions = [
    { label: 'Hours', value: 'Hour' }, { label: 'Days', value: 'Day' }]

  const examplePhoneNumber = PhoneNumberUtil.getInstance().getExampleNumber('US')

  const [
    addGuestPass
  ] = useAddGuestPassMutation()

  const [getNetworkList] = useLazyGetGuestNetworkListQuery()

  const getAllowedNetworkList = async () => {
    const list = await (getNetworkList({ params, payload }, true).unwrap())
    setAllowedNetworkList(list.data)
  }

  useEffect(() => {
    getAllowedNetworkList()
  }, [])

  const createNumberOfDevicesList = () => {
    const list = []
    for (let i = 1; i <= 5; i++) {
      list.push({ label: i.toString(), value: i })
    }
    list.push({ label: 'Unlimited', value: -1 })
    return list
  }

  const numberOfDevicesOptions = createNumberOfDevicesList()

  const onClose = () => {
    setVisible(false)
  }

  const onSave = () => {
    const payload = [form.getFieldsValue()]
    if(form.getFieldValue('deliveryMethods').length === 0){
      showActionModal({
        type: 'warning',
        title: $t({ defaultMessage: 'Guest pass won’t be printed or sent' }),
        // eslint-disable-next-line max-len
        content: $t({ defaultMessage: 'You haven’t selected to print or send the password to the guest. Create guest pass anyway?' }),
        customContent: {
          action: 'CUSTOM_BUTTONS',
          buttons: [{
            text: 'cancel',
            type: 'link', // TODO: will change after DS update
            key: 'cancel'
          }, {
            text: $t({ defaultMessage: 'Yes, create guest pass' }),
            type: 'primary',
            key: 'override',
            handler () {
              addGuestPass({ params: { tenantId: params.tenantId }, payload: payload })
              setVisible(false)
            }
          }]
        }
      })
    }else{
      addGuestPass({ params: { tenantId: params.tenantId }, payload: payload })
      setVisible(false)
    }
  }

  const onPhoneNumberChange = () => {
    const deliveryMethods = form.getFieldValue('deliveryMethods') || []
    form.validateFields(['mobilePhoneNumber']).then(() => {
      if(form.getFieldValue('mobilePhoneNumber') !== ''){
        setPhoneNumberError(false)
        deliveryMethods.push('SMS')
        form.setFieldValue('deliveryMethods', _.uniq(deliveryMethods))
      }
    }).catch(err => {
      if(err.errorFields.length > 0) {
        setPhoneNumberError(true)
        form.setFieldValue('deliveryMethods',
          deliveryMethods.filter((e: string) => e !== 'SMS'))
      }
    })
  }

  const onEmailChange = () => {
    const deliveryMethods = form.getFieldValue('deliveryMethods') || []
    form.validateFields(['email']).then(() => {
      if(form.getFieldValue('email') !== ''){
        setEmailError(false)
        deliveryMethods.push('MAIL')
        form.setFieldValue('deliveryMethods', _.uniq(deliveryMethods))
      }
    }).catch(err => {
      if(err.errorFields.length > 0) {
        setEmailError(true)
        form.setFieldValue('deliveryMethods',
          deliveryMethods.filter((e: string) => e !== 'MAIL'))
      }
    })
  }

  const content =
  <Form layout='vertical' form={form} onFinish={onSave}>
    <Form.Item
      name='name'
      label={$t({ defaultMessage: 'Guest Name' })}
      rules={[
        { required: true },
        { min: 1 },
        { max: 256 },
        { validator: (_, value) => excludeExclamationRegExp(value) }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='mobilePhoneNumber'
      label={$t({ defaultMessage: 'Mobile Phone' })}
      rules={[
        { validator: (_, value) => phoneRegExp(value) }
      ]}
      initialValue={null}
      children={
        <Input
          // eslint-disable-next-line max-len
          placeholder={`+${examplePhoneNumber.getCountryCode()} ${examplePhoneNumber.getNationalNumberOrDefault()}`}
          onChange={onPhoneNumberChange}
        />
      }
    />
    <Form.Item
      name='email'
      label={$t({ defaultMessage: 'Email' })}
      rules={[
        { validator: (_, value) => emailRegExp(value) }
      ]}
      initialValue={''}
      children={<Input onChange={onEmailChange} />}
    />
    <Form.Item
      name='notes'
      label={$t({ defaultMessage: 'Note' })}
      initialValue={''}
      rules={[
        { max: 180 }
      ]}
      children={<Input />}
    />
    <Divider style={{ margin: '4px 0px 20px', background: cssStr('--acx-neutrals-30') }}/>
    <Form.Item
      name={'networkId'}
      label={$t({ defaultMessage: 'Allowed Network' })}
      rules={[
        { required: true }
      ]}
      initialValue={allowedNetworkList?.length === 1 ?
        allowedNetworkList[0].id : ''}
      children={<Select
        options={allowedNetworkList?.map(p => ({ label: p.name, value: p.id }))}
        disabled={allowedNetworkList?.length === 1}
      />}
    />

    <Row>
      <Col span={12}>
        <Form.Item
          name={['expiration', 'duration']}
          label={$t({ defaultMessage: 'Pass is Valid for' })}
          rules={[
            { required: true },
            {
              type: 'number',
              max: 365,
              min: 1,
              message: $t({
                defaultMessage:
                  'Primary WAN Recovery Timer must be between 10 and 300'
              })
            }
          ]}
          initialValue={7}
          children={<InputNumber style={{ width: '100%' }}/>}
          style={{ paddingRight: '5px' }}
        />
      </Col>
      <Col span={12}>
        <Form.Item
          name={['expiration', 'unit']}
          label={' '}
          initialValue={'Day'}
          children={<Select
            options={timeTypeValidPassOptions}
            defaultValue={timeTypeValidPassOptions[1].value}
          />}
          style={{ paddingLeft: '5px' }}
        />
      </Col>
    </Row>
    <Form.Item
      name={['expiration', 'activationType']}
      label={$t({ defaultMessage: 'Pass is valid from' })}
      initialValue={'Creation'}
      children={
        <Radio.Group>
          <Radio value={'Creation'}>
            {$t({ defaultMessage: 'Now' })}
          </Radio>

          <Radio value={'Login'}>
            {$t({ defaultMessage: 'First Login' })}
          </Radio>
        </Radio.Group>}
    />
    <Form.Item
      name={'maxDevices'}
      label={$t({ defaultMessage: 'Number of devices' })}
      initialValue={3}
      children={<Select
        options={numberOfDevicesOptions}
      />}
    />
    <Form.Item
      name={'deliveryMethods'}
      initialValue={['PRINT']}
      children={
        <Checkbox.Group style={{ display: 'grid', rowGap: '5px' }}>
          <Checkbox value='SMS'
            style={{ alignItems: 'start' }}
            disabled={phoneNumberError}
          >
            <MobilePhoneSolidIcon />
            <CheckboxLabel>{$t({ defaultMessage: 'Send to Phone' })}</CheckboxLabel>
          </Checkbox>
          <Checkbox
            value='MAIL'
            style={{ marginLeft: '0px', alignItems: 'start' }}
            disabled={emailError}
          >
            <EnvelopClosedSolidIcon />
            <CheckboxLabel>{$t({ defaultMessage: 'Send to Email' })}</CheckboxLabel>
          </Checkbox>
          <Checkbox
            value='PRINT'
            style={{ marginLeft: '0px', alignItems: 'start' }}
          >
            <PrintIcon />
            <CheckboxLabel>{$t({ defaultMessage: 'Print Guest pass' })}</CheckboxLabel>
          </Checkbox>
        </Checkbox.Group>
      }
    />
  </Form>

  const footer = [
    <Button
      key='saveBtn'
      onClick={() => form.submit()}
      type={'secondary'}>
      {$t({ defaultMessage: 'Add' })}
    </Button>,
    <Button
      key='cancelBtn'
      onClick={onClose}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  ]

  return (
    <Loader>
      <Drawer
        title={'Add Guest Pass'}
        visible={visible}
        onClose={onClose}
        children={content}
        footer={<FooterDiv>{footer}</FooterDiv>}
        maskClosable={true}
      />
    </Loader>
  )
}
