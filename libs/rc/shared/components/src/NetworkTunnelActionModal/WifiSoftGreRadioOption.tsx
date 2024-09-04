/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import {  Form, FormInstance, Radio, Row, Space, Select } from 'antd'
import { DefaultOptionType }                              from 'antd/lib/select'
import { useIntl }                                        from 'react-intl'

import { useGetSoftGreOptionsQuery }               from '@acx-ui/rc/services'
import { WifiScopes }                              from '@acx-ui/types'
import { hasPermission, hasCrossVenuesPermission } from '@acx-ui/user'

import SoftGreDrawer from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'

import * as UI                                            from './styledComponents'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum } from './types'

const defaultPayload = {
  fields: ['id', 'name', 'activations'],
  page: 1,
  pageSize: 10_000,
  searchString: '',
  filters: {}
}

interface WiFISoftGreRadioOptionProps {
  form: FormInstance<NetworkTunnelActionForm>
  currentTunnelType: NetworkTunnelTypeEnum
  venueId: string
  networkId?: string
}

export default function WifiSoftGreRadioOption (props: WiFISoftGreRadioOptionProps) {
  const { form, currentTunnelType, venueId, networkId } = props
  const { $t } = useIntl()
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
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
      setSoftGreOption(optionsDataQuery.data.options)
      if (optionsDataQuery.data.id) {
        form.setFieldValue(['softGre', 'newProfileId'], optionsDataQuery.data.id)
        form.setFieldValue(['softGre', 'oldProfileId'], optionsDataQuery.data.id)
      }
    }
  }, [form, optionsDataQuery])

  useEffect(() => {
    if (currentTunnelType !== NetworkTunnelTypeEnum.SoftGre) {
      form.setFieldValue(['softGre', 'newProfileId'], '')
    }
  }, [form, currentTunnelType])

  const addOption = (option: DefaultOptionType) => {
    setSoftGreOption((preState) => {
      return [option, ...preState]
    })
    form.setFieldValue(['softGre', 'newProfileId'], option.value)
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
        <Radio value={NetworkTunnelTypeEnum.SoftGre} >
          {$t({ defaultMessage: 'SoftGRE Tunneling' })}
        </Radio>
        {currentTunnelType === NetworkTunnelTypeEnum.SoftGre &&
              <Space wrap>
                <Form.Item noStyle
                  name={['softGre', 'newProfileId']}
                  rules={[{ required: currentTunnelType === NetworkTunnelTypeEnum.SoftGre }]}
                  initialValue=''
                  children={<Select
                    style={{ width: '150px' }}
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
                  disabled={!(hasCrossVenuesPermission({ needGlobalPermission: true }) && hasPermission({ scopes: [WifiScopes.CREATE] }))}
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

