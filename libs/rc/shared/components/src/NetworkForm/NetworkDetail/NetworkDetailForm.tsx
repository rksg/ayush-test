import { useContext, useEffect, useState } from 'react'

import { Form, Input, Col, Radio, Row, Space } from 'antd'
import TextArea                                from 'antd/lib/input/TextArea'
import { useIntl }                             from 'react-intl'

import { Button, StepsFormLegacy, Tooltip, cssStr } from '@acx-ui/components'
import { Features, useIsSplitOn }                   from '@acx-ui/feature-toggle'
import {
  useLazyNetworkListQuery,
  useLazyGetNetworkTemplateListQuery
} from '@acx-ui/rc/services'
import {
  ssidBackendNameRegExp,
  NetworkTypeEnum,
  WifiNetworkMessages,
  checkObjectNotExists,
  networkTypes,
  validateByteLength,
  ConfigTemplateType,
  TableResult,
  useConfigTemplateLazyQueryFnSwitcher,
  Network,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { ProtectedEnforceTemplateToggle }            from '../../configTemplates'
import { networkTypesDescription }                   from '../contentsMap'
import { NetworkDiagram }                            from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext                            from '../NetworkFormContext'
import { RadioDescription }                          from '../styledComponents'
import { useServicePolicyEnabledWithConfigTemplate } from '../utils'

import type { RadioChangeEvent } from 'antd'

const { useWatch } = Form


export function NetworkDetailForm () {
  const intl = useIntl()
  const type = useWatch<NetworkTypeEnum>('type')
  const form = Form.useFormInstance()
  const {
    editMode,
    cloneMode,
    data,
    setData,
    modalMode,
    createType
  } = useContext(NetworkFormContext)

  const [differentSSID, setDifferentSSID] = useState(false)

  // eslint-disable-next-line max-len
  const isPortalServiceEnabled = useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.PORTAL)
  const { isTemplate } = useConfigTemplate()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isExtendSsidDespriptionEnabled = useIsSplitOn(Features.EXTEND_SSID_DESPRIPTION_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled

  const onChange = (e: RadioChangeEvent) => {
    setData && setData({ ...data, type: e.target.value as NetworkTypeEnum,
      enableAccountingProxy: e.target.value === NetworkTypeEnum.DPSK,
      enableAuthProxy: e.target.value === NetworkTypeEnum.DPSK, // to set default value as true for DPSK while adding new network
      enableAccountingService: false })
  }

  useEffect(() => {
    if (editMode && data?.wlan?.ssid) {
      if (!differentSSID) {
        setDifferentSSID(data?.wlan?.ssid !== data?.name)
      }
    }
  }, [data?.wlan?.ssid, editMode])

  const networkListPayload = {
    searchString: '',
    fields: ['name', 'id', 'dsaeOnboardNetwork'],
    searchTargetFields: ['name', 'dsaeOnboardNetwork.name'],
    filters: {},
    pageSize: 10000
  }
  const [getInstanceList] = useConfigTemplateLazyQueryFnSwitcher<TableResult<Network>>({
    useLazyQueryFn: useLazyNetworkListQuery,
    useLazyTemplateQueryFn: useLazyGetNetworkTemplateListQuery
  })

  const params = useParams()

  const nameValidator = async (value: string) => {
    const payload = { ...networkListPayload, searchString: value }
    // eslint-disable-next-line max-len
    const list = (await getInstanceList({ params, payload, enableRbac: resolvedRbacEnabled }, true).unwrap()).data
      .filter(n => n.id !== params.networkId)
      .map(n => n.name)

    return checkObjectNotExists(list, value, intl.$t({ defaultMessage: 'Network' }))
  }

  const types = [
    { type: NetworkTypeEnum.PSK, disabled: false },
    { type: NetworkTypeEnum.DPSK, disabled: false },
    { type: NetworkTypeEnum.AAA, disabled: false },
    { type: NetworkTypeEnum.HOTSPOT20,
      disabled: !useIsSplitOn(Features.WIFI_FR_HOTSPOT20_R1_TOGGLE) || isTemplate },
    { type: NetworkTypeEnum.CAPTIVEPORTAL, disabled: !isPortalServiceEnabled },
    { type: NetworkTypeEnum.OPEN, disabled: false }
  ]

  const nameOnChange = (differentSSID: boolean) => {
    if (!differentSSID) {
      const name = form.getFieldValue('name')
      form.setFieldValue(['wlan', 'ssid'], name)
    }
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsFormLegacy.Title children={intl.$t({ defaultMessage: 'Network Details' })} />
        <Form.Item
          name='name'
          style={{ marginBottom: '5px' }}
          label={<>
            { intl.$t({ defaultMessage: 'Network Name' }) }
            <Tooltip.Question
              title={intl.$t(WifiNetworkMessages.NETWORK_NAME_TOOLTIP)}
              placement='bottom'
            />
          </>}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => ssidBackendNameRegExp(value) },
            { validator: (_, value) => validateByteLength(value, 32) },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input onChange={() => nameOnChange(differentSSID)} />}
          validateTrigger={'onBlur'}
        />
        <Form.Item noStyle name='differentSSID'>
          <Button
            type='link'
            style={{ fontSize: cssStr('--acx-body-4-font-size') }}
            onClick={() => {
              nameOnChange(!differentSSID)
              setDifferentSSID(!differentSSID)
            }}
          >
            {differentSSID ?
              intl.$t({ defaultMessage: 'Same as network name' }) :
              intl.$t({ defaultMessage: 'Set different SSID' })}
          </Button>

        </Form.Item>
        {differentSSID &&
          <Form.Item
            name={['wlan', 'ssid']}
            label={<>
              {intl.$t({ defaultMessage: 'SSID' })}
              <Tooltip.Question
                placement='bottom'
                title={intl.$t({
                  // eslint-disable-next-line max-len
                  defaultMessage: 'SSID may contain between 2 and 32 characters (32 Bytes when using UTF-8 non-Latin characters)'
                })}
              />
            </>}
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'The SSID must be configured.' }) },
              { min: 2,
                message: intl.$t({ defaultMessage: 'The SSID must be at least 2 characters' }) },
              { max: 32,
                message: intl.$t({ defaultMessage: 'The SSID must be up to 32 characters' }) },
              { validator: (_, value) => ssidBackendNameRegExp(value) },
              { validator: (_, value) => validateByteLength(value, 32) }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
            validateTrigger={'onBlur'}
          />
        }
        <Form.Item
          name='description'
          label={intl.$t({ defaultMessage: 'Description' })}
          rules={[
            ...(isExtendSsidDespriptionEnabled ? [{ max: 256 }] : [])
          ]}
          children={<TextArea rows={4}
            maxLength={isExtendSsidDespriptionEnabled ? undefined : 64}
          />}
        />
        <Form.Item>
          {( !editMode && !cloneMode && (!modalMode || (modalMode && !createType)) ) &&
            <Form.Item
              name='type'
              label={intl.$t({ defaultMessage: 'Network Type' })}
              rules={[{ required: true }]}
            >
              <Radio.Group onChange={onChange}>
                <Space direction='vertical'>
                  {types.filter(type => !type.disabled).map(({ type }) => (
                    <Radio key={type} value={type}>
                      {intl.$t(networkTypes[type])}
                      <RadioDescription>
                        {intl.$t(networkTypesDescription[type])}
                      </RadioDescription>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
          }
          {( editMode || cloneMode ) &&
            <Form.Item name='type' label='Network Type'>
              <>
                <h4 className='ant-typography'>{type && intl.$t(networkTypes[type])}</h4>
                <label>{type && intl.$t(networkTypesDescription[type])}</label>
              </>
            </Form.Item>
          }
          {modalMode && createType &&
            <Form.Item name='type' label='Network Type'>
              <>
                <h4 className='ant-typography'>
                  {createType && intl.$t(networkTypes[createType])}</h4>
                <label>{createType && intl.$t(networkTypesDescription[createType])}</label>
              </>
            </Form.Item>
          }
        </Form.Item>
        <ProtectedEnforceTemplateToggle templateId={data?.id} />
      </Col>

      <Col span={14}>
        <NetworkDiagram />
      </Col>
    </Row>
  )
}
