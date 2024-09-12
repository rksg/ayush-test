/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import {  Form, Radio, Row, Space, Select } from 'antd'
import { DefaultOptionType }                from 'antd/lib/select'
import { useIntl }                          from 'react-intl'

import { Tooltip }                                          from '@acx-ui/components'
import { useGetSoftGreOptionsQuery }                        from '@acx-ui/rc/services'
import { hasPolicyPermission, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'

import SoftGreDrawer from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'

import * as UI                   from './styledComponents'
import { NetworkTunnelTypeEnum } from './types'
import { SoftGreNetworkTunnel }  from './useSoftGreTunnelActions'

const defaultPayload = {
  fields: ['id', 'name', 'activations'],
  page: 1,
  pageSize: 10_000,
  searchString: '',
  filters: {}
}

interface WiFISoftGreRadioOptionProps {
  currentTunnelType: NetworkTunnelTypeEnum
  venueId: string
  networkId?: string
  cachedSoftGre: SoftGreNetworkTunnel[]
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

  const softGreProfileId = Form.useWatch(['softGre', 'newProfileId'], form)

  const optionsDataQuery = useGetSoftGreOptionsQuery(
    { params: { venueId, networkId },
      payload: { ...defaultPayload }
    },
    { skip: !venueId || !networkId }
  )

  useEffect(() => {
    if (optionsDataQuery.data) {
      const { options, isLockedOptions } = optionsDataQuery.data
      setSoftGreOption(options)
      setIsLocked(isLockedOptions)
      const profileId = optionsDataQuery.data.id
      if (currentTunnelType === NetworkTunnelTypeEnum.SoftGre && cachedSoftGre.length > 0) {
        const softGreInfo = cachedSoftGre.find(
          sg => sg.venueId === venueId && sg.networkIds.includes(networkId!))
        if (softGreInfo) {
          form.setFieldValue(['softGre', 'newProfileId'], softGreInfo.profileId)
          form.setFieldValue(['softGre', 'newProfileName'], softGreInfo.profileName)
          form.setFieldValue(['softGre', 'oldProfileId'], profileId)
        }
      } else if (profileId) {
        form.setFieldValue(['softGre', 'newProfileId'], profileId)
        form.setFieldValue(['softGre', 'oldProfileId'], profileId)
        form.setFieldValue(['softGre', 'newProfileName'], options.find(item => item.value === profileId)?.label)
      }
    }
  }, [form, optionsDataQuery])

  useEffect(() => {
    if (currentTunnelType !== NetworkTunnelTypeEnum.SoftGre) {
      form.setFieldValue(['softGre', 'newProfileId'], '')
      form.setFieldValue(['softGre', 'newProfileName'], '')
    }
  }, [form, currentTunnelType])

  const addOption = (option: DefaultOptionType) => {
    setSoftGreOption((preState) => {
      return [{ ...option, disabled: isLocked }, ...preState]
    })
    if (!isLocked) {
      form.setFieldValue(['softGre', 'newProfileId'], option.value)
      form.setFieldValue(['softGre', 'newProfileName'], option.label)
    }
  }

  const onChange = (value:string) => {
    form.setFieldValue(['softGre', 'newProfileName'], softGreOption?.find(item => item.value === value)?.label)
  }


  const handleClickAdd = () => {
    setDetailDrawerVisible(false)
    setAddDrawerVisible(true)
  }

  const handleClickProfileDetail = () => {
    setAddDrawerVisible(false)
    setDetailDrawerVisible(true)
  }

  return <Row>
    <Form.Item
      help={<UI.RadioSubTitle>
        {$t({ defaultMessage: 'Tunnel the traffic to an third party WLAN gateway' })}
      </UI.RadioSubTitle>}
    >
      <UI.RadioWrapper>
        <Tooltip title={disabledInfo?.tooltip}>
          <Radio value={NetworkTunnelTypeEnum.SoftGre}
            disabled={disabledInfo?.isDisabled || disabledInfo?.noChangePermission}>
            {$t({ defaultMessage: 'SoftGRE Tunneling' })}
          </Radio>
        </Tooltip>
        {currentTunnelType === NetworkTunnelTypeEnum.SoftGre &&
              <Space wrap>
                <Form.Item noStyle
                  name={['softGre', 'newProfileId']}
                  rules={[{ required: currentTunnelType === NetworkTunnelTypeEnum.SoftGre }]}
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
      readMode={true}
      editMode={false}
    />
    <SoftGreDrawer
      visible={addDrawerVisible}
      setVisible={setAddDrawerVisible}
      readMode={false}
      editMode={false}
      callbackFn={addOption}
    />
  </Row>
}

