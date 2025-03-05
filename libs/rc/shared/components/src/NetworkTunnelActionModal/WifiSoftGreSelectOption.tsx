import { useEffect, useState } from 'react'

import {  Form, Space, Select, Switch, Row, Alert } from 'antd'
import { DefaultOptionType }                        from 'antd/lib/select'
import { FormattedMessage, useIntl }                from 'react-intl'

import { Features, useIsSplitOn }                                                            from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                                                        from '@acx-ui/icons'
import { useGetSoftGreOptionsQuery, useLazyGetSoftGreOptionsQuery, useGetIpsecOptionsQuery } from '@acx-ui/rc/services'
import { hasPolicyPermission, PolicyOperation, PolicyType }                                  from '@acx-ui/rc/utils'

import {
  ApCompatibilityDrawer,
  ApCompatibilityToolTip,
  ApCompatibilityType,
  InCompatibilityFeatures
} from '../ApCompatibility'
import IpsecDrawer   from '../policies/Ipsec/IpsecForm/IpsecDrawer'
import SoftGreDrawer from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'

import { messageMappings }             from './messageMappings'
import * as UI                         from './styledComponents'
import { NetworkTunnelTypeEnum }       from './types'
import { WiFISoftGreRadioOptionProps } from './WifiSoftGreRadioOption'



const defaultPayload = {
  fields: ['id', 'name', 'primaryGatewayAddress', 'secondaryGatewayAddress', 'activations',
    'venueActivations', 'apActivations'],
  page: 1,
  pageSize: 10_000,
  searchString: '',
  filters: {}
}

const defaultIpsecPayload = {
  fields: ['id', 'name', 'serverAddress',
    'activations', 'venueActivations', 'apActivations'],
  page: 1,
  pageSize: 10_000,
  searchString: '',
  filters: {}
}

