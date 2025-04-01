import React, { useContext, useEffect, useRef, useState } from 'react'

import { Input, Space } from 'antd'
import {
  Form
} from 'antd'
import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

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
  hasPolicyPermission,
  ManagementFrameProtectionEnum,
  PolicyOperation,
  PolicyType,
  SecurityOptionsDescription,
  useConfigTemplate,
  WifiNetworkMessages,
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
import { IdentityGroup }                       from './SharedComponent/IdentityGroup/IdentityGroup'


const { Option } = Select

export function Hotspot20SettingsForm () {
  const { editMode, cloneMode, data, isRuckusAiMode } = useContext(NetworkFormContext)
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
    {!(editMode) && !(isRuckusAiMode) && <GridRow>
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
  // eslint-disable-next-line max-len
  const isWifiIdentityManagementEnable = useIsSplitOn(Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const { disableMLO } = useContext(MLOContext)
  const form = Form.useFormInstance()
  const wlanSecurity = useWatch(['wlan', 'wlanSecurity'])
  const wpa2Description = <>
    {$t(WifiNetworkMessages.WPA2_DESCRIPTION)}
    <Space align='start'>
      <InformationSolid />
      {$t(SecurityOptionsDescription.WPA2_DESCRIPTION_WARNING)}
    </Space>
  </>

  const wpa3Description = $t(SecurityOptionsDescription.WPA3)

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

  }, [cloneMode, disableMLO, editMode, form, wlanSecurity])

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
      <Form.Item name={['wlan', 'managementFrameProtection']} noStyle>
        <Input type='hidden' />
      </Form.Item>

      <Hotspot20Service />
      { (isWifiIdentityManagementEnable && !isTemplate) && <IdentityGroup />}
    </>
  )

}

