
import React, { useContext, useEffect, useRef, useState } from 'react'

import {
  Checkbox,
  Form,
  Select,
  Slider,
  Space,
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
  useAddAccessControlProfileMutation,
  useGetAccessControlProfileListQuery,
  useAddAccessControlProfileTemplateMutation,
  useGetL2AclPolicyTemplateListQuery,
  useGetL3AclPolicyTemplateListQuery,
  useGetDevicePolicyTemplateListQuery,
  useGetAppPolicyTemplateListQuery,
  useGetAccessControlProfileTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AccessControlFormFields,
  AccessControlProfile, AccessControlProfileTemplate,
  AclEmbeddedObject, useConfigTemplate, useConfigTemplateMutationFnSwitcher
} from '@acx-ui/rc/utils'
import { transformDisplayText } from '@acx-ui/rc/utils'
import { useParams }            from '@acx-ui/react-router-dom'

import {
  AccessControlSettingForm,
  ApplicationDrawer, convertToPayload,
  DeviceOSDrawer, genAclPayloadObject,
  Layer2Drawer,
  Layer3Drawer
} from '../../policies/AccessControlForm'
import NetworkFormContext from '../NetworkFormContext'

import * as UI from './styledComponents'

const { useWatch } = Form
const { Option } = Select

type ModalStatus = {
  visible: boolean,
  embeddedObject?: AclEmbeddedObject
}

type AcProfileModalProps = {
  modalStatus: ModalStatus,
  setModalStatus: (value: ModalStatus) => void
  updateSelectedACProfile?: (id: string) => void
}

const emptyEmbeddedObject: AclEmbeddedObject = {
  l2AclPolicyId: undefined,
  l3AclPolicyId: undefined,
  devicePolicyId: undefined,
  applicationPolicyId: undefined,
  uplinkLimit: undefined,
  downlinkLimit: undefined
}

const QUERY_DEFAULT_PAYLOAD = {
  searchString: '',
  fields: [
    'id',
    'name',
    'l2AclPolicyId',
    'l2AclPolicyName',
    'l3AclPolicyId',
    'l3AclPolicyName',
    'devicePolicyId',
    'devicePolicyName',
    'applicationPolicyId',
    'applicationPolicyName',
    'clientRateUpLinkLimit',
    'clientRateDownLinkLimit'
  ],
  page: 1,
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'DESC'
}

export function AccessControlForm () {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const [enabledProfile, setEnabledProfile] = useState(true)

  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()

  const [modalStatus, setModalStatus] = useState<ModalStatus>({
    visible: false,
    embeddedObject: emptyEmbeddedObject
  })

  useEffect(() => {
    const { advancedCustomization } = data?.wlan || {}
    if (advancedCustomization) {
      const {
        accessControlProfileId,
        l2AclEnable,
        l3AclEnable,
        devicePolicyId,
        applicationPolicyEnable,
        userDownlinkRateLimiting = 0,
        userUplinkRateLimiting = 0
      } = advancedCustomization

      const enableDeviceOs = !_.isEmpty(devicePolicyId)
      const enableDownloadLimit = userDownlinkRateLimiting > 0
      const enableUploadLimit = userUplinkRateLimiting > 0
      const enableClientRateLimit = enableDownloadLimit || enableUploadLimit
      const accessControlProfileEnable = !_.isEmpty(accessControlProfileId)

      form.setFieldsValue({
        enableDeviceOs,
        enableDownloadLimit,
        enableUploadLimit,
        enableClientRateLimit,
        accessControlProfileEnable
      })

      setEnabledProfile(accessControlProfileEnable ||
        (!l2AclEnable && !l3AclEnable &&
         !enableDeviceOs && !applicationPolicyEnable && !enableClientRateLimit))
    }
  }, [])

  const updateSelectedACProfile = (id: string) => {
    if (!!id) {
      setEnabledProfile(true)
      form.setFieldValue('accessControlProfileEnable', true)
      form.setFieldValue(['wlan', 'advancedCustomization', 'accessControlProfileId'], id)
    }
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      <span style={{
        display: 'grid',
        gridTemplateColumns: '165px 140px 300px',
        alignItems: 'baseline',
        margin: '20px 0'
      }}>
        <UI.Subtitle level={4}>
          {$t({ defaultMessage: 'Access Control' })}
        </UI.Subtitle>

        {!isTemplate && !enabledProfile && <SaveAsAcProfileButton
          modalStatus={modalStatus}
          setModalStatus={setModalStatus} />}
        {!isTemplate && <Button type='link' onClick={() => setEnabledProfile(!enabledProfile)}>
          {enabledProfile ? $t({ defaultMessage: 'Select separate profiles' })
            : $t({ defaultMessage: 'Select Access Control profile' })
          }
        </Button>}
      </span>
      {enabledProfile ?
        // eslint-disable-next-line max-len
        <SelectAccessProfileProfile
          accessControlProfileId={get(data, 'wlan.advancedCustomization.accessControlProfileId')}
          setModalStatus={setModalStatus}
        /> : <AccessControlConfigForm />}
      <AddAcProfileModal
        modalStatus={modalStatus}
        setModalStatus={setModalStatus}
        updateSelectedACProfile={updateSelectedACProfile} />
    </div>)
}


