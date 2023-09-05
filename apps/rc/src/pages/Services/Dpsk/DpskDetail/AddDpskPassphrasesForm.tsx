import { useEffect, useState } from 'react'

import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Radio,
  RadioChangeEvent,
  Space
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams }                 from 'react-router-dom'

import { Tooltip, PasswordInput }                     from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }   from '@acx-ui/feature-toggle'
import { ExpirationDateSelector, PhoneInput }         from '@acx-ui/rc/components'
import { useGetDpskPassphraseQuery, useGetDpskQuery } from '@acx-ui/rc/services'
import {
  CreateDpskPassphrasesFormFields,
  emailRegExp,
  ExpirationDateEntity,
  ExpirationMode,
  MacRegistrationFilterRegExp,
  NewDpskPassphrase,
  phoneRegExp,
  unlimitedNumberOfDeviceLabel,
  validateVlanId
} from '@acx-ui/rc/utils'

import { OLD_MAX_DEVICES_PER_PASSPHRASE, NEW_MAX_DEVICES_PER_PASSPHRASE, MAX_PASSPHRASES } from '../constants'

import { DpskPassphraseEditMode } from './DpskPassphraseDrawer'
import { FieldSpace }             from './styledComponents'

enum DeviceNumberType {
  LIMITED,
  SAME_AS_POOL
}

export interface AddDpskPassphrasesFormProps {
  form: FormInstance<CreateDpskPassphrasesFormFields>
  editMode: DpskPassphraseEditMode
}

