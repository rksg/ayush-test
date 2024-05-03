import { useContext, useEffect, useRef, useState } from 'react'

import { Input, Space } from 'antd'
import {
  Form
} from 'antd'
import { cloneDeep }                 from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  GridCol,
  GridRow,
  Select,
  StepsFormLegacy
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { InformationSolid }       from '@acx-ui/icons'
import {
  useGetIdentityProviderListQuery,
  useGetWifiOperatorListQuery
}              from '@acx-ui/rc/services'
import {
  AAAWlanSecurityEnum,
  ManagementFrameProtectionEnum,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { IDENTITY_PROVIDER_MAX_COUNT, WIFI_OPERATOR_MAX_COUNT } from '../../policies'
import { NetworkDiagram }                                       from '../NetworkDiagram/NetworkDiagram'
import { MLOContext }                                           from '../NetworkForm'
import NetworkFormContext                                       from '../NetworkFormContext'
import { NetworkMoreSettingsForm }                              from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { NETWORK_IDENTITY_PROVIDER_MAX_COUNT } from './Hotspot20/constants'
import IdentityProviderDrawer                  from './Hotspot20/IdentityProviderDrawer'
import WifiOperatorDrawer                      from './Hotspot20/WifiOperatorDrawer'


const { Option } = Select

export function Hotspot20SettingsForm () {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()

  useEffect(()=>{
    if(data && (editMode || cloneMode)){

      form.setFieldsValue({
        wlan: {
          wlanSecurity: data.wlan?.wlanSecurity,
          managementFrameProtection: data.wlan?.managementFrameProtection
        },
        hotspot20Settings: data.hotspot20Settings
      })
    }
  }, [data])

  return (<>
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <Hotspot20Form />
      </GridCol>
      <GridCol col={{ span: 14 }}>
        <NetworkDiagram />
      </GridCol>
    </GridRow>
    {!(editMode) && <GridRow>
      <GridCol col={{ span: 24 }}>
        <NetworkMoreSettingsForm wlanData={data} />
      </GridCol>
    </GridRow>}
  </>)
}

function Hotspot20Form () {
  const { $t } = useIntl()
  const { useWatch } = Form
  const { editMode, cloneMode } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)
  const wlanSecurity = useWatch(['wlan', 'wlanSecurity'])
  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)
  const wpa2Description = <FormattedMessage
    /* eslint-disable max-len */
    defaultMessage={`
      WPA2 is strong Wi-Fi security that is widely available on all mobile devices manufactured after 2006.
      WPA2 should be selected unless you have a specific reason to choose otherwise.
      <highlight>
        6GHz radios are only supported with WPA3.
      </highlight>
    `}
    /* eslint-enable */
    values={{
      highlight: (chunks) => <Space align='start'>
        <InformationSolid />
        {chunks}
      </Space>
    }}
  />

  const wpa3Description = $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'WPA3 is the highest level of Wi-Fi security available but is supported only by devices manufactured after 2019.'
  })

  const form = Form.useFormInstance()
  useEffect(() => {
    if (!editMode && !cloneMode) {
      if (!wlanSecurity || !Object.keys(AAAWlanSecurityEnum).includes(wlanSecurity)) {
        form.setFieldValue(['wlan', 'wlanSecurity'], WlanSecurityEnum.WPA2Enterprise)
        // eslint-disable-next-line max-len
        form.setFieldValue(['wlan', 'managementFrameProtection'], ManagementFrameProtectionEnum.Disabled)
      }
    }

    if (wlanSecurity === WlanSecurityEnum.WPA3){
      disableMLO(false)
    } else {
      disableMLO(true)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }

  }, [cloneMode, editMode, form, wlanSecurity])

  const handleWlanSecurityChanged = (v: WlanSecurityEnum) => {
    const managementFrameProtection = (v === WlanSecurityEnum.WPA3)
      ? ManagementFrameProtectionEnum.Required
      : ManagementFrameProtectionEnum.Disabled

    form.setFieldValue(['wlan', 'managementFrameProtection'], managementFrameProtection)
  }
  return (
    <>
      <StepsFormLegacy.Title>{
        $t({ defaultMessage: 'Hotspot 2.0 Settings' }) }</StepsFormLegacy.Title>
      {triBandRadioFeatureFlag &&
          <Form.Item
            label='Security Protocol'
            name={['wlan', 'wlanSecurity']}
            extra={
              wlanSecurity === WlanSecurityEnum.WPA2Enterprise
                ? wpa2Description
                : wpa3Description
            }
          >
            <Select onChange={handleWlanSecurityChanged}>
              <Option value={WlanSecurityEnum.WPA2Enterprise}>
                { $t({ defaultMessage: 'WPA2 (Recommended)' }) }
              </Option>
              <Option value={WlanSecurityEnum.WPA3}>{ $t({ defaultMessage: 'WPA3' }) }</Option>
            </Select>
          </Form.Item>
      }
      <Form.Item name={['wlan', 'managementFrameProtection']} noStyle>
        <Input type='hidden' />
      </Form.Item>

      <Hotspot20Service />
    </>
  )

  function Hotspot20Service () {
    const { $t } = useIntl()
    const { editMode, cloneMode, data } = useContext(NetworkFormContext)
    const params = useParams()
    const { networkId } = params
    const [showOperatorDrawer, setShowOperatorDrawer] = useState(false)
    const [showProviderDrawer, setShowProviderDrawer] = useState(false)
    const [disabledSelectProviders, setDisabledSelectProviders] = useState(false)
    const wifiOperatorId = useRef<string>()
    const defaultPayload = {
      fields: ['name', 'id'],
      pageSize: 100,
      sortField: 'name',
      sortOrder: 'ASC'
    }

    const networkFilter = {
      fields: ['id'],
      pageSize: 100,
      sortField: 'name',
      sortOrder: 'ASC',
      filters: {
        wifiNetworkIds: [
          networkId
        ]
      }
    }

    const { providerSelectOptions } = useGetIdentityProviderListQuery({ payload: defaultPayload }, {
      selectFromResult: ({ data }) => {
        const providerOptions = data?.data.map(item => ({ label: item.name, value: item.id })) ?? []
        return { providerSelectOptions: providerOptions }
      }
    })

    const { operatorSelectOptions } = useGetWifiOperatorListQuery({ payload: defaultPayload }, {
      selectFromResult: ({ data }) => {
        const operatorOptions = data?.data.map(item => ({ label: item.name, value: item.id })) ?? []
        return { operatorSelectOptions: operatorOptions }
      }
    })

    const selectedProviderList = useGetIdentityProviderListQuery(
      { payload: networkFilter },
      { skip: !networkId }
    )

    const selectedOperatorList = useGetWifiOperatorListQuery(
      { payload: networkFilter },
      { skip: !networkId }
    )

    const selectedProviderIds = selectedProviderList.data?.data.map(item => item.id)
    const selectedOperatorId = selectedOperatorList && selectedOperatorList.data?.totalCount &&
      selectedOperatorList.data?.data.map(item => item.id).at(0)

    useEffect(() => {
      if (wifiOperatorId.current !== undefined &&
        operatorSelectOptions.find(op => op.value === wifiOperatorId.current) !== undefined) {
        form.setFieldValue(['hotspot20Settings', 'wifiOperator'], wifiOperatorId.current)
        wifiOperatorId.current = undefined
      }
    }, [operatorSelectOptions, wifiOperatorId])

    useEffect(() => {
      if (data && (editMode || cloneMode) && providerSelectOptions && selectedProviderIds) {
        form.setFieldValue(['hotspot20Settings', 'identityProviders'], selectedProviderIds)
      }
    }, [cloneMode, data, editMode, providerSelectOptions, selectedProviderIds])

    useEffect(() => {
      if (data && (editMode || cloneMode) && operatorSelectOptions && selectedOperatorId) {
        wifiOperatorId.current = selectedOperatorId
      }
    }, [cloneMode, data, editMode, operatorSelectOptions, selectedOperatorId])

    const handleAddOperator = () => {
      setShowOperatorDrawer(true)
    }

    const handleAddProvider = () => {
      setShowProviderDrawer(true)
    }

    const handleSaveWifiOperator = (id?: string) => {
      if (id) {
        wifiOperatorId.current = id
      }
      setShowOperatorDrawer(false)
    }

    const handleSaveIdentityProvider = (id?: string) => {
      const identityProviders = form.getFieldValue(['hotspot20Settings', 'identityProviders']) ?? []
      if (id && !identityProviders.includes(id)) {
        const newIdentityProviders = cloneDeep(identityProviders)
        newIdentityProviders.push(id)
        form.setFieldValue(['hotspot20Settings', 'identityProviders'], newIdentityProviders)
      }
      setShowProviderDrawer(false)
    }

    return (
      <>
        <Space>
          <Form.Item
            label={$t({ defaultMessage: 'Wi-Fi Operator' })}
            name={['hotspot20Settings', 'wifiOperator']}
            rules={[
              { required: true,
                message: $t({ defaultMessage: 'Please select Wi-Fi Operator' })
              }
            ]}>
            <Select
              style={{ width: '280px' }}
              options={operatorSelectOptions} />
          </Form.Item>
          <Button type='link'
            disabled={operatorSelectOptions.length >= WIFI_OPERATOR_MAX_COUNT}
            onClick={handleAddOperator}
            children={$t({ defaultMessage: 'Add' })}
            style={{ paddingTop: '10px' }} />
        </Space>

        <Space>
          <Form.Item
            label='Identity Provider'
            name={['hotspot20Settings', 'identityProviders']}
            rules={[
              { required: true,
                message: $t({ defaultMessage: 'Please select Identity Provider(s)' })
              }
            ]}>
            <Select
              mode='multiple'
              open={disabledSelectProviders ? false : undefined}
              style={{ width: '280px' }}
              options={providerSelectOptions}
              onChange={(newProviders: string[]) => {
                if (newProviders.length >= NETWORK_IDENTITY_PROVIDER_MAX_COUNT) {
                  setDisabledSelectProviders(true)
                } else {
                  setDisabledSelectProviders(false)
                }
              }}
            />
          </Form.Item>
          <Button type='link'
            disabled={providerSelectOptions.length >= IDENTITY_PROVIDER_MAX_COUNT}
            onClick={handleAddProvider}
            children={$t({ defaultMessage: 'Add' })}
            style={{ paddingTop: '10px' }} />
        </Space>

        <WifiOperatorDrawer
          visible={showOperatorDrawer}
          setVisible={setShowOperatorDrawer}
          handleSave={handleSaveWifiOperator}
        />

        <IdentityProviderDrawer
          visible={showProviderDrawer}
          setVisible={setShowProviderDrawer}
          handleSave={handleSaveIdentityProvider}
        />
      </>
    )
  }
}