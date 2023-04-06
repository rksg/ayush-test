import {
  Form,
  Input,
  Select,
  InputNumber,
  Radio,
  Space
} from 'antd'
import { FormattedMessage } from 'react-intl'

import { GridCol, GridRow, SelectionControl, StepsForm, Subtitle, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import {
  ExpirationDateSelector
} from '@acx-ui/rc/components'
import { useLazyGetDpskListQuery } from '@acx-ui/rc/services'
import {
  PassphraseFormatEnum,
  transformDpskNetwork,
  DpskNetworkType,
  checkObjectNotExists,
  PolicyDefaultAccess,
  DeviceNumberType
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { MAX_DEVICES_PER_PASSPHRASE } from '../constants'
import {
  defaultAccessLabelMapping,
  passphraseFormatDescription
} from '../contentsMap'
import { unlimitedNumberOfDeviceLabel } from '../DpskDetail/contentsMap'

import { FieldSpace } from './styledComponents'

export default function DpskSettingsForm () {
  const intl = getIntl()
  const form = Form.useFormInstance()
  const passphraseFormat = Form.useWatch<PassphraseFormatEnum>('passphraseFormat', form)
  const id = Form.useWatch<string>('id', form)
  const { Option } = Select
  const [ dpskList ] = useLazyGetDpskListQuery()
  const isCloudpathEnabled = useIsSplitOn(Features.DPSK_CLOUDPATH_FEATURE)

  const nameValidator = async (value: string) => {
    const list = (await dpskList({}).unwrap()).data
      .filter(n => n.id !== id)
      .map(n => ({ name: n.name }))
    return checkObjectNotExists(list, { name: value } , intl.$t({ defaultMessage: 'DPSK service' }))
  }

  const passphraseOptions = Object.keys(PassphraseFormatEnum).map((key =>
    <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.FORMAT, key)}</Option>
  ))

  return (<>
    <GridRow>
      <GridCol col={{ span: 6 }}>
        <StepsForm.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item name='id' noStyle>
          <Input type='hidden' />
        </Form.Item>
        <Form.Item
          name='name'
          label={intl.$t({ defaultMessage: 'Service Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Subtitle level={3}>
          { intl.$t({ defaultMessage: 'Passphrase Generation Parameters' }) }
        </Subtitle>
        <Form.Item
          name='passphraseFormat'
          label={
            <>
              { intl.$t({ defaultMessage: 'Passphrase Format' }) }
              <Tooltip.Question
                placement='bottom'
                title={<FormattedMessage
                  defaultMessage={`Format options: <br></br><br></br>
                    Most secured - all printable ASCII characters can be used <br></br><br></br>
                    Keyboard friendly - only letters and numbers will be used <br></br><br></br>
                    Numbers only - only numbers will be used
                  `}
                  values={{ br: () => <br /> }}
                />}
              />
            </>
          }
          rules={[{ required: true }]}
          extra={passphraseFormat && intl.$t(passphraseFormatDescription[passphraseFormat])}
        >
          <Select>{passphraseOptions}</Select>
        </Form.Item>
        <Form.Item
          name='passphraseLength'
          rules={[
            {
              required: true,
              message: intl.$t({ defaultMessage: 'Please enter Passphrase Length' })
            },
            {
              type: 'number',
              min: 8,
              max: 63,
              message: intl.$t({ defaultMessage: 'Passphrase Length must be between 8 and 63' })
            }
          ]}
          label={
            <>
              { intl.$t({ defaultMessage: 'Passphrase Length' }) }
              <Tooltip.Question
                // eslint-disable-next-line max-len
                title={intl.$t({ defaultMessage: 'Number of characters in passphrase. Valid range 8-63' })}
                placement='bottom'
              />
            </>
          }
        >
          <InputNumber />
        </Form.Item>
        <ExpirationDateSelector
          inputName={'expiration'}
          label={intl.$t({ defaultMessage: 'Expiration' })}
        />
      </GridCol>
    </GridRow>
    {isCloudpathEnabled && <CloudpathFormItems />}
  </>)
}

function CloudpathFormItems () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const deviceNumberType = Form.useWatch('deviceNumberType', form)

  return (
    <GridRow>
      <GridCol col={{ span: 8 }}>
        <Form.Item
          label={$t({ defaultMessage: 'Devices allowed per passphrase' })}
          rules={[{ required: true }]}
          name='deviceNumberType'
          children={
            <Radio.Group>
              <Space size={'middle'} direction='vertical'>
                <Radio value={DeviceNumberType.UNLIMITED}>
                  {$t(unlimitedNumberOfDeviceLabel)}
                </Radio>
                <FieldSpace>
                  <Radio value={DeviceNumberType.LIMITED}>
                    {$t({ defaultMessage: 'Limited to...' })}
                  </Radio>
                  {deviceNumberType === DeviceNumberType.LIMITED &&
                    <Form.Item
                      name='deviceCountLimit'
                      initialValue={1}
                      rules={[
                        {
                          required: true,
                          // eslint-disable-next-line max-len
                          message: $t({ defaultMessage: 'Please enter Devices allowed per passphrase' })
                        },
                        {
                          type: 'number',
                          min: 1,
                          max: MAX_DEVICES_PER_PASSPHRASE,
                          message: $t(
                            // eslint-disable-next-line max-len
                            { defaultMessage: 'Number of Devices allowed per passphrase must be between 1 and {max}' },
                            { max: MAX_DEVICES_PER_PASSPHRASE }
                          )
                        }
                      ]}
                      children={<InputNumber />}
                    />
                  }
                </FieldSpace>
              </Space>
            </Radio.Group>
          }
        />
        {/* <Form.Item name='policySetId'
          label={$t({ defaultMessage: 'Access Policy Set' })}
          rules={[{ required: true }]}
        >
          <Space direction='horizontal'>
            <Select style={{ minWidth: 250 }} placeholder={$t({ defaultMessage: 'Select...' })}/>
            <Button type='link'>
              {$t({ defaultMessage: 'Add Access Policy Set' })}
            </Button>
          </Space>
        </Form.Item> */}
        <Form.Item name='policyDefaultAccess'
          label={$t({ defaultMessage: 'Default Access' })}
          initialValue={PolicyDefaultAccess.ACCEPT}
          rules={[{ required: true }]}
        >
          <SelectionControl
            options={[
              {
                value: PolicyDefaultAccess.ACCEPT,
                label: $t(defaultAccessLabelMapping[PolicyDefaultAccess.ACCEPT])
              },
              {
                value: PolicyDefaultAccess.REJECT,
                label: $t(defaultAccessLabelMapping[PolicyDefaultAccess.REJECT])
              }
            ]}
          />
        </Form.Item>
      </GridCol>
    </GridRow>
  )
}