function AddAcProfileModal (props: AcProfileModalProps) {
  const { $t } = useIntl()
  const params = useParams()

  const { modalStatus, setModalStatus, updateSelectedACProfile } = props
  const { visible=false, embeddedObject } = modalStatus

  const [ createAclProfile ] = useConfigTemplateMutationFnSwitcher(
    useAddAccessControlProfileMutation, useAddAccessControlProfileTemplateMutation)

  const formRef = useRef<StepsFormLegacyInstance<AccessControlFormFields>>()

  return (
    <Modal
      title={$t({ defaultMessage: 'Add Access Control Policy' })}
      visible={visible}
      type={ModalType.ModalStepsForm}
      width={650}
    >
      <StepsFormLegacy<AccessControlFormFields>
        formRef={formRef}
        onCancel={() => {
          formRef.current?.resetFields()
          setModalStatus({
            visible: false
          })
        }}
        onFinish={async () => {
          try {
            const aclPayloadObject = genAclPayloadObject(
                formRef.current?.getFieldsValue() as AccessControlFormFields
            )
            const responseData = await createAclProfile({
              params: params,
              payload: convertToPayload(false, aclPayloadObject, params.policyId)
            }).unwrap()

            const profileId = responseData?.response?.id
            if (profileId) {
              updateSelectedACProfile?.(profileId)
            }

            setModalStatus({
              visible: false
            })
            formRef.current?.resetFields()
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
            embeddedObject={embeddedObject}
          />
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </Modal>
  )
}

function SaveAsAcProfileButton (props: AcProfileModalProps) {
  const { $t } = useIntl()
  const { useWatch } = Form

  const [embeddedObject, setEmbeddedObject] = useState({})
  const { setModalStatus } = props

  const [
    l2AclPolicyId,
    l2AclEnable,
    l3AclPolicyId,
    l3AclEnable,
    devicePolicyId,
    enableDeviceOs,
    applicationPolicyId,
    applicationPolicyEnable,
    uplinkLimit,
    downlinkLimit
  ] = [
    useWatch(['wlan', 'advancedCustomization', 'l2AclPolicyId']),
    useWatch(['wlan', 'advancedCustomization', 'l2AclEnable']),
    useWatch(['wlan', 'advancedCustomization', 'l3AclPolicyId']),
    useWatch(['wlan', 'advancedCustomization', 'l3AclEnable']),
    useWatch(['wlan', 'advancedCustomization', 'devicePolicyId']),
    useWatch(['enableDeviceOs']),
    useWatch(['wlan', 'advancedCustomization', 'applicationPolicyId']),
    useWatch(['wlan', 'advancedCustomization', 'applicationPolicyEnable']),
    useWatch(['wlan', 'advancedCustomization', 'userUplinkRateLimiting']),
    useWatch(['wlan', 'advancedCustomization', 'userDownlinkRateLimiting'])
  ]

  useEffect(() => {
    setEmbeddedObject({
      l2AclPolicyId: l2AclEnable ? l2AclPolicyId : null,
      l3AclPolicyId: l3AclEnable ? l3AclPolicyId : null,
      devicePolicyId: enableDeviceOs ? devicePolicyId: null,
      applicationPolicyId: applicationPolicyEnable ? applicationPolicyId : null,
      uplinkLimit: uplinkLimit,
      downlinkLimit: downlinkLimit
    })
  }, [
    l2AclEnable, l2AclPolicyId,
    l3AclEnable, l3AclPolicyId,
    enableDeviceOs, devicePolicyId,
    applicationPolicyEnable, applicationPolicyId,
    uplinkLimit, downlinkLimit//, modalStatus.visible
  ])

  const handleOnClick = () => {
    setModalStatus({
      visible: true,
      embeddedObject
    })
  }

  return (
    <Button type='link' onClick={handleOnClick}>
      {$t({ defaultMessage: 'Save as AC Profile' })}
    </Button>
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
  if (policy?.enabled && policies) {
    name = policies.find(item => item.id === policy.id)?.name
  }
  return transformDisplayText(name)
}

function getAccessControlProfileTemplate <
  // eslint-disable-next-line max-len
  Key extends keyof Omit<AccessControlProfileTemplate, 'name' | 'id' | 'clientRateUpLinkLimit' | 'clientRateDownLinkLimit'>,
  Policies extends Array<{ id: string, name: string }>
> (
  policies: Policies | undefined,
  accessControlProfile: AccessControlProfileTemplate | undefined,
  policyKey: Key
) {
  if (!accessControlProfile) return transformDisplayText()
  let name
  const policy = accessControlProfile[policyKey] as string
  const nameKey = policyKey.replace('Id', 'Name') as keyof AccessControlProfileTemplate
  if (policy) {
    name = accessControlProfile[nameKey] as string
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

function GetLinkLimitByAccessControlProfileTemplate (props: {
  accessControlProfile: AccessControlProfileTemplate | undefined,
  type: string
}) {
  const { $t } = useIntl()
  const { accessControlProfile, type } = props

  let limit = $t({ defaultMessage: 'Unlimited' })
  // eslint-disable-next-line max-len
  if (accessControlProfile && accessControlProfile[type as keyof AccessControlProfileTemplate] !== 0) {
    limit = $t({ defaultMessage: '{rateLimiting} Mbps' }, {
      rateLimiting: accessControlProfile[type as keyof AccessControlProfileTemplate]
    })
  }
  return <div>{limit}</div>
}

export type SelectedAccessControlProfileType = {
  selectedAccessControlProfile: AccessControlProfile | AccessControlProfileTemplate | undefined
}

export function SelectAccessProfileProfile (props: {
  accessControlProfileId: string,
  setModalStatus: (data: ModalStatus) => void
}) {
  const { $t } = useIntl()
  const { accessControlProfileId, setModalStatus } = props
  const form = Form.useFormInstance()
  const { data } = useContext(NetworkFormContext)

  const labelWidth = '175px'

  const [state, updateState] = useState({
    selectedAccessControlProfile: undefined as AccessControlProfile | undefined
  })

  const { selectedLayer2 } = GetL2AclPolicyListFromNwInstance(state)

  const { selectedLayer3 } = GetL3AclPolicyListFromNwInstance(state)

  const { selectedDevicePolicy } = GetDeviceAclPolicyListFromNwInstance(state)

  const { selectedApplicationPolicy } = GetAppAclPolicyListFromNwInstance(state)

  //Access control list
  const { accessControlProfileSelectOptions, accessControlList }
    = GetAclPolicyListFromNwInstance()

  useEffect(() => {
    if (data && accessControlList) {
      const wlanACProfileId = get(data, 'wlan.advancedCustomization.accessControlProfileId')
      if (!_.isEmpty(wlanACProfileId)) {
        onAccessPolicyChange(wlanACProfileId)
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

  const handleOnAddClick = () => {
    setModalStatus({
      visible: true,
      embeddedObject: emptyEmbeddedObject
    })
  }

  return (<>
    <UI.FieldLabel width={labelWidth}>
      {$t({ defaultMessage: 'Access Control' })}
      <Form.Item
        name='accessControlProfileEnable'
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch />}
      />
    </UI.FieldLabel>

    {enableAccessControlProfile && <Space>
      <Form.Item
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
      </Form.Item>

      <Button type='link'
        onClick={handleOnAddClick}
        children={$t({ defaultMessage: 'Add' })}
        style={{ paddingTop: '10px' }} />
    </Space>}

    <UI.FieldLabel width={labelWidth} style={{ fontWeight: 700 }}>
      <span>{$t({ defaultMessage: 'Access Policy' })}</span>
      <span>{$t({ defaultMessage: 'Policy Details' })}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width={labelWidth}>
      {$t({ defaultMessage: 'Layer 2' })}
      <span>{selectedLayer2}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width={labelWidth}>
      {$t({ defaultMessage: 'Layer 3' })}
      <span>{selectedLayer3}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width={labelWidth}>
      {$t({ defaultMessage: 'Device & OS' })}
      <span>{selectedDevicePolicy}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width={labelWidth}>
      {$t({ defaultMessage: 'Applications' })}
      <span>{selectedApplicationPolicy}</span>
    </UI.FieldLabel>

    <UI.FieldLabel width={labelWidth}>
      {$t({ defaultMessage: 'Client Rate Limit' })}
      <GetClientRateLimitFromNwInstance
        selectedAccessControlProfile={state.selectedAccessControlProfile}
      />
    </UI.FieldLabel>
  </>)
}

const GetL2AclPolicyListFromNwInstance = (state: SelectedAccessControlProfileType): {
  selectedLayer2: string
} => {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const useL2PolicyTemplateList = useGetL2AclPolicyTemplateListQuery({
    params: params,
    payload: QUERY_DEFAULT_PAYLOAD
  }, {
    selectFromResult ({ data }) {
      return {
        selectedLayer2: getAccessControlProfileTemplate(
          data?.data ?? [],
          state.selectedAccessControlProfile,
          'l2AclPolicyId'
        )
      }
    },
    skip: !isTemplate
  })

  const useL2PolicyList = useL2AclPolicyListQuery({
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
    },
    skip: isTemplate
  })

  return isTemplate ? useL2PolicyTemplateList : useL2PolicyList
}

const GetL3AclPolicyListFromNwInstance = (state: SelectedAccessControlProfileType): {
  selectedLayer3: string
} => {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const useL3PolicyTemplateList = useGetL3AclPolicyTemplateListQuery({
    params: params,
    payload: QUERY_DEFAULT_PAYLOAD
  },
  {
    selectFromResult ({ data }) {
      return {
        selectedLayer3: getAccessControlProfileTemplate(
          data?.data ?? [],
          state.selectedAccessControlProfile,
          'l3AclPolicyId'
        )
      }
    },
    skip: !isTemplate
  })

  const useL3PolicyList = useL3AclPolicyListQuery({
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
    },
    skip: isTemplate
  })

  return isTemplate ? useL3PolicyTemplateList : useL3PolicyList
}

const GetDeviceAclPolicyListFromNwInstance = (state: SelectedAccessControlProfileType): {
  selectedDevicePolicy: string
} => {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const useDevicePolicyTemplateList = useGetDevicePolicyTemplateListQuery({
    params: params,
    payload: QUERY_DEFAULT_PAYLOAD
  }, {
    selectFromResult ({ data }) {
      return {
        selectedDevicePolicy: getAccessControlProfileTemplate(
          data?.data ?? [],
          state.selectedAccessControlProfile,
          'devicePolicyId'
        )
      }
    },
    skip: !isTemplate
  })

  const useDevicePolicyList = useDevicePolicyListQuery({
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
    },
    skip: isTemplate
  })

  return isTemplate ? useDevicePolicyTemplateList : useDevicePolicyList
}

const GetAppAclPolicyListFromNwInstance = (state: SelectedAccessControlProfileType): {
  selectedApplicationPolicy: string
} => {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const useAppPolicyTemplateList = useGetAppPolicyTemplateListQuery({
    params: params,
    payload: QUERY_DEFAULT_PAYLOAD
  }, {
    selectFromResult ({ data }) {
      return {
        selectedApplicationPolicy: getAccessControlProfileTemplate(
          data?.data ?? [],
          state.selectedAccessControlProfile,
          'applicationPolicyId'
        )
      }
    },
    skip: !isTemplate
  })

  const useAppPolicyList = useApplicationPolicyListQuery({
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
    },
    skip: isTemplate
  })

  return isTemplate ? useAppPolicyTemplateList : useAppPolicyList
}

const GetClientRateLimitFromNwInstance = (props: SelectedAccessControlProfileType) => {
  const { isTemplate } = useConfigTemplate()
  const { $t } = useIntl()
  const { selectedAccessControlProfile } = props

  if (isTemplate) {
    const accessControlProfile = selectedAccessControlProfile as AccessControlProfileTemplate
    return <>
      <span>{(!selectedAccessControlProfile ||
        // eslint-disable-next-line max-len
        !(accessControlProfile.clientRateUpLinkLimit && accessControlProfile.clientRateDownLinkLimit)) && '--'}</span>
      {(selectedAccessControlProfile &&
        // eslint-disable-next-line max-len
        (accessControlProfile.clientRateUpLinkLimit || accessControlProfile.clientRateDownLinkLimit)) ?
        <div>
          <UI.RateLimitBlock>
            <label>{$t({ defaultMessage: 'Up:' })}</label>
            <GetLinkLimitByAccessControlProfileTemplate
              accessControlProfile={selectedAccessControlProfile}
              type={'clientRateUpLinkLimit'} />
          </UI.RateLimitBlock>
          <UI.RateLimitBlock>
            <label>{$t({ defaultMessage: 'Down:' })}</label>
            <GetLinkLimitByAccessControlProfileTemplate
              accessControlProfile={selectedAccessControlProfile}
              type={'clientRateDownLinkLimit'} />
          </UI.RateLimitBlock>
        </div> : null
      }
    </>
  }

  const accessControlProfile = selectedAccessControlProfile as AccessControlProfile

  return <>
    <span>{!(!(!selectedAccessControlProfile
      || !accessControlProfile.rateLimiting
      || accessControlProfile.rateLimiting?.enabled !== false)) && '--'}</span>
    {(selectedAccessControlProfile &&
        accessControlProfile.rateLimiting?.enabled) &&
      <div>
        <UI.RateLimitBlock>
          <label>{$t({ defaultMessage: 'Up:' })}</label>
          <GetLinkLimitByAccessControlPorfile
            accessControlProfile={selectedAccessControlProfile}
            type={'uplinkLimit'} />
        </UI.RateLimitBlock>
        <UI.RateLimitBlock>
          <label>{$t({ defaultMessage: 'Down:' })}</label>
          <GetLinkLimitByAccessControlPorfile
            accessControlProfile={selectedAccessControlProfile}
            type={'downlinkLimit'} />
        </UI.RateLimitBlock>
      </div>
    }
  </>
}

const GetAclPolicyListFromNwInstance = () => {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const useAclPolicyTemplateList = useGetAccessControlProfileTemplateListQuery({
    params, payload: QUERY_DEFAULT_PAYLOAD
  }, {
    selectFromResult ({ data }) {
      return {
        accessControlProfileSelectOptions: data?.data.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? [],
        accessControlList: data?.data
      }
    },
    skip: !isTemplate
  })

  const useAclPolicyList = useGetAccessControlProfileListQuery({
    params: useParams()
  }, {
    selectFromResult ({ data }) {
      return {
        accessControlProfileSelectOptions: data?.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? [],
        accessControlList: data
      }
    },
    skip: isTemplate
  })

  return isTemplate ? useAclPolicyTemplateList : useAclPolicyList
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

  const labelWidth = '175px'

  useEffect(() => {
    // eslint-disable-next-line max-len
    if (enableLayer2 || enableLayer3 || enableDeviceOs || enableApplications || enableClientRateLimit) {
      form.setFieldsValue({
        wlan: {
          advancedCustomization: {
            accessControlEnable: false,
            accessControlProfileId: null
          }
        }
      })
    }
  }, [
    enableLayer2,
    enableLayer3,
    enableDeviceOs,
    enableApplications,
    enableClientRateLimit
  ])

  return (<>
    <UI.FieldLabel width={labelWidth}>
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

    <UI.FieldLabel width={labelWidth}>
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

    <UI.FieldLabel width={labelWidth}>
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


    <UI.FieldLabel width={labelWidth}>
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

    <UI.FieldLabel width={labelWidth}>
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
