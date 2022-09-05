
import React, { useState } from 'react'

import {
  Button,
  Checkbox,
  Form,
  Select,
  Slider,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import {
  useDevicePolicyListQuery,
  useL2AclPolicyListQuery,
  useL3AclPolicyListQuery,
  useApplicationPolicyListQuery,
  useAccessControlProfileListQuery
} from '@acx-ui/rc/services'
import {
  AccessControlProfile
} from '@acx-ui/rc/utils'
import { transformDisplayText } from '@acx-ui/rc/utils'
import { useParams }            from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const { useWatch } = Form
const { Option } = Select

const listPayload = {
  fields: ['name', 'id'], sortField: 'name',
  sortOrder: 'ASC', page: 1, pageSize: 10000
}

export function AccessControlForm () {
  const { $t } = useIntl()
  const [enabledProfile, setEnabledProfile] = useState(false)

  return (
    <div style={{ marginBottom: '30px' }}>
      <span style={{
        display: 'grid',
        gridTemplateColumns: '220px 130px auto',
        alignItems: 'baseline',
        margin: '20px 0'
      }}>
        <UI.Subtitle level={4}>
          {$t({ defaultMessage: 'Access Control' })}
        </UI.Subtitle>

        <span>
          {!enabledProfile && <SaveAsAcProfileButton />}
        </span>
        <Button
          type='link'
          style={{ padding: 0 }}
          onClick={() => {
            setEnabledProfile(!enabledProfile)
          }}
        >
          {enabledProfile ? $t({ defaultMessage: 'Select separate profiles' })
            : $t({ defaultMessage: 'Select Access Control profile' })
          }
        </Button>
      </span>


      {enabledProfile ?
        <SelectAccessProfileProfile /> :
        <AccessControlConfigForm />}
    </div>)
}

function SaveAsAcProfileButton () {
  const { $t } = useIntl()
  return (
    <Button
      type='link'
      style={{ padding: 0 }}
      disabled={true}
    >
      {$t({ defaultMessage: 'Save as AC Profile' })}
    </Button>
  )
}

function getAccessControlProfile <
  Key extends keyof Omit<AccessControlProfile, 'name' | 'id' | 'rateLimiting'>,
  Policies extends Array<{ id: string, name: string }>
> (
  policies: Policies | undefined,
  accessControlProfile: AccessControlProfile | undefined,
  policyKey: Key
) {
  if (!accessControlProfile) return transformDisplayText()
  let name
  const policy = accessControlProfile[policyKey]
  if (policy && policy.enabled && policies) {
    name = policies.find(item => item.id === policy.id)?.name
  }
  return transformDisplayText(name)
}

function SelectAccessProfileProfile () {
  const { $t } = useIntl()
  const [state, updateState] = useState({
    selectedAccessControlProfile: undefined as AccessControlProfile | undefined
  })

  const { selectedLayer2 } = useL2AclPolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        selectedLayer2: getAccessControlProfile(
          data?.data,
          state.selectedAccessControlProfile,
          'l2AclPolicy'
        )
      }
    }
  })

  const { selectedLayer3 } = useL3AclPolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        selectedLayer3: getAccessControlProfile(
          data?.data,
          state.selectedAccessControlProfile,
          'l3AclPolicy'
        )
      }
    }
  })

  const { selectedDevicePolicy } = useDevicePolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        selectedDevicePolicy: getAccessControlProfile(
          data?.data,
          state.selectedAccessControlProfile,
          'devicePolicy'
        )
      }
    }
  })

  const { selectedApplicationPolicy } = useApplicationPolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        selectedApplicationPolicy: getAccessControlProfile(
          data?.data,
          state.selectedAccessControlProfile,
          'applicationPolicy'
        )
      }
    }
  })

  //Access control list
  const { accessControlProfileSelectOptions, accessControlList }
    = useAccessControlProfileListQuery({
      params: useParams()
    }, {
      selectFromResult ({ data }) {
        return {
          accessControlProfileSelectOptions: data?.map(
            item => <Option key={item.id}>{item.name}</Option>) ?? [],
          accessControlList: data
        }
      }
    })

  const onAccessPolicyChange = function (id: string) {
    const data = id ? accessControlList?.find(profile => profile.id === id) : undefined
    updateState({
      selectedAccessControlProfile: data
    })
  }

  const getLinkLimitByAccessControlPorfile =
    function (accessControlProfile: AccessControlProfile | undefined, type: string) {
      let limit = 'Unlimited'
      if (accessControlProfile && accessControlProfile.rateLimiting
        && accessControlProfile.rateLimiting[type] !== 0) {
        limit = accessControlProfile.rateLimiting[type] + ' Mbps'
      }
      return limit
    }

  const [enableAccessControlProfile] = [useWatch('enableAccessControlProfile')]
  return (<>
    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Access Control' })}
      <Form.Item
        name='enableAccessControlProfile'
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch />}
      />
    </UI.FieldLabel>

    {enableAccessControlProfile && <Form.Item
      label={$t({ defaultMessage: 'Access Control Policy' })}
      name={['wlan','advancedCustomization','accessControlProfileId']}
    >
      <Select placeholder={$t({ defaultMessage: 'Select profile...' })}
        style={{ width: '180px' }}
        onChange={onAccessPolicyChange}
        children={accessControlProfileSelectOptions} />

    </Form.Item>}

    <UI.FieldLabel width='175px' style={{ fontWeight: 700 }}>
      <span>{$t({ defaultMessage: 'Access Policy' })}</span>
      <span>{$t({ defaultMessage: 'Policy Details' })}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Layer 2' })}
      <span>{selectedLayer2}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Layer 3' })}
      <span>{selectedLayer3}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Device & OS' })}
      <span>{selectedDevicePolicy}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Applications' })}
      <span>{selectedApplicationPolicy}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'
    >
      {$t({ defaultMessage: 'Client Rate Limit' })}
      <span>{(!state.selectedAccessControlProfile ||
        state.selectedAccessControlProfile.rateLimiting?.enabled === false) && '--'}</span>
      {(state.selectedAccessControlProfile &&
          state.selectedAccessControlProfile.rateLimiting?.enabled) &&
          <div>
            <UI.RateLimitBlock>
              <label>{$t({ defaultMessage: 'Up:' })}</label>
              <div>{getLinkLimitByAccessControlPorfile(state.selectedAccessControlProfile,
                'uplinkLimit')}</div>
            </UI.RateLimitBlock>
            <UI.RateLimitBlock>
              <label>{$t({ defaultMessage: 'Down:' })}</label>
              <div>{getLinkLimitByAccessControlPorfile(state.selectedAccessControlProfile,
                'downlinkLimit')}</div>
            </UI.RateLimitBlock>
          </div>
      }
    </UI.FieldLabel>
  </>)
}

