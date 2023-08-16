import { useEffect } from 'react'

import { Form, Input, InputNumber, Radio, Space } from 'antd'
import { useIntl }                                from 'react-intl'

import { Button, Fieldset, GridCol, GridRow, StepsFormLegacy, PasswordInput } from '@acx-ui/components'
import { useGetAAAPolicyListQuery }                                           from '@acx-ui/rc/services'
import {
  AAAPolicyType, checkObjectNotExists, servicePolicyNameRegExp,
  networkWifiIpRegExp, networkWifiSecretRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'



type AAASettingFormProps = {
  edit: boolean,
  saveState: AAAPolicyType,
  type?: string
}

const AAASettingForm = (props: AAASettingFormProps) => {
  const { $t } = useIntl()
  const { edit, saveState } = props
  const params = useParams()
  const { aaaPolicyList, aaaPolicyIpList } = useGetAAAPolicyListQuery({ params }, {
    refetchOnMountOrArgChange: 30,
    pollingInterval: 30000,
    selectFromResult: function ({ data }) {
      return {
        aaaPolicyList: data,
        aaaPolicyIpList: data && data.data.length > 0 ? data.data.map(
          policy => `${policy.primary!.ip!}:${policy.primary!.port!}`
        ) : []
      }
    }
  })
  const form = Form.useFormInstance()
  const { useWatch } = Form
  const [enableSecondaryServer, type ] =
    [useWatch('enableSecondaryServer'), useWatch('type')]
  const nameValidator = async (value: string) => {
    const policyList = aaaPolicyList?.data!
    return checkObjectNotExists(policyList.filter(
      policy => edit ? policy.id !== saveState.id : true
    ).map(policy => ({ name: policy.name })), { name: value } ,
    $t({ defaultMessage: 'AAA Policy' }))
  }
  const radiusIpPortValidator = async (isPrimary: boolean) => {
    const primaryValue =
      `${form.getFieldValue(['primary', 'ip'])}:${form.getFieldValue(['primary', 'port'])}`
    const secondaryValue =
      `${form.getFieldValue(['secondary', 'ip'])}:${form.getFieldValue(['secondary', 'port'])}`
    const value = isPrimary ? primaryValue : secondaryValue
    if (!isPrimary && value === primaryValue) {
      return Promise.reject($t({
        defaultMessage: 'IP address and Port combinations must be unique'
      }))
    }

    let stateValue = ''
    if (saveState && edit) {
      stateValue = isPrimary
        ? `${saveState.primary!.ip}:${saveState.primary!.port}`
        : `${saveState.secondary!.ip}:${saveState.secondary!.port}`
    }

    if (aaaPolicyIpList
      .filter(policy => edit ? policy !== stateValue : true)
      .includes(value)
    ) {
      return Promise.reject($t({
        // eslint-disable-next-line max-len
        defaultMessage: 'IP address and Port combinations must be unique, there is an existing combination in the list.'
      }))
    }
    return Promise.resolve()
  }
  useEffect(() => {
    if (edit && saveState) {
      if(saveState.secondary?.ip){
        form.setFieldValue('enableSecondaryServer', true)
      }
    }
  }, [saveState])

  const ACCT_FORBIDDEN_PORT = 1812
  const AUTH_FORBIDDEN_PORT = 1813
  const validateRadiusPort = async (value: number)=>{
    if((value === ACCT_FORBIDDEN_PORT && type === 'ACCOUNTING')||
    (value === AUTH_FORBIDDEN_PORT && type === 'AUTHENTICATION')){
      return Promise.reject(
        $t({ defaultMessage: 'Authentication radius port '+
        'cannot be {authForbiddenPort} and Accounting radius '+
        'port cannot be {acctForbiddenPort} ' },
        { acctForbiddenPort: ACCT_FORBIDDEN_PORT, authForbiddenPort: AUTH_FORBIDDEN_PORT }))
    }
    return Promise.resolve()
  }
  return (
    <GridRow>
      <GridCol col={{ span: 8 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Profile Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (rule, value) => nameValidator(value) },
            { validator: (_, value) => servicePolicyNameRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          initialValue={''}
          children={<Input/>}
          validateTrigger={'onBlur'}
        />
        <Form.Item
          name='type'
          label={$t({ defaultMessage: 'Type' })}
          initialValue={props.type || 'AUTHENTICATION'}
          children={<Radio.Group disabled={props.type? true: false}
            onChange={(e)=>{
              if(e.target.value==='ACCOUNTING'){
                form.setFieldValue(['primary', 'port'], AUTH_FORBIDDEN_PORT)
                form.setFieldValue(['secondary', 'port'], AUTH_FORBIDDEN_PORT)
              }else{
                form.setFieldValue(['primary', 'port'], ACCT_FORBIDDEN_PORT)
                form.setFieldValue(['secondary', 'port'], ACCT_FORBIDDEN_PORT)
              }
            }}>
            <Space direction='vertical'>
              <Radio key='authentication' value={'AUTHENTICATION'}>
                {$t({ defaultMessage: 'Authentication RADIUS Server' })}
              </Radio>
              <Radio key='accounting' value={'ACCOUNTING'}>
                {$t({ defaultMessage: 'Accounting RADIUS Server' })}
              </Radio>
            </Space>
          </Radio.Group>}
        />
        <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
          <Fieldset label={$t({ defaultMessage: 'Primary Server' })}
            checked={true}
            switchStyle={{ display: 'none' }}
          >
            <div>
              <Form.Item
                name={['primary', 'ip']}
                style={{ display: 'inline-block', width: 'calc(57%)' , paddingRight: '20px' }}
                rules={[
                  { required: true },
                  { validator: async (_, value) => {
                    await radiusIpPortValidator(true)
                    return networkWifiIpRegExp(value)
                  } }
                ]}
                label={$t({ defaultMessage: 'IP Address' })}
                initialValue={''}
                children={<Input/>}
              />
              <Form.Item
                name={['primary', 'port']}
                style={{ display: 'inline-block', width: 'calc(43%)' }}
                label={$t({ defaultMessage: 'Port' })}
                rules={[
                  { required: true },
                  { type: 'number', min: 1 },
                  { type: 'number', max: 65535 },
                  { validator: async (_, value) => {
                    await radiusIpPortValidator(true)
                    return validateRadiusPort(value)
                  } }
                ]}
                initialValue={type === 'ACCOUNTING'? AUTH_FORBIDDEN_PORT:ACCT_FORBIDDEN_PORT}
                children={<InputNumber min={1} max={65535} />}
              />
            </div>
            <Form.Item
              name={['primary', 'sharedSecret']}
              label={$t({ defaultMessage: 'Shared Secret' })}
              initialValue={''}
              rules={[
                { required: true },
                { max: 255 },
                { validator: (_, value) => networkWifiSecretRegExp(value) }
              ]}
              children={<PasswordInput />}
            />
          </Fieldset>
          <Form.Item noStyle name='enableSecondaryServer'>
            <Button
              type='link'
              onClick={() => {
                form.setFieldValue('enableSecondaryServer',!enableSecondaryServer)
              }}
            >
              {enableSecondaryServer ? $t({ defaultMessage: 'Remove Secondary Server' }):
                $t({ defaultMessage: 'Add Secondary Server' })}
            </Button>
          </Form.Item>
          {enableSecondaryServer &&
          <Fieldset label={$t({ defaultMessage: 'Secondary Server' })}
            checked={true}
            switchStyle={{ display: 'none' }}
          >
            <div>
              <Form.Item
                name={['secondary', 'ip']}
                style={{ display: 'inline-block', width: 'calc(57%)' , paddingRight: '20px' }}
                rules={[
                  { required: true },
                  { validator: async (_, value) => {
                    await radiusIpPortValidator(false)
                    return networkWifiIpRegExp(value)
                  } }
                ]}
                label={$t({ defaultMessage: 'IP Address' })}
                initialValue={''}
                children={<Input/>}
              />
              <Form.Item
                name={['secondary', 'port']}
                style={{ display: 'inline-block', width: 'calc(43%)' }}
                label={$t({ defaultMessage: 'Port' })}
                rules={[
                  { required: true },
                  { type: 'number', min: 1 },
                  { type: 'number', max: 65535 },
                  { validator: async (_, value) => {
                    await radiusIpPortValidator(false)
                    return validateRadiusPort(value)
                  } }
                ]}
                initialValue={type === 'ACCOUNTING'? AUTH_FORBIDDEN_PORT:ACCT_FORBIDDEN_PORT}
                children={<InputNumber min={1} max={65535} />}
              />
            </div>
            <Form.Item
              name={['secondary', 'sharedSecret']}
              label={$t({ defaultMessage: 'Shared Secret' })}
              initialValue={''}
              rules={[
                { required: true },
                { max: 255 },
                { validator: (_, value) => networkWifiSecretRegExp(value) }
              ]}
              children={<PasswordInput />}
            /></Fieldset>}
        </Space>
      </GridCol>
      <GridCol col={{ span: 14 }}>
      </GridCol>
    </GridRow>
  )
}
export default AAASettingForm
