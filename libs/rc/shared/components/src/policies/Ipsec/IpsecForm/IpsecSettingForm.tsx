import { useEffect, useState } from 'react'

import { Col, Form, Input, Row, Tooltip } from 'antd'
import { useIntl }                        from 'react-intl'
import { useParams }                      from 'react-router-dom'

import { Button, Loader, PasswordInput, Select, Subtitle, Tabs }          from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                                     from '@acx-ui/icons'
import { useGetIpsecViewDataListQuery, useLazyGetIpsecViewDataListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  domainNameRegExp,
  domainNameWithIPv6RegExp,
  Ipsec,
  IpSecAuthEnum,
  IpsecViewData,
  servicePolicyNameRegExp,
  useConfigTemplate
} from '@acx-ui/rc/utils'


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
  'activations',
  'preSharedKey',
  'ikeProposalType',
  'ikeProposals',
  'espProposalType',
  'espProposals'
]

export const IpsecSettingForm = (props: IpsecSettingFormProps) => {
  const { $t } = useIntl()
  const { readMode, policyId, initIpSecData } = props
  const params = useParams()
  const form = Form.useFormInstance()
  const [ getIpsecViewDataList ] = useLazyGetIpsecViewDataListQuery()
  const [showMoreSettings, setShowMoreSettings] = useState(false)
  const [preSharedKey] = useState('')
  const [loadIkeSettings, setLoadIkeSettings] = useState(true)
  const [loadEspSettings, setLoadEspSettings] = useState(true)
  const [loadReKeySettings, setLoadReKeySettings] = useState(true)
  const [loadGwSettings, setLoadGwSettings] = useState(true)
  const [loadFailoverSettings, setLoadFailoverSettings] = useState(true)
  const [authType, setAuthType] = useState('')
  const isApIpModeFFEnabled = useIsSplitOn(Features.WIFI_EDA_IP_MODE_CONFIG_TOGGLE)
  const { isTemplate } = useConfigTemplate()

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
    if(readMode && ipsecData?.authenticationType) {
      setAuthType(ipsecData?.authenticationType)
      return
    }
    if (initIpSecData) {
      form.setFieldsValue(initIpSecData)
      if (initIpSecData.authType) {
        setAuthType(initIpSecData.authType)
      }
    }
  }, [initIpSecData, form, ipsecData, readMode])

  const nameValidator = async (value: string) => {
    const payload = { ...defaultPayload, searchString: value }
    // eslint-disable-next-line max-len
    const list = (await getIpsecViewDataList({ params, payload }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'IPsec' }))
  }

  const pskValidator = (value: string) => {
    let pass = false
    if (value.startsWith('0x')) { // HEX
      pass = new RegExp('0x[A-Fa-f0-9]{44,128}$').test(value)
    } else if (value.startsWith('0s') || value.indexOf('"') !== -1) { // No base64 and exclude double-quote
      pass = false
    } else if (value.length >= 8 && value.length <= 64) { // ASCII
      pass = validateASCII(value) && validateAPConfigInput(value)
    }

    return pass? Promise.resolve() :
      Promise.reject($t(messageMapping.psk_invalid_message))
  }

  //A valid ascii character must from (space)(char 32) to ~(char 126)
  const validateASCII = (v: string) => {
    for (let i = 0; i < v.length; i++) {
      let character = v.charCodeAt(i)
      if (character < 32 || character > 126) {
        return false
      }
    }
    return true
  }

  //AP's configuration will reject any input containing ` or $(
  const validateAPConfigInput = (v: string) => {
    if(v && v.indexOf('`') === -1 && v.indexOf('$(') === -1) {
      return true
    }
    return false
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
      content: <IkeAssociationSettings initIpSecData={initIpSecData}
        loadIkeSettings={loadIkeSettings}
        setLoadIkeSettings={setLoadIkeSettings}
      />
    },
    {
      key: 'esp',
      display: $t({ defaultMessage: 'ESP' }),
      content: <EspAssociationSettings initIpSecData={initIpSecData}
        loadEspSettings={loadEspSettings}
        setLoadEspSettings={setLoadEspSettings}
      />
    }
  ]

  const [activeSecurityTabKey, setActiveSecurityTabKey] = useState(secAssociationTabsInfo[0]?.key)

  const moreSettingsTabsInfo = [
    {
      key: 'rekey',
      display: $t({ defaultMessage: 'Rekey' }),
      content: <RekeySettings initIpSecData={initIpSecData}
        loadReKeySettings={loadReKeySettings}
        setLoadReKeySettings={setLoadReKeySettings} />
    },
    {
      key: 'gatewayConnection',
      display: $t({ defaultMessage: 'Gateway & Connection' }),
      content: <GatewayConnectionSettings initIpSecData={initIpSecData}
        loadGwSettings={loadGwSettings}
        setLoadGwSettings={setLoadGwSettings} />
    },
    {
      key: 'failover',
      display: $t({ defaultMessage: 'Failover' }),
      content: <FailoverSettings initIpSecData={initIpSecData}
        loadFailoverSettings={loadFailoverSettings}
        setLoadFailoverSettings={setLoadFailoverSettings} />
    }
  ]
  const [activeTabKey, setActiveTabKey] = useState(moreSettingsTabsInfo[0]?.key)

  const securityGatewayValidator = (value: string)=>{
    if (isApIpModeFFEnabled && !isTemplate) {
      return domainNameWithIPv6RegExp(value)
    }
    return domainNameRegExp(value)
  }

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
              { validator: (_, value) => securityGatewayValidator(value),
                message: $t({ defaultMessage: 'Please enter a valid IP address or FQDN' })
              }
            ]}
            validateFirst
            hasFeedback
            children={
              readMode ? <div>{ipsecData?.serverAddress}</div> : <Input />
            }
          />
          <Form.Item
            name='authType'
            label={$t({ defaultMessage: 'Authentication' })}
            rules={[{ required: true }]}
            initialValue={authType}
            children={
              readMode ?
                (ipsecData?.authenticationType=== IpSecAuthEnum.PSK ?
                  <div>{$t({ defaultMessage: 'Pre-shared Key' })}</div> :
                  <div>{$t({ defaultMessage: 'Certificate' })}</div>) :
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
          {authType === IpSecAuthEnum.PSK && readMode &&
            <Form.Item label={$t({ defaultMessage: 'Pre-shared Key' })}
              children={
                <PasswordInput readOnly
                  value={ipsecData?.preSharedKey}
                  style={{ width: '100%', border: 'none' }} />
              } />
          }
          {authType === IpSecAuthEnum.PSK && !readMode &&
            <Form.Item
              data-testid='pre-shared-key'
              name='preSharedKey'
              label={$t({ defaultMessage: 'Pre-shared Key' })}
              rules={[{ required: true },
                { validator: (_, value) => pskValidator(value) }]}
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
          {readMode &&
            <>
              <Form.Item
                label={$t({ defaultMessage: 'IKE Proposal' })}
                children={
                  <label>{ipsecData.ikeProposalType === 'DEFAULT' ?
                    $t({ defaultMessage: 'Default' }) :
                    $t({ defaultMessage: 'Custom' })}</label>
                } />
              <Form.Item
                label={$t({ defaultMessage: 'ESP Proposal' })}
                children={
                  <label>{ipsecData.espProposalType === 'DEFAULT' ?
                    $t({ defaultMessage: 'Default' }) :
                    $t({ defaultMessage: 'Custom' })}</label>
                } />
            </>
          }
          {!readMode &&
            <>
              <Tabs type='third'
                onChange={async (key) => {
                  try {
                    await form.validateFields([
                      ['ikeSecurityAssociation',
                        'ikeProposals', 'combinationValidator'],
                      ['espSecurityAssociation',
                        'espProposals', 'combinationValidator']])
                    setActiveSecurityTabKey(key)
                  } catch(e) {
                    // eslint-disable-next-line no-console
                    console.error(e)
                  }
                }}
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
            </>}
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