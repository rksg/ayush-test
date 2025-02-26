import { useEffect, useState } from 'react'

import {  Form, Radio, Row, Space, Select } from 'antd'
import { DefaultOptionType }                from 'antd/lib/select'
import { useIntl }                          from 'react-intl'

import { Tooltip }                                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                               from '@acx-ui/icons'
import { useGetSoftGreOptionsQuery, useLazyGetSoftGreOptionsQuery } from '@acx-ui/rc/services'
import { hasPolicyPermission, PolicyOperation, PolicyType }         from '@acx-ui/rc/utils'

import {
  ApCompatibilityDrawer,
  ApCompatibilityToolTip,
  ApCompatibilityType,
  InCompatibilityFeatures
} from '../ApCompatibility'
import SoftGreDrawer from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'

import * as UI                   from './styledComponents'
import { NetworkTunnelTypeEnum } from './types'
import { SoftGreNetworkTunnel }  from './useSoftGreTunnelActions'



const defaultPayload = {
  fields: ['id', 'name', 'primaryGatewayAddress', 'secondaryGatewayAddress', 'activations',
    'venueActivations', 'apActivations'],
  page: 1,
  pageSize: 10_000,
  searchString: '',
  filters: {}
}

export interface WiFISoftGreRadioOptionProps {
  currentTunnelType: NetworkTunnelTypeEnum
  venueId: string
  networkId?: string
  cachedSoftGre: SoftGreNetworkTunnel[] | undefined
  disabledInfo?: { // can't change for edge
    noChangePermission: boolean,
    isDisabled: boolean,
    tooltip: string | undefined
  }
}

export default function WifiSoftGreRadioOption (props: WiFISoftGreRadioOptionProps) {
  const { currentTunnelType, venueId, networkId, cachedSoftGre, disabledInfo } = props
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [ isLocked, setIsLocked ] = useState<boolean>(false)
  const [ softGreOption, setSoftGreOption ] = useState<DefaultOptionType[]>([])
  const [ gatewayIpMapIds, setGatewayIpMapIds ] = useState<Record<string, string[]>>({})
  const [ getSoftGreOptions ] = useLazyGetSoftGreOptionsQuery()

  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)

  const [softGreDrawerVisible, setSoftGreDrawerVisible] = useState(false)

  const softGreProfileId = Form.useWatch(['softGre', 'newProfileId'], form)

  const optionsDataQuery = useGetSoftGreOptionsQuery(
    { params: { venueId, networkId },
      payload: { ...defaultPayload }
    },
    { skip: !venueId || !networkId }
  )

  useEffect(() => {
    if (optionsDataQuery.data && !form.getFieldValue(['softGre', 'newProfileId'])) {
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
  }, [form, optionsDataQuery])

  useEffect(() => {
    if (currentTunnelType !== NetworkTunnelTypeEnum.SoftGre) {
      form.setFieldValue(['softGre', 'newProfileId'], '')
      form.setFieldValue(['softGre', 'newProfileName'], '')
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

  const onChange = (value:string) => {
    form.setFieldValue(['softGre', 'newProfileName'],
      softGreOption?.find(item => item.value === value)?.label ?? '')

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

  const handleClickProfileDetail = () => {
    setAddDrawerVisible(false)
    setDetailDrawerVisible(true)
  }

  return <Row>
    <Form.Item
      extra={<UI.RadioSubTitle>
        {$t({ defaultMessage: 'Tunnel the traffic to a SoftGRE gateway' })}
      </UI.RadioSubTitle>}
    >
      <UI.RadioWrapper>
        <Tooltip title={disabledInfo?.tooltip}>
          <Radio value={NetworkTunnelTypeEnum.SoftGre}
            disabled={disabledInfo?.isDisabled || disabledInfo?.noChangePermission}>
            {$t({ defaultMessage: 'SoftGRE Tunneling' })}
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
          </Radio>
        </Tooltip>
        {currentTunnelType === NetworkTunnelTypeEnum.SoftGre &&
            <Space wrap>
              <Form.Item noStyle
                name={['softGre', 'newProfileId']}
                rules={[
                  { required: currentTunnelType === NetworkTunnelTypeEnum.SoftGre,
                    message: $t({ defaultMessage: 'Please select a SoftGRE Profile' })
                  },
                  { validator: (_, value) => gatewayIpValidator(value) }
                ]}
                initialValue=''
                children={<Select
                  style={{ width: '150px' }}
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
            </Space>}
      </UI.RadioWrapper>
    </Form.Item>
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
  </Row>
}

