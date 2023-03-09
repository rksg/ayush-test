import { useEffect } from 'react'

import { Form, Input, InputNumber, Radio, Space } from 'antd'
import { useIntl }                                from 'react-intl'

import { Button, Fieldset, GridCol, GridRow, StepsForm }                              from '@acx-ui/components'
import { useLazyGetAAAPolicyListQuery }                                               from '@acx-ui/rc/services'
import {
  AAAPolicyType, checkObjectNotExists, networkWifiIpRegExp, networkWifiSecretRegExp
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
  const [ getAAAPolicyList ] = useLazyGetAAAPolicyListQuery()
  const form = Form.useFormInstance()
  const { useWatch } = Form
  const [enableSecondaryServer, type ] =
    [useWatch('enableSecondaryServer'), useWatch('type')]
  const nameValidator = async (value: string) => {
    const list = (await getAAAPolicyList({ params }).unwrap())
      .filter(policy => policy.id !== params.policyId)
      .map(policy => ({ name: policy.name }))
    return checkObjectNotExists(list, { name: value } ,
      $t({ defaultMessage: 'AAA Policy' }))
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
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Profile Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (rule, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          initialValue={''}
          children={<Input/>}
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
                  { validator: (_, value) => networkWifiIpRegExp(value) }
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
                  { validator: (_, value) => validateRadiusPort(value) }
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
                { validator: (_, value) => networkWifiSecretRegExp(value) }
              ]}
              children={<Input.Password />}
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
                  { validator: (_, value) => networkWifiIpRegExp(value) },
                  { validator: (_, value) => {
                    const primaryIP = form.getFieldValue(['primary', 'ip'])
                    const primaryPort = form.getFieldValue(['primary', 'port'])
                    const secPort = form.getFieldValue(['secondary', 'port'])
                    if(value === primaryIP && primaryPort === secPort){
                      return Promise.reject(
                        $t({ defaultMessage: 'IP address and Port combinations must be unique' }))
                    }
                    return Promise.resolve()
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
                  { validator: (_, value) => validateRadiusPort(value) }
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
                { validator: (_, value) => networkWifiSecretRegExp(value) }
              ]}
              children={<Input.Password />}
            /></Fieldset>}
        </Space>
      </GridCol>
      <GridCol col={{ span: 14 }}>
      </GridCol>
    </GridRow>
  )
}
export default AAASettingForm