function Hotspot20Service () {
  const { $t } = useIntl()
  const { editMode, cloneMode, data, setData } = useContext(NetworkFormContext)
  const params = useParams()
  const { networkId } = params
  const form = Form.useFormInstance()
  const [showOperatorDrawer, setShowOperatorDrawer] = useState(false)
  const [showProviderDrawer, setShowProviderDrawer] = useState(false)
  const [disabledSelectProvider, setDisabledSelectProvider] = useState(false)
  const disabledAddProvider = useRef<boolean>(false)
  const isInitProviders = useRef<boolean>(true)
  const accProviders = useRef<Set<string>>()
  const supportHotspot20NasId = useIsSplitOn(Features.WIFI_NAS_ID_HOTSPOT20_TOGGLE)
  const defaultPayload = {
    fields: ['name', 'id', 'wifiNetworkIds', 'accountingRadiusId'],
    pageSize: 100,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const { operatorSelectOptions, selectedOperatorId } = useGetWifiOperatorListQuery(
    { payload: defaultPayload }, {
      selectFromResult: ({ data }) => {
        const d = data?.data
        const operatorOptions = d?.map(item => ({ label: item.name, value: item.id })) ?? []
        const selectedOperator = networkId && d?.filter(item => item.wifiNetworkIds
          ?.includes(networkId)).map(item => item.id)?.at(0)
        return { operatorSelectOptions: operatorOptions, selectedOperatorId: selectedOperator }
      }
    })

  const { providerSelectOptions, selectedProviderIds } = useGetIdentityProviderListQuery(
    { payload: defaultPayload }, {
      selectFromResult: ({ data: identityData }) => {
        const providers = identityData?.data
        if (supportHotspot20NasId) {
          let identitiesWithAcc = new Set<string>()
          for (let provider of (providers ?? [])) {
            if (provider.accountingRadiusId) {
              identitiesWithAcc.add(provider.id as string)
            }
          }
          accProviders.current = identitiesWithAcc
        }
        const seletedIds = networkId && providers?.filter(item => item.wifiNetworkIds
          ?.includes(networkId)).map(item => item.id)
        const providerOptions = providers?.map(
          item => ({ label: item.name, value: item.id } )) ?? []
        disabledAddProvider.current = providerOptions.length >= IDENTITY_PROVIDER_MAX_COUNT
        return { providerSelectOptions: providerOptions, selectedProviderIds: seletedIds }
      }
    })

  useEffect(() => {
    form.setFieldValue(['hotspot20Settings', 'originalOperator'], selectedOperatorId)
  }, [selectedOperatorId])

  useEffect(() => {
    form.setFieldValue(['hotspot20Settings', 'originalProviders'], selectedProviderIds)
  }, [selectedProviderIds])

  useEffect(() => {
    if ( (editMode || cloneMode) && !form.isFieldsTouched() && selectedOperatorId &&
     !data?.hotspot20Settings?.wifiOperator) {
      form.setFieldValue(['hotspot20Settings', 'wifiOperator'], selectedOperatorId)
    }
  }, [cloneMode, editMode, selectedOperatorId])

  useEffect(() => {
    if ( (editMode || cloneMode) && !form.isFieldsTouched() && selectedProviderIds &&
      !data?.hotspot20Settings?.identityProviders && isInitProviders.current) {
      form.setFieldValue(['hotspot20Settings', 'identityProviders'], selectedProviderIds)
      setDisabledSelectProvider(selectedProviderIds.length >= NETWORK_IDENTITY_PROVIDER_MAX_COUNT)
    }
  }, [cloneMode, editMode, selectedProviderIds])

  const handleAddOperator = () => {
    setShowOperatorDrawer(true)
  }

  const handleAddProvider = () => {
    setShowProviderDrawer(true)
  }

  const handleSaveWifiOperator = (id?: string) => {
    if (id) {
      form.setFieldValue(['hotspot20Settings', 'wifiOperator'], id)
      form.validateFields()
    }
    setShowOperatorDrawer(false)
  }

  const handleSaveIdentityProvider = (id?: string) => {
    const identityProviders = form.getFieldValue(['hotspot20Settings', 'identityProviders']) ?? []
    if (id && !identityProviders.includes(id) &&
    identityProviders.length < NETWORK_IDENTITY_PROVIDER_MAX_COUNT) {
      isInitProviders.current = false
      let newIdentityProviders = cloneDeep(identityProviders)
      newIdentityProviders.push(id)
      form.setFieldValue(['hotspot20Settings', 'identityProviders'], newIdentityProviders)
      disabledAddProvider.current = providerSelectOptions.length >= IDENTITY_PROVIDER_MAX_COUNT
      form.validateFields()
    }
    setShowProviderDrawer(false)
    setDisabledSelectProvider(
      identityProviders.length >= NETWORK_IDENTITY_PROVIDER_MAX_COUNT)
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
        { hasPolicyPermission({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.CREATE }) &&
          <Button type='link'
            disabled={operatorSelectOptions.length >= WIFI_OPERATOR_MAX_COUNT}
            onClick={handleAddOperator}
            children={$t({ defaultMessage: 'Add' })} />
        }
      </Space>

      <Space align='start'>
        <Form.Item
          label='Identity Provider'
          name={['hotspot20Settings', 'identityProviders']}
          rules={[
            { required: true,
              message: $t({ defaultMessage: 'Please select Identity Provider(s)' })
            }
          ]}
          extra={$t({ defaultMessage: 'Select up to 6' })}>
          <Select
            mode='multiple'
            style={{ width: '280px' }}
            open={disabledSelectProvider ? false : undefined}
            options={providerSelectOptions}
            onChange={(newProviders: string[]) => {
              setDisabledSelectProvider(
                newProviders.length >= NETWORK_IDENTITY_PROVIDER_MAX_COUNT)
              if (supportHotspot20NasId) {
                let enableAcc = false
                for (let provider of newProviders) {
                  if (accProviders.current?.has(provider)) {
                    enableAcc = true
                    break
                  }
                }
                setData && setData({
                  ...data,
                  enableAccountingService: enableAcc,
                  hotspot20Settings: {
                    ...data?.hotspot20Settings,
                    identityProviders: newProviders
                  }
                })
              }
            }}
          />
        </Form.Item>
        { // eslint-disable-next-line max-len
          hasPolicyPermission({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.CREATE }) &&
          <Button type='link'
            disabled={disabledAddProvider.current}
            onClick={handleAddProvider}
            children={$t({ defaultMessage: 'Add' })}
            style={{ paddingTop: '36px' }} />
        }
      </Space>

      {editMode &&
        <>
          <Form.Item
            name={['hotspot20Settings', 'originalOperator']}
            hidden={true}
            noStyle>
            <Input />
          </Form.Item>

          <Form.Item
            name={['hotspot20Settings', 'originalProviders']}
            hidden={true}
            noStyle>
            <Select
              mode='multiple'
              options={providerSelectOptions}
            />
          </Form.Item>
        </>
      }

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
