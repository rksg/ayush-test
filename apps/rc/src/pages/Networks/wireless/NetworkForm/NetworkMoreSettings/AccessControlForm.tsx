
import React, { useContext, useEffect, useRef, useState } from 'react'

import {
  Checkbox,
  Form,
  Select,
  Slider,
  Switch
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import _, { get }              from 'lodash'
import { useIntl }             from 'react-intl'

import { Button, Modal, ModalType, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import {
  useDevicePolicyListQuery,
  useL2AclPolicyListQuery,
  useL3AclPolicyListQuery,
  useApplicationPolicyListQuery,
  useAccessControlProfileListQuery,
  useAddAccessControlProfileMutation
} from '@acx-ui/rc/services'
import {
  AccessControlFormFields,
  AccessControlProfile
} from '@acx-ui/rc/utils'
import { transformDisplayText } from '@acx-ui/rc/utils'
import { useParams }            from '@acx-ui/react-router-dom'


import {
  convertToPayload,
  genAclPayloadObject
} from '../../../../Policies/AccessControl/AccessControlForm/AccessControlForm'
import AccessControlSettingForm from '../../../../Policies/AccessControl/AccessControlForm/AccessControlSettingForm'
import ApplicationDrawer        from '../../../../Policies/AccessControl/AccessControlForm/ApplicationDrawer'
import DeviceOSDrawer           from '../../../../Policies/AccessControl/AccessControlForm/DeviceOSDrawer'
import Layer2Drawer             from '../../../../Policies/AccessControl/AccessControlForm/Layer2Drawer'
import Layer3Drawer             from '../../../../Policies/AccessControl/AccessControlForm/Layer3Drawer'
import NetworkFormContext       from '../NetworkFormContext'

import * as UI from './styledComponents'

const { useWatch } = Form
const { Option } = Select

export function AccessControlForm () {
  const { $t } = useIntl()
  const [enabledProfile, setEnabledProfile] = useState(false)

  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()

  useEffect(() => {
    if (data?.wlan?.advancedCustomization) {
      form.setFieldsValue({
        enableDeviceOs: !_.isEmpty(data.wlan.advancedCustomization.devicePolicyId),
        enableDownloadLimit: (get(data,
          'wlan.advancedCustomization.userDownlinkRateLimiting')) > 0,
        enableUploadLimit: (get(data,
          'wlan.advancedCustomization.userUplinkRateLimiting')) > 0,
        enableClientRateLimit: (get(data,
          'wlan.advancedCustomization.userDownlinkRateLimiting')) > 0 ||
          (get(data,
            'wlan.advancedCustomization.userUplinkRateLimiting')) > 0,
        accessControlProfileEnable: !_.isEmpty(get(data,
          'wlan.advancedCustomization.accessControlProfileId'))
      })
      setEnabledProfile(!_.isEmpty(
        get(data, 'wlan.advancedCustomization.accessControlProfileId')))
    }
  }, [data])

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

        {!enabledProfile && <SaveAsAcProfileButton />}

        <Button
          type='link'
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
        // eslint-disable-next-line max-len
        <SelectAccessProfileProfile accessControlProfileId={get(data, 'wlan.advancedCustomization.accessControlProfileId')}/> :
        <AccessControlConfigForm />}
    </div>)
}