function AccessControlConfigForm () {
  const { $t } = useIntl()
  const [
    enableLayer2,
    enableLayer3,
    enableDeviceOs,
    enableApplications,
    enableDownloadLimit,
    enableUploadLimit,
    enableClientRateLimit
  ] = [
    useWatch<boolean>(['wlan','advancedCustomization','l2AclEnable']),
    useWatch<boolean>(['wlan','advancedCustomization','l3AclEnable']),
    useWatch<boolean>('enableDeviceOs'),
    useWatch<boolean>(['wlan','advancedCustomization','applicationPolicyEnable']),
    useWatch<boolean>('enableDownloadLimit'),
    useWatch<boolean>('enableUploadLimit'),
    useWatch<boolean>('enableClientRateLimit')
  ]

  const { layer2SelectOptions } = useL2AclPolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        layer2SelectOptions: data?.data?.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? []
      }
    }
  })

  const { layer3SelectOptions } = useL3AclPolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        layer3SelectOptions: data?.data?.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? []
      }
    }
  })

  const { devicePolicySelectOptions } = useDevicePolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        devicePolicySelectOptions: data?.data?.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? []
      }
    }
  })

  const { applicationPolicySelectOptions } = useApplicationPolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        applicationPolicySelectOptions: data?.data?.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? []
      }
    }
  })

  return (<>
    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Layer 2' })}
      <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
        <Form.Item
          name={['wlan','advancedCustomization','l2AclEnable']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />

        {enableLayer2 && <>
          <Form.Item
            name={['wlan','advancedCustomization','l2AclPolicyId']}
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select placeholder={$t({ defaultMessage: 'Select profile...' })}
                style={{ width: '180px' }}
                children={layer2SelectOptions} />
            }
          />
          {$t({ defaultMessage: 'Add' })}
        </>}
      </div>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Layer 3' })}
      <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
        <Form.Item
          name={['wlan','advancedCustomization','l3AclEnable']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />

        {enableLayer3 && <>
          <Form.Item
            name={['wlan','advancedCustomization','l3AclPolicyId']}
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select placeholder={$t({ defaultMessage: 'Select profile...' })}
                style={{ width: '180px' }}
                children={layer3SelectOptions} />
            }
          />
          {$t({ defaultMessage: 'Add' })}
        </>}
      </div>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Device & OS' })}
      <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
        <Form.Item
          name='enableDeviceOs'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />

        {enableDeviceOs && <>
          <Form.Item
            name={['wlan','advancedCustomization','devicePolicyId']}
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select placeholder={$t({ defaultMessage: 'Select profile...' })}
                style={{ width: '180px' }}
                children={devicePolicySelectOptions} />
            }
          />
          {$t({ defaultMessage: 'Add' })}
        </>}
      </div>
    </UI.FieldLabel>


    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Applications' })}
      <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
        <Form.Item
          name={['wlan','advancedCustomization','applicationPolicyEnable']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />

        {enableApplications && <>
          <Form.Item
            name={['wlan','advancedCustomization','applicationPolicyId']}
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select placeholder={$t({ defaultMessage: 'Select profile...' })}
                style={{ width: '180px' }}
                children={applicationPolicySelectOptions} />
            }
          />
          {$t({ defaultMessage: 'Add' })}
        </>}
      </div>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Client Rate Limit' })}
      <Form.Item
        name='enableClientRateLimit'
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch />}
      />
    </UI.FieldLabel>

    {enableClientRateLimit && <>

      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='enableUploadLimit'
          valuePropName='checked'
          initialValue={false}
          style={{ lineHeight: '50px' }}
          children={
            <Checkbox data-testid='enableUploadLimit'
              children={$t({ defaultMessage: 'Upload Limit' })} />}
        />
        {
          enableUploadLimit ?
            <UI.FormItemNoLabel
              name={['wlan','advancedCustomization','userUplinkRateLimiting']}
              children={
                <RateSlider />
              }
            /> :
            <Unlimited />
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='enableDownloadLimit'
          valuePropName='checked'
          initialValue={false}
          style={{ lineHeight: '50px' }}
          children={
            <Checkbox data-testid='enableDownloadLimit'
              children={$t({ defaultMessage: 'Download Limit' })} />}
        />

        {
          enableDownloadLimit ?
            <UI.FormItemNoLabel
              name={['wlan','advancedCustomization','userDownlinkRateLimiting']}
              children={
                <RateSlider />
              }
            /> : <Unlimited />
        }
      </div>
    </>}
  </>)

}

function Unlimited () {
  const { $t } = useIntl()
  return (
    <UI.Label
      style={{ lineHeight: '50px' }}>
      {$t({ defaultMessage: 'Unlimited' })}
    </UI.Label>
  )
}

function RateSlider () {
  return (
    <Slider
      tooltipVisible={false}
      style={{ width: '245px' }}
      defaultValue={20}
      min={1}
      max={200}
      marks={{
        0: { label: '1 Mbps' },
        200: { label: '200 Mbps' }
      }}
    />
  )
}