export default function AddDpskPassphrasesForm (props: AddDpskPassphrasesFormProps) {
  const { $t } = useIntl()
  const params = useParams()
  const { form, editMode } = props
  const numberOfDevices = Form.useWatch('numberOfDevices', form)
  const numberOfPassphrases = Form.useWatch('numberOfPassphrases', form)
  const [ deviceNumberType, setDeviceNumberType ] = useState(DeviceNumberType.LIMITED)
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const dpskDeviceCountLimitToggle =
    useIsSplitOn(Features.DPSK_PER_BOUND_PASSPHRASE_ALLOWED_DEVICE_INCREASED_LIMIT)

  const MAX_DEVICES_PER_PASSPHRASE = dpskDeviceCountLimitToggle
    ? NEW_MAX_DEVICES_PER_PASSPHRASE
    : OLD_MAX_DEVICES_PER_PASSPHRASE
  const { data: serverData, isSuccess } = useGetDpskPassphraseQuery(
    { params: ({ ...params, passphraseId: editMode.passphraseId }) },
    { skip: !editMode.isEdit }
  )
  const { poolDeviceCount } = useGetDpskQuery({ params }, {
    skip: !isCloudpathEnabled,
    selectFromResult ({ data }) {
      return {
        poolDeviceCount: data?.deviceCountLimit
      }
    }
  })

  const onDeviceNumberTypeChange = (e: RadioChangeEvent) => {
    setDeviceNumberType(e.target.value)
  }

  const isSingleDeviceAndPassphrase = () => {
    return numberOfDevices === 1 && numberOfPassphrases === 1
  }

  const isMacAddressEnabled = () => {
    if (isCloudpathEnabled) {
      return isMacAddressEnabledWithPoolData()
    }
    return isSingleDeviceAndPassphrase()
  }

  const isMacAddressEnabledWithPoolData = () => {
    if (deviceNumberType === DeviceNumberType.SAME_AS_POOL) {
      return numberOfPassphrases === 1 && poolDeviceCount === 1
    }
    return isSingleDeviceAndPassphrase()
  }

  const isPassphraseEnabled = () => {
    return numberOfPassphrases === 1
  }

  useEffect(() => {
    if (serverData && editMode.isEdit && isSuccess) {
      if (!serverData.numberOfDevices) {
        setDeviceNumberType(DeviceNumberType.SAME_AS_POOL)
      }
      form.setFieldsValue(transferServerDataToFormFields(serverData))
    }
  }, [serverData, isSuccess, editMode.isEdit])

  useEffect(() => {
    return () => {
      form.resetFields()
    }
  }, [])

  return (
    <Form layout='vertical' form={form}>
      <Form.Item name='id' initialValue='' noStyle>
        <Input type='hidden' />
      </Form.Item>
      <Form.Item
        label={$t({
          defaultMessage: 'Number of Passphrases (Up to {maximum} passphrases)'
        }, {
          maximum: MAX_PASSPHRASES
        })}
        name='numberOfPassphrases'
        initialValue={1}
        rules={[
          { required: true },
          {
            type: 'number',
            min: 1,
            max: MAX_PASSPHRASES,
            // eslint-disable-next-line max-len
            message: $t({ defaultMessage: 'Number of Passphrases must be between 1 and {max}' }, { max: MAX_PASSPHRASES })
          }
        ]}
        children={<InputNumber />}
        hidden={editMode.isEdit}
      />
      <Form.Item
        label={
          <>
            { $t({ defaultMessage: 'Number of Devices Per Passphrase' }) }
            <Tooltip.Question
              placement='bottom'
              title={<FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage={'When enabled, multiple devices will be able to use this passphrase'}
              />}
            />
          </>
        }
        children={
          <Radio.Group value={deviceNumberType} onChange={onDeviceNumberTypeChange}>
            <Space size={'middle'} direction='vertical'>
              <FieldSpace>
                <Radio value={DeviceNumberType.LIMITED}>
                  {$t(
                    { defaultMessage: 'Set number (1-{max})' },
                    { max: MAX_DEVICES_PER_PASSPHRASE }
                  )}
                </Radio>
                {deviceNumberType === DeviceNumberType.LIMITED &&
                  <Form.Item
                    name='numberOfDevices'
                    initialValue={1}
                    rules={[
                      {
                        required: true,
                        // eslint-disable-next-line max-len
                        message: $t({ defaultMessage: 'Please enter Number of Devices Per Passphrase' })
                      },
                      {
                        type: 'number',
                        min: 1,
                        max: MAX_DEVICES_PER_PASSPHRASE,
                        message: $t(
                          // eslint-disable-next-line max-len
                          { defaultMessage: 'Number of Devices Per Passphrase must be between 1 and {max}' },
                          { max: MAX_DEVICES_PER_PASSPHRASE }
                        )
                      }
                    ]}
                    children={<InputNumber />}
                  />
                }
              </FieldSpace>
              <Radio value={DeviceNumberType.SAME_AS_POOL}>
                {isCloudpathEnabled
                  ? $t(
                    { defaultMessage: 'Same as pool ({value})' },
                    { value: poolDeviceCount ? poolDeviceCount : $t(unlimitedNumberOfDeviceLabel) }
                  )
                  : $t(unlimitedNumberOfDeviceLabel)
                }
              </Radio>
            </Space>
          </Radio.Group>
        }
      />
      {isPassphraseEnabled() &&
        <Form.Item
          label={
            <>
              { $t({ defaultMessage: 'Passphrase' }) }
              <Tooltip.Question
                placement='bottom'
                title={<FormattedMessage
                  // eslint-disable-next-line max-len
                  defaultMessage={'If empty, passphrase will be generated by the system. Valid range 8-63'}
                />}
              />
            </>
          }
          name='passphrase'
          rules={[
            { min: 8 },
            { max: 63 }
          ]}
          children={<PasswordInput />}
        />
      }
      <Form.Item
        label={
          <>
            { isPassphraseEnabled()
              ? $t({ defaultMessage: 'User Name' })
              : $t({ defaultMessage: 'User Name Prefix' })
            }
            <Tooltip.Question
              placement='bottom'
              title={<FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage={'The name will be displayed in the DPSK User Table, to help associating devices with names'}
              />}
            />
          </>
        }
        name='username'
        rules={[
          { max: 190 }
        ]}
        children={<Input />}
      />
      {isMacAddressEnabled() &&
        <Form.Item
          label={
            <>
              { $t({ defaultMessage: 'MAC Address' }) }
              <Tooltip.Question
                placement='bottom'
                title={<FormattedMessage
                  defaultMessage={`
                    Only the device with this MAC address will be allowed into the Wi-Fi network
                    with that passphrase. Leave blank to allow the first device using the
                    passphrase to bond to it
                  `}
                />}
              />
            </>
          }
          rules={[
            { validator: (_, value) => MacRegistrationFilterRegExp(value) }
          ]}
          name='mac'
          children={<Input />}
        />
      }
      <Form.Item
        label={
          <>
            { $t({ defaultMessage: 'VLAN ID' }) }
            <Tooltip.Question
              placement='bottom'
              title={<FormattedMessage
                defaultMessage={`
                  The device will be placed on this VLAN after authenticating to
                  the Wi-Fi network. If empty, the network's default will be used
                `}
              />}
            />
          </>
        }
        rules={[
          { validator: (_, value) => {
            if (value) return validateVlanId(value)
            return Promise.resolve()
          } }
        ]}
        name='vlanId'
        children={
          <Input
            placeholder={$t({ defaultMessage: 'If empty, the network\'s default will be used' })}
            style={{ width: '100%' }}
          />
        }
      />
      <ExpirationDateSelector
        inputName={'expiration'}
        label={$t({ defaultMessage: 'Passphrase Expiration' })}
        modeLabel={{
          [ExpirationMode.NEVER]: $t({ defaultMessage: 'Same as pool' })
        }}
        modeAvailability={{
          [ExpirationMode.AFTER_TIME]: false
        }}
      />
      {isCloudpathEnabled && <>
        <Form.Item
          label={$t({ defaultMessage: 'Contact Email Address' })}
          name='email'
          rules={[
            { validator: (_, value) => emailRegExp(value) }
          ]}
          children={<Input placeholder={$t({ defaultMessage: 'Enter email address' })} />}
        />
        <Form.Item
          name='phoneNumber'
          label={$t({ defaultMessage: 'Contact Phone Number' })}
          rules={[
            { validator: (_, value) => phoneRegExp(value) }
          ]}
          children={
            <PhoneInput
              name={'phoneNumber'}
              callback={(value) => form.setFieldValue('phoneNumber', value)}
              onTop={true}
            />
          }
        />
        <Form.Item name='revocationReason' initialValue='' noStyle>
          <Input type='hidden' />
        </Form.Item>
      </>}
    </Form>
  )
}

function transferServerDataToFormFields (data: NewDpskPassphrase): CreateDpskPassphrasesFormFields {
  const { expirationDate, createdDate, vlanId, ...rest } = data
  const expiration = new ExpirationDateEntity()

  if (expirationDate) {
    expiration.setToByDate(expirationDate)
  } else {
    expiration.setToNever()
  }

  return {
    ...rest,
    numberOfPassphrases: 1,
    expiration,
    vlanId: vlanId?.toString()
  }
}
