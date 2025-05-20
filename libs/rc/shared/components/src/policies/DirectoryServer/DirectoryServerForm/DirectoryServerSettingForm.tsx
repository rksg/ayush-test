import { useEffect, useState } from 'react'

import { Col, Form, Input, InputNumber, Radio, Row, Space, Switch, Typography } from 'antd'
import { useIntl }                                                              from 'react-intl'
import { useParams }                                                            from 'react-router-dom'

import { Loader, Button, PasswordInput }     from '@acx-ui/components'
import { useIsSplitOn, Features }            from '@acx-ui/feature-toggle'
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
  DirectoryServerDiagnosisCommandEnum,
  IdentityAttributeMappingNameType
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import { IdentityAttributesInput, excludedAttributeTypes } from '../../IdentityAttributesInput'

import * as UI from './styledComponents'

export enum TestConnectionStatusEnum {
  PASS = 'PASS',
  FAIL = 'FAIL'
}

interface DirectoryServerFormSettingFormProps {
  policyId?: string
  readMode?: boolean
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
  const { readMode=false, policyId } = props
  const params = useParams()
  const form = Form.useFormInstance()
  const type = Form.useWatch('type')
  const [ getDirectoryServerViewDataList ] = useLazyGetDirectoryServerViewDataListQuery()
  const [ testConnectionDirectoryServer, { isLoading: isTesting }] =
    useTestConnectionDirectoryServerMutation()
  const { data, isLoading } = useGetDirectoryServerByIdQuery(
    { params: { ...params, policyId } }, { skip: !policyId }
  )
  const TLS_DISABLED_PORT = 389
  const TLS_ENABLED_PORT = 636
  const currentType = readMode && data ? data.type : type
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestConnectionStatusEnum>()
  let currentTestConnectionFun: ReturnType<typeof testConnectionDirectoryServer> | undefined

  // eslint-disable-next-line max-len
  const isSupportIdentityAttribute = useIsSplitOn(Features.WIFI_DIRECTORY_PROFILE_REUSE_COMPONENT_TOGGLE)

