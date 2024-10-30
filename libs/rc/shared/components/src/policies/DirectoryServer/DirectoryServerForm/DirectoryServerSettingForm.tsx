import { useEffect, useState } from 'react'

import { Col, Form, Input, InputNumber, Radio, Row, Space, Switch, Typography } from 'antd'
import { useIntl }                                                              from 'react-intl'
import { useParams }                                                            from 'react-router-dom'

import { Loader, Button, PasswordInput }     from '@acx-ui/components'
import {
  useGetDirectoryServerByIdQuery,
  useLazyGetDirectoryServerViewDataListQuery,
  useTestConnectionDirectoryServerMutation
} from '@acx-ui/rc/services'
import {
  servicePolicyNameRegExp,
  checkObjectNotExists,
  DirectoryServerProfileEnum,
  domainNameRegExp,
  DirectoryServerDiagnosisCommand,
  DirectoryServerDiagnosisCommandEnum
} from '@acx-ui/rc/utils'

import * as UI from '../../DirectoryServer/DirectoryServerForm/styledComponents'

export enum TestConnectionStatusEnum {
  PASS = 'PASS',
  FAIL = 'FAIL'
}

interface DirectoryServerFormSettingFormProps {
  policyId?: string
  editMode?: boolean
}

const defaultPayload = {
  fields: ['name', 'id'],
  searchString: '',
  searchTargetFields: ['name'],
  filters: {},
  pageSize: 10_000
}

