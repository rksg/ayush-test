import { useEffect, useState } from 'react'

import { Col, Form, Input, Row, Tooltip } from 'antd'
import { useIntl }                        from 'react-intl'
import { useParams }                      from 'react-router-dom'

import { Button, Loader, PasswordInput, Select, Subtitle, Tabs }                                                from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                                                                           from '@acx-ui/icons'
import { useGetIpsecViewDataListQuery, useLazyGetIpsecViewDataListQuery }                                       from '@acx-ui/rc/services'
import { checkObjectNotExists, domainNameRegExp, Ipsec, IpSecAuthEnum, IpsecViewData, servicePolicyNameRegExp } from '@acx-ui/rc/utils'

import { TabLabel } from '../styledComponents'

import EspAssociationSettings    from './EspAssociationSettings'
import FailoverSettings          from './FailoverSettings'
import GatewayConnectionSettings from './GatewayConnectionSettings'
import IkeAssociationSettings    from './IkeAssociationSettings'
import { messageMapping }        from './messageMapping'
import RekeySettings             from './RekeySettings'


interface IpsecSettingFormProps {
  policyId?: string
  editMode?: boolean
  readMode?: boolean
  initIpSecData?: Ipsec
}

const defaultPayload = {
  fields: ['name', 'id'],
  searchString: '',
  searchTargetFields: ['name'],
  filters: {},
  pageSize: 10_000
}

const defaultFields = [
  'id',
  'name',
  'serverAddress',
  'authenticationType',
  'activations'
]