  useEffect(() => {
    if (!policyId || !data) return

    form.setFieldsValue(data)

    if (isSupportIdentityAttribute && data.attributeMappings) {
      form.setFieldValue('identityName',
        data.attributeMappings
          .find(
            mapping => mapping.name === IdentityAttributeMappingNameType.DISPLAY_NAME
          )?.mappedByName
      )
      form.setFieldValue('identityEmail',
        data.attributeMappings
          .find(
            mapping => mapping.name === IdentityAttributeMappingNameType.EMAIL
          )?.mappedByName
      )
      form.setFieldValue('identityPhone',
        data.attributeMappings
          .find(
            mapping => mapping.name === IdentityAttributeMappingNameType.PHONE_NUMBER
          )?.mappedByName
      )

      // remove above three mappings from attributeMappings
      form.setFieldValue('attributeMappings', data.attributeMappings.filter(
        mapping => !excludedAttributeTypes.includes(
          mapping.name as IdentityAttributeMappingNameType
        )
      ))
    }
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
    try {
      await form.validateFields(['adminDomainName', 'adminPassword', 'host'])
    } catch (error) {
      return
    }
    setTestConnectionStatus(undefined)
    const { tlsEnabled, adminDomainName, adminPassword, host, port, type } = form.getFieldsValue()
    const payload: DirectoryServerDiagnosisCommand = {
      action: DirectoryServerDiagnosisCommandEnum.testConnection,
      tlsEnabled,
      adminDomainName,
      adminPassword,
      host,
      port,
      type
    }
    try{
      currentTestConnectionFun = testConnectionDirectoryServer({
        payload: payload
      })
      const result = await currentTestConnectionFun.unwrap()
      if(result.requestId){
        setTestConnectionStatus(TestConnectionStatusEnum.PASS)
      }
    }catch (error) {
      setTestConnectionStatus(TestConnectionStatusEnum.FAIL)
    }
  }

  const getTypeName = (profileType:DirectoryServerProfileEnum) => {
    switch (profileType) {
      case DirectoryServerProfileEnum.LDAP:
        return $t({ defaultMessage: 'LDAP' })
      case DirectoryServerProfileEnum.AD:
        return $t({ defaultMessage: 'Active Directory' })
      default:
        return profileType || noDataDisplay
    }
  }

  const handleTlsEnabledOnChange = (checked: boolean) => {
    if (checked) {
      form.setFieldValue(['port'], TLS_ENABLED_PORT)
    } else {
      form.setFieldValue(['port'], TLS_DISABLED_PORT)
    }
  }

  useEffect(() => {
    return () => {
      currentTestConnectionFun && currentTestConnectionFun.abort()
    }
  }, [])

  return (
    <Loader states={[{ isLoading }]}>
      <Row>
        {!readMode && <Col span={12}>
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
        </Col> }
        <Col span={24}>
          <Form.Item
            {...(readMode? undefined : { name: 'type' })}
            initialValue={DirectoryServerProfileEnum.AD}
            label={$t({ defaultMessage: 'Server Type' })}
            children={
              readMode && data ? getTypeName(data.type)
                : (<Radio.Group>
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
        {!readMode && <>
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
                children={<Switch onChange={handleTlsEnabledOnChange} />}
              />
            </UI.StyledSpace>
          </Col>
          <Col span={17} >
            <Form.Item
              name='host'
              style={{ display: 'inline-block', width: 'calc(75%)' , paddingRight: '20px' }}
              rules={[
                { required: true },
                { max: 255 },
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
              initialValue={TLS_ENABLED_PORT}
              children={<InputNumber min={1} max={65535} />}
            />
          </Col>
        </>}
        {readMode &&
        <Col span={17} >
          <Form.Item
            label={$t({ defaultMessage: 'TLS encryption' })}
            children={data && data.tlsEnabled ?
              $t({ defaultMessage: 'On' }) : $t({ defaultMessage: 'Off' })}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Server Address' })}
            children={data && data.host && data.host ? `${data.host}:${data.port}` : noDataDisplay}
          />
        </Col>}

        <Col span={16}>
          <Form.Item
            {...(readMode? undefined : { name: 'domainName' })}
            label={currentType === DirectoryServerProfileEnum.AD
              ? $t({ defaultMessage: 'Windows Domain Name' })
              :$t({ defaultMessage: 'Base Domain Name' })}
            rules={readMode? undefined : [
              { required: true },
              { min: 1 },
              { max: 255 }
            ]}
            initialValue={''}
            validateTrigger={'onBlur'}
            children={readMode ? data?.domainName
              : <Input
                placeholder={type === DirectoryServerProfileEnum.AD
                  ?'dc=domain, dc=ruckuswireless, dc=com'
                  :'dc=ldap dc=com'}/>
            }
          />
        </Col>
        <Col span={16}>
          <Form.Item
            {...(readMode? undefined : { name: 'adminDomainName' })}
            label={$t({ defaultMessage: 'Admin Domain Name' })}
            rules={[
              { required: true },
              { min: 1 },
              { max: 255 }
            ]}
            initialValue={''}
            validateTrigger={'onBlur'}
            children={readMode ? data?.adminDomainName
              : <Input placeholder={type === DirectoryServerProfileEnum.AD
                ?'admin@domain.ruckuswireless.com'
                :'cn=admin, dc=ldap dc=com'}/>}
          />
        </Col>
        {!readMode && <Col span={16}>
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
        </Col>}
        {currentType === DirectoryServerProfileEnum.LDAP && (
          <Col span={16}>
            <Form.Item
              {...(readMode? undefined : { name: 'keyAttribute' })}
              label={$t({ defaultMessage: 'Key Attribute' })}
              initialValue={''}
              rules={[
                { max: 255 }
              ]}
              children={readMode? (data?.keyAttribute || noDataDisplay)
                :<Input placeholder='uid'/>}
            />
            <Form.Item
              {...(readMode? undefined : { name: 'searchFilter' })}
              label={$t({ defaultMessage: 'Search Filter' })}
              initialValue={''}
              rules={[
                { max: 255 }
              ]}
              children={readMode? (data?.searchFilter || noDataDisplay)
                :<Input placeholder='objectClass=*'/>}
            />
          </Col>)
        }
        {!readMode && isSupportIdentityAttribute && <Col span={16}>
          <IdentityAttributesInput
            form={form}
            fieldLabel={$t({ defaultMessage: 'Identity Attributes & Claims Mapping' })}
            description={
              $t({ defaultMessage: 'Map user attributes from your AD/LDAP to identity attributes'+
                                  ' in RUCKUS One using the exact values from your AD/LDAP.'+
                                  ' Claim names are available in your AD/LDAP console.' })
            }
          />
        </Col>
        }
        <Col span={8} />
        <Col span={24}>
          <Space>
            {!readMode &&
          <Col span={5} style={{ marginRight: '16px' }}>
            <Button
              style={{
                background: 'var(--acx-primary-black)',
                color: 'var(--acx-primary-white)',
                borderColor: 'var(--acx-primary-black)'
              }}
              type='primary'
              htmlType='submit'
              disabled={isTesting}
              loading={isTesting}
              onClick={onClickTestConnection}
            >
              {$t({ defaultMessage: 'Test Connection' })}
            </Button>
          </Col>
            }

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
          </Space>
        </Col>
      </Row>
    </Loader>
  )
}