function SaveAsAcProfileButton () {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const [visible, setVisible] = useState(false)

  const [ createAclProfile ] = useAddAccessControlProfileMutation()

  const formRef = useRef<StepsFormLegacyInstance<AccessControlFormFields>>()

  return (
    <>
      <Button
        type='link'
        onClick={() => setVisible(true)}
      >
        {$t({ defaultMessage: 'Save as AC Profile' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add Access Control Policy' })}
        visible={visible}
        type={ModalType.ModalStepsForm}
      >
        <StepsFormLegacy<AccessControlFormFields>
          formRef={formRef}
          onCancel={() => setVisible(false)}
          onFinish={async () => {
            try {
              const aclPayloadObject = genAclPayloadObject(
                formRef.current?.getFieldsValue() as AccessControlFormFields
              )
              await createAclProfile({
                params: params,
                payload: convertToPayload(false, aclPayloadObject, params.policyId)
              }).unwrap()

              setVisible(false)
            } catch (error) {
              console.log(error) // eslint-disable-line no-console
            }
          }}
        >
          <StepsFormLegacy.StepForm<AccessControlProfile>
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
          >
            <AccessControlSettingForm
              editMode={false}
              embeddedMode={true}
              embeddedObject={{
                l2AclPolicyId: form.getFieldValue(
                  ['wlan', 'advancedCustomization', 'l2AclPolicyId']
                ),
                l3AclPolicyId: form.getFieldValue(
                  ['wlan', 'advancedCustomization', 'l3AclPolicyId']
                ),
                devicePolicyId: form.getFieldValue(
                  ['wlan', 'advancedCustomization', 'devicePolicyId']
                ),
                applicationPolicyId: form.getFieldValue(
                  ['wlan', 'advancedCustomization', 'applicationPolicyId']
                ),
                uplinkLimit: form.getFieldValue(
                  ['wlan', 'advancedCustomization', 'userUplinkRateLimiting']
                ),
                downlinkLimit: form.getFieldValue(
                  ['wlan', 'advancedCustomization', 'userDownlinkRateLimiting']
                )
              }}
            />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Modal>
    </>
  )
}

function getAccessControlProfile <
  // eslint-disable-next-line max-len
  Key extends keyof Omit<AccessControlProfile, 'name' | 'id' | 'rateLimiting' | 'description' | 'policyName'>,
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

function GetLinkLimitByAccessControlPorfile (props: {
  accessControlProfile: AccessControlProfile | undefined,
  type: string
}) {
  const { $t } = useIntl()
  const { accessControlProfile, type } = props

  let limit = $t({ defaultMessage: 'Unlimited' })
  if (accessControlProfile && accessControlProfile.rateLimiting
    && accessControlProfile.rateLimiting[type] !== 0) {
    limit = $t({ defaultMessage: '{rateLimiting} Mbps' }, {
      rateLimiting: accessControlProfile.rateLimiting[type]
    })
  }
  return <div>{limit}</div>
}

function SelectAccessProfileProfile (props: { accessControlProfileId: string }) {
  const { $t } = useIntl()
  const { accessControlProfileId } = props
  const form = Form.useFormInstance()
  const { data } = useContext(NetworkFormContext)

  const [state, updateState] = useState({
    selectedAccessControlProfile: undefined as AccessControlProfile | undefined
  })

  const { selectedLayer2 } = useL2AclPolicyListQuery({
    params: useParams()
  }, {
    selectFromResult ({ data }) {
      return {
        selectedLayer2: getAccessControlProfile(
          data,
          state.selectedAccessControlProfile,
          'l2AclPolicy'
        )
      }
    }
  })

  const { selectedLayer3 } = useL3AclPolicyListQuery({
    params: useParams()
  }, {
    selectFromResult ({ data }) {
      return {
        selectedLayer3: getAccessControlProfile(
          data,
          state.selectedAccessControlProfile,
          'l3AclPolicy'
        )
      }
    }
  })

  const { selectedDevicePolicy } = useDevicePolicyListQuery({
    params: useParams()
  }, {
    selectFromResult ({ data }) {
      return {
        selectedDevicePolicy: getAccessControlProfile(
          data,
          state.selectedAccessControlProfile,
          'devicePolicy'
        )
      }
    }
  })

  const { selectedApplicationPolicy } = useApplicationPolicyListQuery({
    params: useParams()
  }, {
    selectFromResult ({ data }) {
      return {
        selectedApplicationPolicy: getAccessControlProfile(
          data,
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

  useEffect(() => {
    if (data && accessControlList) {
      if (!_.isEmpty(get(data, 'wlan.advancedCustomization.accessControlProfileId'))) {
        onAccessPolicyChange(get(data, 'wlan.advancedCustomization.accessControlProfileId'))
      }
      if (accessControlProfileId) {
        onAccessPolicyChange(accessControlProfileId)
      }
    }
  }, [data, accessControlProfileId, accessControlList])

  const resetProfiles = () => {
    form.setFieldValue(['wlan','advancedCustomization','l2AclEnable'], false)
    form.setFieldValue(['wlan','advancedCustomization','l3AclEnable'], false)
    form.setFieldValue('enableDeviceOs', false)
    form.setFieldValue(['wlan','advancedCustomization','applicationPolicyEnable'], false)
    form.setFieldValue('enableClientRateLimit', false)
  }

  const onAccessPolicyChange = function (id: string) {
    const data = id ? accessControlList?.find(profile => profile.id === id) : undefined
    updateState({
      selectedAccessControlProfile: data
    })
    resetProfiles()
  }

  const [enableAccessControlProfile] = [
    useWatch('accessControlProfileEnable')]

  useEffect(() => {
    if (!enableAccessControlProfile) {
      updateState({
        selectedAccessControlProfile: undefined
      })
    } else {
      if (accessControlProfileId) {
        onAccessPolicyChange(accessControlProfileId)
      }
    }
  }, [enableAccessControlProfile, accessControlProfileId])

  return (<>
    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Access Control' })}
      <Form.Item
        name='accessControlProfileEnable'
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch />}
      />
    </UI.FieldLabel>

    {enableAccessControlProfile && <Form.Item
      label={$t({ defaultMessage: 'Access Control Policy' })}
      name={['wlan','advancedCustomization','accessControlProfileId']}
      rules={[
        { validator: async () => {
          if (!form.getFieldValue(['wlan','advancedCustomization','accessControlProfileId'])) {
            return Promise.reject($t({
              // eslint-disable-next-line max-len
              defaultMessage: 'If you enable the access control, access control policy could not be empty'
            }))
          }

          return Promise.resolve()
        } }
      ]}
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

    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Client Rate Limit' })}
      <span>{(!state.selectedAccessControlProfile ||
        state.selectedAccessControlProfile.rateLimiting?.enabled === false) && '--'}</span>
      {(state.selectedAccessControlProfile &&
          state.selectedAccessControlProfile.rateLimiting?.enabled) &&
          <div>
            <UI.RateLimitBlock>
              <label>{$t({ defaultMessage: 'Up:' })}</label>
              <GetLinkLimitByAccessControlPorfile
                accessControlProfile={state.selectedAccessControlProfile}
                type={'uplinkLimit'} />
            </UI.RateLimitBlock>
            <UI.RateLimitBlock>
              <label>{$t({ defaultMessage: 'Down:' })}</label>
              <GetLinkLimitByAccessControlPorfile
                accessControlProfile={state.selectedAccessControlProfile}
                type={'downlinkLimit'} />
            </UI.RateLimitBlock>
          </div>
      }
    </UI.FieldLabel>
  </>)
}

function AccessControlConfigForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
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

        {enableLayer2 && <Layer2Drawer
          inputName={['wlan', 'advancedCustomization']}
        />}
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

        {enableLayer3 && <Layer3Drawer
          inputName={['wlan', 'advancedCustomization']}
        />}
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
          children={<Switch
            onChange={function (checked: boolean) {
              if (!checked) {
                form.setFieldValue(['wlan', 'advancedCustomization', 'devicePolicyId'], null)
              }
            }} />}
        />

        {enableDeviceOs && <DeviceOSDrawer
          inputName={['wlan', 'advancedCustomization']}
        />}
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

        {enableApplications && <ApplicationDrawer
          inputName={['wlan', 'advancedCustomization']}
        />}
      </div>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      {$t({ defaultMessage: 'Client Rate Limit' })}
      <Form.Item
        name='enableClientRateLimit'
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch
          onChange={function (checked: boolean) {
            if (!checked) {
              form.setFieldValue(
                ['wlan', 'advancedCustomization', 'userDownlinkRateLimiting'], 0)
              form.setFieldValue(
                ['wlan', 'advancedCustomization', 'userUplinkRateLimiting'], 0)
            }
          }} />}
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
              onChange={function (e: CheckboxChangeEvent) {
                const value = e.target.checked ? 20 : 0
                form.setFieldValue(
                  ['wlan', 'advancedCustomization', 'userUplinkRateLimiting'], value)
              }}
              children={$t({ defaultMessage: 'Upload Limit' })} />}
        />
        {
          enableUploadLimit ?
            <UI.FormItemNoLabel
              name={['wlan', 'advancedCustomization', 'userUplinkRateLimiting']}
              children={
                <Slider
                  tooltipVisible={false}
                  style={{ width: '245px' }}
                  defaultValue={20}
                  min={1}
                  max={200}
                  marks={{
                    1: { label: '1 Mbps' },
                    200: { label: '200 Mbps' }
                  }}
                />
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
              onChange={function (e: CheckboxChangeEvent) {
                const value = e.target.checked ? 20 : 0
                form.setFieldValue(
                  ['wlan', 'advancedCustomization', 'userDownlinkRateLimiting'], value)
              }}
              children={$t({ defaultMessage: 'Download Limit' })} />}
        />

        {
          enableDownloadLimit ?
            <UI.FormItemNoLabel
              name={['wlan', 'advancedCustomization', 'userDownlinkRateLimiting']}
              children={
                <Slider
                  tooltipVisible={false}
                  style={{ width: '245px' }}
                  defaultValue={20}
                  min={1}
                  max={200}
                  marks={{
                    1: { label: '1 Mbps' },
                    200: { label: '200 Mbps' }
                  }}
                />
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