export const IpsecSettingForm = (props: IpsecSettingFormProps) => {
  const { $t } = useIntl()
  const { readMode, policyId, initIpSecData } = props
  const params = useParams()
  const form = Form.useFormInstance()
  const [ getIpsecViewDataList ] = useLazyGetIpsecViewDataListQuery()
  const [showMoreSettings, setShowMoreSettings] = useState(false)
  const [preSharedKey] = useState('')

  const { ipsecData, isLoading } = useGetIpsecViewDataListQuery(
    { params, payload: {
      fields: defaultFields,
      filters: { id: [policyId] }
    } },
    {
      skip: !policyId,
      selectFromResult: ({ data, isLoading }) => {
        return {
          ipsecData: (data?.data?.[0] ?? {}) as IpsecViewData,
          isLoading
        }
      }
    }
  )

  useEffect(() => {
    if (initIpSecData) {
      form.setFieldsValue(initIpSecData)
      if (initIpSecData.authType) {
        setAuthType(initIpSecData.authType)
      }
    }
  }, [initIpSecData, form])

  const nameValidator = async (value: string) => {
    const payload = { ...defaultPayload, searchString: value }
    // eslint-disable-next-line max-len
    const list = (await getIpsecViewDataList({ params, payload }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'IPsec' }))
  }

  const onAuthTypeChange = (value: IpSecAuthEnum) => {
    setAuthType(value)
  }

  const authOptions = [
    { label: $t({ defaultMessage: 'Pre-shared Key' }), value: IpSecAuthEnum.PSK }
    // hide until certificates are supported
    // { label: $t({ defaultMessage: 'Certificate' }), value: IpSecAuthEnum.CERTIFICATE }
  ]

  const secAssociationTabsInfo = [
    {
      key: 'ike',
      display: $t({ defaultMessage: 'IKE' }),
      content: <IkeAssociationSettings initIpSecData={initIpSecData} />
    },
    {
      key: 'esp',
      display: $t({ defaultMessage: 'ESP' }),
      content: <EspAssociationSettings initIpSecData={initIpSecData} />
    }
  ]
  const [authType, setAuthType] = useState('')

  const [activeSecurityTabKey, setActiveSecurityTabKey] = useState(secAssociationTabsInfo[0]?.key)

  const moreSettingsTabsInfo = [
    {
      key: 'rekey',
      display: $t({ defaultMessage: 'Rekey' }),
      content: <RekeySettings />
    },
    {
      key: 'gatewayConnection',
      display: $t({ defaultMessage: 'Gateway & Connection' }),
      content: <GatewayConnectionSettings initIpSecData={initIpSecData} />
    },
    {
      key: 'failover',
      display: $t({ defaultMessage: 'Failover' }),
      content: <FailoverSettings initIpSecData={initIpSecData} />
    }
  ]
  const [activeTabKey, setActiveTabKey] = useState(moreSettingsTabsInfo[0]?.key)

  return (
    <Loader states={[{ isLoading }]}>
      <Row>
        <Col span={12}>
          <Form.Item
            {...(readMode? undefined : { name: 'name' })}
            hidden={readMode}
            label={$t({ defaultMessage: 'Profile Name' })}
            rules={readMode ? undefined : [
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
            children={readMode ? ipsecData?.name : <Input/>}
          />
          <Form.Item
            {...(readMode? undefined : { name: 'serverAddress' })}
            label={<>
              {$t({ defaultMessage: 'Security Gateway IP/FQDN' })}
              <Tooltip title={$t(messageMapping.security_gateway_tooltip)} placement='bottom'>
                <QuestionMarkCircleOutlined />
              </Tooltip>
            </>}
            rules={readMode ? undefined : [
              { type: 'string', required: true,
                message: $t({ defaultMessage: 'Please enter FQDN / IP' })
              },
              { validator: (_, value) => domainNameRegExp(value),
                message: $t({ defaultMessage: 'Please enter a valid IP address or FQDN' })
              }
            ]}
            validateFirst
            hasFeedback
            children={
              readMode ? ipsecData?.serverAddress : <Input />
            }
          />
          <Form.Item
            name='authType'
            label={$t({ defaultMessage: 'Authentication' })}
            rules={[{ required: true }]}
            initialValue={authType}
            children={
              <Select
                style={{ width: '380px' }}
                placeholder={$t({ defaultMessage: 'Select...' })}
                children={
                  authOptions.map((option) =>
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>)
                }
                onChange={onAuthTypeChange}
              />
            }
          />
          {authType === IpSecAuthEnum.PSK &&
            <Form.Item
              key={preSharedKey}
              data-testid='pre-shared-key'
              name='preSharedKey'
              label={$t({ defaultMessage: 'Pre-shared Key' })}
              rules={[{ required: true }]}
              children={
                <PasswordInput value={preSharedKey} />
              }
            />
          }
          {authType === IpSecAuthEnum.CERTIFICATE &&
            <Form.Item name='certificate'
              label={$t({ defaultMessage: 'Certificate' })}
              rules={[{ required: true }]}
              children={<Input />} />}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Subtitle level={5}>
            { $t({ defaultMessage: 'Security Association' }) }</Subtitle>
          <Tabs type='third'
            onChange={(key) => setActiveSecurityTabKey(key)}
            activeKey={activeSecurityTabKey}
          >
            {secAssociationTabsInfo.map(({ key, display }) =>
              (<Tabs.TabPane key={key} tab={<TabLabel>{display}</TabLabel>} />))}
          </Tabs>
          <div style={{ marginBottom: '30px' }}>
            {secAssociationTabsInfo.find(info => (info.key === activeSecurityTabKey))?.content}
          </div>
          <Button type='link'
            style={{ maxWidth: '700px' }}
            onClick={() => setShowMoreSettings(!showMoreSettings)}>
            {showMoreSettings
              ? $t({ defaultMessage: 'Show less settings' })
              : $t({ defaultMessage: 'Show more settings' })}
          </Button>
          {showMoreSettings && <>
            <Tabs type='third'
              onChange={(key) => setActiveTabKey(key)}
              activeKey={activeTabKey}
            >
              {moreSettingsTabsInfo.map(({ key, display }) =>
                (<Tabs.TabPane key={key} tab={<TabLabel>{display}</TabLabel>} />))}
            </Tabs>
            <div style={{ maxHeight: '800px' }}>
              {moreSettingsTabsInfo.find(info => (info.key === activeTabKey))?.content}
            </div>
          </>
          }
        </Col>
      </Row>
    </Loader>
  )
}