export default function WifiSoftGreSelectOption (props: WiFISoftGreRadioOptionProps) {
  const { currentTunnelType, venueId, networkId, cachedSoftGre, disabledInfo } = props
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [ detailIpsecDrawerVisible, setDetailIpsecDrawerVisible ] = useState<boolean>(false)
  const [ addIpsecDrawerVisible, setAddIpsecDrawerVisible ] = useState<boolean>(false)
  const [ isLocked, setIsLocked ] = useState<boolean>(false)
  const [ softGreOption, setSoftGreOption ] = useState<DefaultOptionType[]>([])
  const [ ipsecOption, setIpsecOption ] = useState<DefaultOptionType[]>([])
  const [ gatewayIpMapIds, setGatewayIpMapIds ] = useState<Record<string, string[]>>({})
  const [ getSoftGreOptions ] = useLazyGetSoftGreOptionsQuery()
  const [ enableIpsec, setEnableIpsec ] = useState<boolean>(false)
  const [ enableOption, setEnableOption ] = useState<boolean>(true)

  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)

  const [softGreDrawerVisible, setSoftGreDrawerVisible] = useState(false)

  const softGreProfileId = Form.useWatch(['softGre', 'newProfileId'], form)

  const ipsecProfileId = Form.useWatch(['ipsec', 'newProfileId'], form)

  const optionsDataQuery = useGetSoftGreOptionsQuery(
    { params: { venueId, networkId },
      payload: { ...defaultPayload }
    },
    { skip: !venueId || !networkId }
  )

  const ipsecOptionsDataQuery = useGetIpsecOptionsQuery(
    { params: { venueId, networkId },
      payload: { ...defaultIpsecPayload }
    },
    { skip: !venueId || !networkId }
  )

  useEffect(() => {
    if (disabledInfo?.isDisabled || disabledInfo?.noChangePermission) {
      setEnableOption(false)
    }
  }, [])

  useEffect(() => {
    if (optionsDataQuery.data) {
      const { options, isLockedOptions, gatewayIpMaps } = optionsDataQuery.data
      setSoftGreOption(options)
      setIsLocked(isLockedOptions)
      setGatewayIpMapIds(gatewayIpMaps)
      const profileId = optionsDataQuery.data.id
      if (currentTunnelType === NetworkTunnelTypeEnum.SoftGre && (cachedSoftGre?.length ?? 0) > 0) {
        const softGreInfo = cachedSoftGre?.find(
          sg => sg.venueId === venueId && sg.networkIds.includes(networkId!))
        if (softGreInfo) {
          form.setFieldValue(['softGre', 'newProfileId'], softGreInfo.profileId)
          form.setFieldValue(['softGre', 'newProfileName'], softGreInfo.profileName)
          form.setFieldValue(['softGre', 'oldProfileId'], profileId)
        }
      } else if (profileId) {
        form.setFieldValue(['softGre', 'newProfileId'], profileId)
        form.setFieldValue(['softGre', 'oldProfileId'], profileId)
        form.setFieldValue(['softGre', 'newProfileName'],
          options.find(item => item.value === profileId)?.label)
      }
    }
    if (ipsecOptionsDataQuery.data) {
      const { options } = ipsecOptionsDataQuery.data
      setIpsecOption(options)
      if(form.getFieldValue(['ipsec', 'enableIpsec'])) {
        setEnableIpsec(form.getFieldValue(['ipsec', 'enableIpsec']))
      }
    }
  }, [form, optionsDataQuery, ipsecOptionsDataQuery])

  useEffect(() => {
    if (currentTunnelType !== NetworkTunnelTypeEnum.SoftGre) {
      form.setFieldValue(['softGre', 'newProfileId'], '')
      form.setFieldValue(['softGre', 'newProfileName'], '')
      form.setFieldValue(['ipsec', 'newProfileId'], '')
      form.setFieldValue(['ipsec', 'newProfileName'], '')
    }
  }, [form, currentTunnelType])

  const addOption = (option: DefaultOptionType, gatewayIps: string[]) => {
    setSoftGreOption((preState) => {
      return [{ ...option, disabled: isLocked }, ...preState]
    })
    setGatewayIpMapIds((preState) => {
      return { ...preState, [`${option.value}`]: gatewayIps }
    })
    if (!isLocked) {
      form.setFieldValue(['softGre', 'newProfileId'], option.value)
      form.setFieldValue(['softGre', 'newProfileName'], option.label)
    }
  }

  const addIpsecOption = (option: DefaultOptionType) => {
    setIpsecOption((preState) => {
      return [{ ...option, disabled: isLocked }, ...preState]
    })
    if (!isLocked) {
      form.setFieldValue(['ipsec', 'newProfileId'], option.value)
      form.setFieldValue(['ipsec', 'newProfileName'], option.label)
    }
  }
  const onChange = (value:string) => {
    form.setFieldValue(['softGre', 'newProfileName'],
      softGreOption?.find(item => item.value === value)?.label ?? '')
  }

  const onChangeIpsec = (value:string) => {
    form.setFieldValue(['ipsec', 'newProfileName'],
      ipsecOption?.find(item => item.value === value)?.label ?? '')
  }

  const gatewayIpValidator = async (value: string) => {
    let isValid = true
    if (value) {
      const queryData = await getSoftGreOptions(
        { params: { venueId, networkId }, payload: { ...defaultPayload } }
      ).unwrap()
      if (queryData) {
        const { id, gatewayIps, activationProfiles } = queryData
        if (value !== id && !activationProfiles.includes(value)) {
          const [ gatewayIp1, gatewayIp2 ] = gatewayIpMapIds[value] ?? []
          if (gatewayIp1 && gatewayIps.includes(gatewayIp1)) isValid = false
          if (gatewayIp2 && gatewayIps.includes(gatewayIp2)) isValid = false
        }
      }
    }

    return isValid ? Promise.resolve() :
      Promise.reject(
        /* eslint-disable max-len */
        $t({ defaultMessage: 'The gateway of the selected SoftGRE tunnel profile already exists in another applied profile at the same <venueSingular></venueSingular>. Please choose a different one.' })
      )
  }

  const handleClickAdd = () => {
    setDetailDrawerVisible(false)
    setSoftGreDrawerVisible(false)
    setAddDrawerVisible(true)
  }

  const handleClickAddIpsec = () => {
    setDetailIpsecDrawerVisible(false)
    setAddIpsecDrawerVisible(true)
  }

  const handleClickProfileDetail = () => {
    setAddDrawerVisible(false)
    setDetailDrawerVisible(true)
  }

  const handleClickIpsecProfileDetail = () => {
    setAddIpsecDrawerVisible(false)
    setDetailIpsecDrawerVisible(true)
  }

  return <>
    {!enableOption && <Alert type='info' showIcon message={$t(messageMappings.disable_deactivate_last_network)} />}
    {enableOption && <>
      <Row>
        {<div className={'ant-form-item-label'}>
          <label>{$t({ defaultMessage: 'Tunnel the traffic to a SoftGRE gateway' })}</label>
        </div>}
        {<Alert style={{ marginTop: '20px', marginBottom: '20px', width: '380px' }}
          message={
            <FormattedMessage
              // eslint-disable max-len
              defaultMessage='A <venueSingular></venueSingular> supports <b>up to 3 SoftGRE activated profiles without IPsec</b> or <b>1 SoftGRE with IPsec.</b>'
              values={{ b: (chr) => (<b>{chr}</b>) }} />
          }
          type='info'
          showIcon />
        }
        {isR370UnsupportedFeatures && <ApCompatibilityToolTip
          title={''}
          showDetailButton
          placement='top'
          onClick={() => setSoftGreDrawerVisible(true)}
          icon={<QuestionMarkCircleOutlined
            style={{ height: '16px', width: '16px', marginLeft: '3px', marginBottom: -3 }}
          />}
        />}
        {isR370UnsupportedFeatures && <ApCompatibilityDrawer
          visible={softGreDrawerVisible}
          type={ApCompatibilityType.ALONE}
          networkId={networkId}
          featureName={InCompatibilityFeatures.SOFT_GRE}
          onClose={() => setSoftGreDrawerVisible(false)}
        />}
      </Row>
      <Row><Space wrap>
        <Form.Item
          name={['softGre', 'newProfileId']}
          rules={[
            { required: currentTunnelType === NetworkTunnelTypeEnum.SoftGre,
              message: $t({ defaultMessage: 'Please select a SoftGRE Profile' })
            },
            { validator: (_, value) => gatewayIpValidator(value) }
          ]}
          label={$t({ defaultMessage: 'SoftGRE Profile' })}
          initialValue=''
          children={<Select
            style={{ width: '220px' }}
            onChange={onChange}
            options={[
              {
                label: $t({ defaultMessage: 'Select...' }), value: ''
              },
              ...softGreOption
            ]}
            placeholder={$t({ defaultMessage: 'Select...' })} />}
        />
        <UI.TextButton
          type='link'
          disabled={!softGreProfileId}
          onClick={handleClickProfileDetail}
        >
          {$t({ defaultMessage: 'Profile details' })}
        </UI.TextButton>
        <UI.TextButton
          type='link'
          disabled={!hasPolicyPermission({ type: PolicyType.SOFTGRE, oper: PolicyOperation.CREATE })}
          onClick={handleClickAdd}
          style={{ marginLeft: 5 }}
        >
          {$t({ defaultMessage: 'Add' })}
        </UI.TextButton>
      </Space></Row>
      {currentTunnelType === NetworkTunnelTypeEnum.SoftGre &&
    <Row><Space><div>
      <span style={{ height: '68px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '100px' }}>{$t({ defaultMessage: 'Enable IPsec' })}</label>
        <Form.Item noStyle
          name={['ipsec', 'enableIpsec']}
          valuePropName='checked'
          children={<Switch onChange={setEnableIpsec} />}
        />
      </span>
    </div></Space></Row>}
      {enableIpsec &&
      <Row><Space>
        <Form.Item
          name={['ipsec', 'newProfileId']}
          label={$t({ defaultMessage: 'IPsec Profile' })}
          rules={[
            { required: enableIpsec,
              message: $t({ defaultMessage: 'Please select a IPsec Profile' })
            }
          ]}
          initialValue=''
          children={<Select
            style={{ width: '220px' }}
            onChange={onChangeIpsec}
            options={[
              {
                label: $t({ defaultMessage: 'Select...' }), value: ''
              },
              ...ipsecOption
            ]}
            placeholder={$t({ defaultMessage: 'Select...' })} />}
        />
        <UI.TextButton
          type='link'
          disabled={!ipsecProfileId}
          onClick={handleClickIpsecProfileDetail}
        >
          {$t({ defaultMessage: 'Profile details' })}
        </UI.TextButton>
        <UI.TextButton
          type='link'
          disabled={!hasPolicyPermission({ type: PolicyType.IPSEC, oper: PolicyOperation.CREATE })}
          onClick={handleClickAddIpsec}
          style={{ marginLeft: 5 }}
        >
          {$t({ defaultMessage: 'Add' })}
        </UI.TextButton>
      </Space></Row>}
      <SoftGreDrawer
        visible={detailDrawerVisible}
        setVisible={setDetailDrawerVisible}
        policyId={softGreProfileId}
        policyName={softGreOption.find(item => item.value === softGreProfileId)?.label as string}
        readMode
      />
      <SoftGreDrawer
        visible={addDrawerVisible}
        setVisible={setAddDrawerVisible}
        callbackFn={addOption}
      />
      <IpsecDrawer
        visible={detailIpsecDrawerVisible}
        setVisible={setDetailIpsecDrawerVisible}
        policyId={ipsecProfileId}
        policyName={ipsecOption.find(item => item.value === ipsecProfileId)?.label as string}
        readMode
      />
      <IpsecDrawer
        visible={addIpsecDrawerVisible}
        setVisible={setAddIpsecDrawerVisible}
        callbackFn={addIpsecOption}
      />
    </>}
  </>
}