export const DirectoryServerSettingForm = (props: DirectoryServerFormSettingFormProps) => {
  const { $t } = useIntl()
  const { editMode, policyId } = props
  const params = useParams()
  const form = Form.useFormInstance()
  const type = Form.useWatch('type')
  const [ getDirectoryServerViewDataList ] = useLazyGetDirectoryServerViewDataListQuery()
  const [ testConnectionDirectoryServer] = useTestConnectionDirectoryServerMutation()
  const { data, isLoading } = useGetDirectoryServerByIdQuery({ params }, { skip: !editMode })
  const [isTesting, setIsTesting] = useState(false)
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestConnectionStatusEnum>()

  useEffect(() => {
    if (!policyId || !data) return

    form.setFieldsValue(data)

  }, [policyId, data, form])

  const nameValidator = async (value: string) => {
    const payload = { ...defaultPayload, searchString: value }
    const list = (
      await getDirectoryServerViewDataList({
        params,
        payload
      }).unwrap()
    ).data
      .filter((n) => n.id !== policyId)
      .map((n) => ({ name: n.name }))

    return checkObjectNotExists(
      list,
      { name: value },
      $t({ defaultMessage: 'DirectoryServer' })
    )
  }

  const onClickTestConnection = async () => {
    setIsTesting(true)
    const payload: DirectoryServerDiagnosisCommand = {
      action: DirectoryServerDiagnosisCommandEnum.testConnection,
      tlsEnabled: form.getFieldValue('tlsEnabled'),
      adminDomainName: form.getFieldValue('adminDomainName'),
      adminPassword: form.getFieldValue('adminPassword'),
      host: form.getFieldValue('host'),
      port: form.getFieldValue('port'),
      type: form.getFieldValue('type')
    }
    try{
      const result = await testConnectionDirectoryServer({
        payload: payload
      }).unwrap()
      if(result.requestId){
        setTestConnectionStatus(TestConnectionStatusEnum.PASS)
      }
    }catch (error) {
      setTestConnectionStatus(TestConnectionStatusEnum.FAIL)
    }
    setIsTesting(false)
  }

  return (
    <Loader states={[{ isLoading: isLoading }]}>
      <Row>
        <Col span={12}>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Profile Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (_, value) => servicePolicyNameRegExp(value) },
              { validator: (_, value) => nameValidator(value) }
            ]}
            validateFirst
            hasFeedback
            initialValue={''}
            validateTrigger={'onBlur'}
            children={<Input/>}
          />
        </Col>
        <Col span={24}>
          <Form.Item
            name='type'
            initialValue={DirectoryServerProfileEnum.AD}
            label={$t({ defaultMessage: 'Server Type' })}
            children={
              (<Radio.Group>
                <Space direction='vertical'>
                  <Radio value={DirectoryServerProfileEnum.AD} >
                    {$t({ defaultMessage: 'Active Directory Server' })}
                  </Radio>
                  <Radio value={DirectoryServerProfileEnum.LDAP}>
                    {$t({ defaultMessage: 'LDAP Server' })}
                  </Radio>
                </Space>
              </Radio.Group>)
            }
          />
        </Col>
        <Col span={12} >
          <UI.StyledSpace style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <UI.FormItemWrapper>
              <Form.Item
                label={$t({ defaultMessage: 'Enable TLS encryption' })}
              />
            </UI.FormItemWrapper>
            <Form.Item
              name='tlsEnabled'
              initialValue={true}
              valuePropName='checked'
              children={<Switch />}
            />
          </UI.StyledSpace>
        </Col>
        <Col span={17} >
          <Form.Item
            name='host'
            style={{ display: 'inline-block', width: 'calc(75%)' , paddingRight: '20px' }}
            rules={[
              { required: true },
              { validator: (_, value) => domainNameRegExp(value),
                message: $t({ defaultMessage: 'Please enter a valid FQDN or IP address' })
              }
            ]}
            label={$t({ defaultMessage: 'FQDN or IP Address' })}
            initialValue={''}
            children={<Input/>}
          />
          <Form.Item
            name='port'
            style={{ display: 'inline-block', width: 'calc(25%)' }}
            label={$t({ defaultMessage: 'Port' })}
            rules={[
              { required: true },
              { type: 'number', min: 1 },
              { type: 'number', max: 65535 }
            ]}
            initialValue={636}
            children={<InputNumber min={1} max={65535} />}
          />
        </Col>
        <Col span={16}>
          <Form.Item
            name='domainName'
            label={type === DirectoryServerProfileEnum.AD
              ? $t({ defaultMessage: 'Windows Domain Name' })
              :$t({ defaultMessage: 'Base Domain Name' })}
            rules={[
              { required: true }
            ]}
            initialValue={''}
            validateTrigger={'onBlur'}
            children={<Input placeholder={type === DirectoryServerProfileEnum.AD
              ?'dc=domain, dc=ruckuswireless, dc=com'
              :'dc=ldap dc=com'}/>}
          />
        </Col>
        <Col span={16}>
          <Form.Item
            name='adminDomainName'
            label={$t({ defaultMessage: 'Admin Domain Name' })}
            rules={[
              { required: true }
            ]}
            initialValue={''}
            validateTrigger={'onBlur'}
            children={<Input placeholder={type === DirectoryServerProfileEnum.AD
              ?'admin@domain.ruckuswireless.com'
              :'cn=admin, dc=ldap dc=com'}/>}
          />
        </Col>
        <Col span={16}>
          <Form.Item
            name='adminPassword'
            label={$t({ defaultMessage: 'Admin Password' })}
            initialValue={''}
            rules={[
              { required: true },
              { min: 1 },
              { max: 128 }
            ]}
            children={<PasswordInput />}
          />
        </Col>
        {type === DirectoryServerProfileEnum.LDAP && (
          <>
            <Col span={16}>
              <Form.Item
                name='keyAttribute'
                label={$t({ defaultMessage: 'Key Attribute' })}
                initialValue={''}
                children={<Input/>}
              />
            </Col>
            <Col span={16}>
              <Form.Item
                name='searchFilter'
                label={$t({ defaultMessage: 'Search Filter' })}
                initialValue={''}
                children={<Input/>}
              />
            </Col>
          </>
        )
        }
        <Col span={8}></Col>

        <Col span={5} style={{ marginRight: '16px' }}>
          <Button
            type='primary'
            htmlType='submit'
            disabled={isTesting}
            onClick={onClickTestConnection}
          >
            {$t({ defaultMessage: 'Test Connection' })}
          </Button>
        </Col>
        <Col span={11}>
          {testConnectionStatus &&
          <UI.AlertMessageWrapper type={testConnectionStatus}>
            { testConnectionStatus === TestConnectionStatusEnum.PASS
              ? <>
                <UI.CheckMarkIcon />
                <Typography.Text children={$t({ defaultMessage: 'Connection Successful' })} />
              </>
              : <>
                <UI.FailedSolidIcon />
                <Typography.Text children={$t(
                  // eslint-disable-next-line max-len
                  { defaultMessage: 'Connection Failed. Please check server address and credentials' }
                )} />
              </>
            }
          </UI.AlertMessageWrapper>
          }
        </Col>
      </Row>
    </Loader>
  )
}
