import React, { CSSProperties, ReactNode, useContext, useEffect, useRef, useState } from 'react'

import { Form, FormItemProps, InputNumber, Select, Space, Switch } from 'antd'
import { isEmpty }                                                 from 'lodash'
import { FormattedMessage, useIntl }                               from 'react-intl'
import styled                                                      from 'styled-components'

import {
  Button,
  Fieldset,
  Loader,
  showActionModal,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                          from '@acx-ui/feature-toggle'
import { useEnforcedStatus, RogueApModal, useIsConfigTemplateEnabledByType, usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import {
  useEnhancedRoguePoliciesQuery,
  useGetDenialOfServiceProtectionQuery,
  useGetRoguePolicyTemplateListQuery,
  useGetVenueApEnhancedKeyQuery,
  useGetVenueRogueApQuery,
  useGetVenueRogueApTemplateQuery,
  useGetVenueTemplateDoSProtectionQuery,
  useUpdateDenialOfServiceProtectionMutation,
  useUpdateVenueApEnhancedKeyMutation,
  useUpdateVenueRogueApMutation,
  useUpdateVenueRogueApTemplateMutation,
  useUpdateVenueTemplateDoSProtectionMutation
} from '@acx-ui/rc/services'
import {
  ConfigTemplateType,
  PoliciesConfigTemplateUrlsInfo,
  redirectPreviousPage,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  VenueConfigTemplateUrlsInfo,
  VenueDosProtection,
  VenueMessages,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useNavigate, useParams }                           from '@acx-ui/react-router-dom'
import { getUserProfile, hasAllowedOperations, isCoreTier } from '@acx-ui/user'

import { VenueEditContext }               from '../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateOpsApiSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../venueConfigTemplateApiSwitcher'

import RogueApDrawer from './RogueApDrawer'

export interface SecuritySetting {
  dosProtectionEnabled: boolean,
  blockingPeriod: number,
  checkPeriod: number,
  failThreshold: number,
  rogueApEnabled: boolean,
  reportThreshold: number,
  roguePolicyId: string,
  tlsEnhancedKeyEnabled: boolean
}

export interface SecuritySettingContext {
  SecurityData: SecuritySetting,
  updateSecurity: ((data?: SecuritySetting) => void)
}

const { Option } = Select

const DEFAULT_POLICY_ID = 'c1fe63007a5d4a71858d487d066eee6d'
const DEFAULT_PROFILE_NAME = 'Default profile'

const DEFAULT_OPTIONS = [{
  id: DEFAULT_POLICY_ID,
  name: DEFAULT_PROFILE_NAME
}]

const DEFAULT_PAYLOAD = {
  searchString: '',
  fields: [
    'id',
    'name'
  ],
  page: 1, pageSize: 1000
}

export function SecurityTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/venues/')
  const { isTemplate } = useConfigTemplate()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  // eslint-disable-next-line max-len
  const isConfigTemplateEnabledByType = useIsConfigTemplateEnabledByType(ConfigTemplateType.ROGUE_AP_DETECTION)
  const supportTlsKeyEnhance = useIsSplitOn(Features.WIFI_EDA_TLS_KEY_ENHANCE_MODE_CONFIG_TOGGLE)
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API) && !isTemplate
  const resolvedWifiRbacEnabled = isTemplate ? enableTemplateRbac : isUseRbacApi
  const resolvedServicePolicyRbacEnabled = isTemplate ? enableTemplateRbac : enableServicePolicyRbac
  const { getEnforcedStepsFormProps } = useEnforcedStatus(ConfigTemplateType.VENUE)

  const venueDosProtectionOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateDenialOfServiceProtection,
    VenueConfigTemplateUrlsInfo.updateDenialOfServiceProtectionRbac
  )

  const venueRogueApOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueRogueAp,
    PoliciesConfigTemplateUrlsInfo.updateVenueRogueApRbac
  )

  const [
    isAllowEditDosProtection,
    isAllowEditRogueAp
  ] = [
    hasAllowedOperations([venueDosProtectionOpsApi]),
    hasAllowedOperations([venueRogueApOpsApi])
  ]

  const formRef = useRef<StepsFormLegacyInstance>()
  const {
    previousPath,
    editContextData,
    setEditContextData,
    setEditSecurityContextData
  } = useContext(VenueEditContext)

  const [updateDenialOfServiceProtection, { isLoading: isUpdatingDenialOfServiceProtection }] =
    useVenueConfigTemplateMutationFnSwitcher(
      useUpdateDenialOfServiceProtectionMutation,
      useUpdateVenueTemplateDoSProtectionMutation
    )

  // eslint-disable-next-line max-len
  const [updateVenueRogueAp, { isLoading: isUpdatingVenueRogueAp }] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateVenueRogueApMutation,
    useTemplateMutationFn: useUpdateVenueRogueApTemplateMutation
  })

  const { data: dosProctectionData } = useVenueConfigTemplateQueryFnSwitcher<VenueDosProtection>({
    useQueryFn: useGetDenialOfServiceProtectionQuery,
    useTemplateQueryFn: useGetVenueTemplateDoSProtectionQuery,
    enableRbac: isUseRbacApi
  })

  const { data: venueRogueApData } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetVenueRogueApQuery,
    useTemplateQueryFn: useGetVenueRogueApTemplateQuery,
    enableRbac: enableServicePolicyRbac,
    skip: isCore
  })

  // eslint-disable-next-line max-len
  const useGetRoguePolicyInstances = (policyId: string): { selectOptions: JSX.Element[], selected: { id: string, name: string } | undefined } => {
    const { data } = useConfigTemplateQueryFnSwitcher({
      useQueryFn: useEnhancedRoguePoliciesQuery,
      useTemplateQueryFn: useGetRoguePolicyTemplateListQuery,
      payload: DEFAULT_PAYLOAD,
      enableRbac: enableServicePolicyRbac,
      skip: isCore
    })

    if (data?.totalCount === 0) {
      return {
        selectOptions: DEFAULT_OPTIONS.map(item => <Option key={item.id}>{item.name}</Option>),
        selected: DEFAULT_OPTIONS.find((item) =>
          item.id === DEFAULT_POLICY_ID
        )
      }
    }
    return {
      selectOptions: data?.data.map(item => <Option key={item.id}>{item.name}</Option>) ?? [],
      selected: data?.data.find((item) =>
        item.id === policyId
      )
    }
  }

  const [updateVenueApEnhancedKey, {
    isLoading: isUpdatingVenueApEnhancedKey }] = useUpdateVenueApEnhancedKeyMutation()
  // eslint-disable-next-line max-len
  const { data: venueApEnhancedKeyData } = useGetVenueApEnhancedKeyQuery({ params }, { skip: isTemplate || !supportTlsKeyEnhance })

  const [roguePolicyIdValue, setRoguePolicyIdValue] = useState('')
  const [triggerDoSProtection, setTriggerDoSProtection] = useState(false)
  const [triggerRogueAPDetection, setTriggerRogueAPDetection] = useState(false)
  const [rogueDrawerVisible, setRogueDrawerVisible] = useState(false)
  const [tlsEnhancedKeyEnabled, setTlsEnhancedKeyEnabled] = useState(false)
  const [triggerTlsEnhancedKey, setTriggerTlsEnhancedKey] = useState(false)

  const { selectOptions, selected } = useGetRoguePolicyInstances(
    formRef.current?.getFieldValue('roguePolicyId')
  )

  useEffect(() => {
    if (selectOptions.length > 0) {
      if (isEmpty(formRef.current?.getFieldValue('roguePolicyId'))){
        // eslint-disable-next-line max-len
        const defaultProfile = selectOptions.find(option => option.props.children === DEFAULT_PROFILE_NAME)
        formRef.current?.setFieldValue('roguePolicyId', defaultProfile?.key)
      }
    }
    if (!roguePolicyIdValue && selected?.id) {
      setRoguePolicyIdValue(selected.id)
    }
  }, [roguePolicyIdValue, selectOptions, selected])

  useEffect(() => {
    if (!dosProctectionData) return

    formRef?.current?.setFieldsValue({
      dosProtectionEnabled: dosProctectionData.enabled,
      blockingPeriod: dosProctectionData.blockingPeriod,
      checkPeriod: dosProctectionData.checkPeriod,
      failThreshold: dosProctectionData.failThreshold
    })
  }, [dosProctectionData])

  useEffect(() => {
    if (!venueRogueApData) return

    formRef?.current?.setFieldsValue({
      rogueApEnabled: venueRogueApData.enabled,
      reportThreshold: venueRogueApData.reportThreshold,
      roguePolicyId: venueRogueApData.roguePolicyId
    })

    if (venueRogueApData.roguePolicyId) {
      setRoguePolicyIdValue(venueRogueApData.roguePolicyId)
    }
  }, [venueRogueApData])

  useEffect(() => {
    if (!venueApEnhancedKeyData) return

    formRef?.current?.setFieldsValue({
      tlsEnhancedKeyEnabled: venueApEnhancedKeyData.tlsKeyEnhancedModeEnabled
    })
  }, [venueApEnhancedKeyData])


  const handleUpdateSecuritySettings = async (data?: SecuritySetting) => {
    try {
      if(triggerDoSProtection){
        const dosProtectionPayload = {
          enabled: data?.dosProtectionEnabled,
          blockingPeriod: data?.blockingPeriod,
          checkPeriod: data?.checkPeriod,
          failThreshold: data?.failThreshold
        }
        await updateDenialOfServiceProtection({
          params,
          payload: dosProtectionPayload,
          enableRbac: resolvedWifiRbacEnabled
        })
        setTriggerDoSProtection(false)
      }

      if(triggerRogueAPDetection){
        const { rogueApEnabled, roguePolicyId, reportThreshold } = data ?? {}
        const {
          roguePolicyId: currentRoguePolicyId,
          reportThreshold: currentReportThreshold
        } = venueRogueApData ?? {}

        const rogueApPayload = {
          enabled: rogueApEnabled,
          reportThreshold,
          roguePolicyId,
          currentRoguePolicyId,
          currentReportThreshold
        }

        /**
         * Avoid the API error when calling the updateVenueRogueAp API
         * When rogueAP is enabld, the roguePolicyId must have value
         * When rogueAP is disabld, the currentRoguePolicyId must have value
         */
        const isCorrectPaylod = rogueApEnabled? !!roguePolicyId : !!currentRoguePolicyId
        if (isCorrectPaylod) {
        // eslint-disable-next-line max-len
          await updateVenueRogueAp({ params, payload: rogueApPayload, enableRbac: resolvedServicePolicyRbacEnabled })
        }
        setTriggerRogueAPDetection(false)
      }

      if(triggerTlsEnhancedKey){
        await handleUpdateApEnhancedKey(data?.tlsEnhancedKeyEnabled)
      }

      setEditContextData({
        ...editContextData,
        isDirty: false
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleChange = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'security',
      isDirty: true
    })
    setEditSecurityContextData({
      SecurityData: formRef.current?.getFieldsValue(),
      updateSecurity: handleUpdateSecuritySettings
    })
  }

  const setRogueApPolicyId = (id: string) => {
    formRef.current?.setFieldValue('roguePolicyId', id)
    setTriggerRogueAPDetection(true)
    setRoguePolicyIdValue(id)
  }

  const setTlsEnhancedKey = (checked: boolean) => {
    formRef.current?.setFieldValue('tlsEnhancedKeyEnabled', checked)
    setTriggerTlsEnhancedKey(true)
    setTlsEnhancedKeyEnabled(checked)
  }

  const handleUpdateApEnhancedKey = async (enabled: boolean | undefined) => {

    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'TLS Enhanced Key' }),
      content: $t({ defaultMessage:
          `Enabling or disabling TLS Enhanced key will prompt a reboot of all AP devices
          within this <venueSingular></venueSingular>. Are you sure you want to continue?` }),
      okText: $t({ defaultMessage: 'Continue' }),
      onOk: async () => {
        try {
          const tlsEnhancedKeyEnabledPayload = {
            tlsKeyEnhancedModeEnabled: enabled
          }
          await updateVenueApEnhancedKey({ params, payload: tlsEnhancedKeyEnabledPayload }).unwrap()
          setTriggerTlsEnhancedKey(false)
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
    })
  }

  return (
    <Loader states={[{
      isLoading: false,
      // eslint-disable-next-line max-len
      isFetching: isUpdatingDenialOfServiceProtection || isUpdatingVenueRogueAp || isUpdatingVenueApEnhancedKey
    }]}>
      <StepsFormLegacy
        formRef={formRef}
        onFinish={handleUpdateSecuritySettings}
        onCancel={() =>
          redirectPreviousPage(navigate, previousPath, basePath)
        }
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
        onFormChange={handleChange}
        {...getEnforcedStepsFormProps('StepsFormLegacy')}
      >
        <StepsFormLegacy.StepForm>
          <FieldsetItem
            name='dosProtectionEnabled'
            label={$t({ defaultMessage: 'DoS Protection:' })}
            disabled={!isAllowEditDosProtection}
            initialValue={false}
            switchStyle={{ marginLeft: '78.5px' }}
            triggerDirtyFunc={setTriggerDoSProtection}>
            <FormattedMessage
              defaultMessage={`
                Block a client for <blockingPeriod></blockingPeriod> seconds
                after <failThreshold></failThreshold> repeat authentication failures
                within <checkPeriod></checkPeriod> seconds
              `}
              description={'Translation string - ' +
              'Block a client for, seconds after, repeat authentication failures within, seconds'}
              values={{
                blockingPeriod: () => (
                  <Tooltip title={$t({ defaultMessage: 'Allowed values are 30-600' })}>
                    <Form.Item
                      style={{
                        display: 'inline-block',
                        verticalAlign: 'baseline'
                      }}
                      name='blockingPeriod'
                      rules={[
                        { required: true }
                      ]}
                      initialValue={60}
                      children={<InputNumber
                        disabled={!isAllowEditDosProtection}
                        onChange={() => setTriggerDoSProtection(true)}
                        min={30}
                        max={600}
                        style={{ width: '70px' }} />}
                    />
                  </Tooltip>),
                failThreshold: () => (
                  <Tooltip title={$t({ defaultMessage: 'Allowed values are 2-25' })}>
                    <Form.Item
                      style={{
                        display: 'inline-block',
                        verticalAlign: 'baseline'
                      }}
                      rules={[
                        { required: true }
                      ]}
                      name='failThreshold'
                      initialValue={5}
                      children={<InputNumber
                        disabled={!isAllowEditDosProtection}
                        onChange={() => setTriggerDoSProtection(true)}
                        min={2}
                        max={25}
                        style={{ width: '70px' }} />}
                    />
                  </Tooltip>
                ),
                checkPeriod: () => (
                  <Tooltip title={$t({ defaultMessage: 'Allowed values are 30-600' })}>
                    <Form.Item
                      style={{
                        display: 'inline-block',
                        verticalAlign: 'baseline'
                      }}
                      name='checkPeriod'
                      initialValue={30}
                      children={<InputNumber
                        disabled={!isAllowEditDosProtection}
                        onChange={() => setTriggerDoSProtection(true)}
                        min={30}
                        max={600}
                        style={{ width: '70px' }} />}
                    />
                  </Tooltip>
                )
              }}
            />
          </FieldsetItem>
          { !isCore && <FieldsetItem
            name='rogueApEnabled'
            label={$t({ defaultMessage: 'Rogue AP Detection:' })}
            disabled={!isAllowEditRogueAp}
            initialValue={false}
            switchStyle={{}}
            triggerDirtyFunc={setTriggerRogueAPDetection}
            hidden={isTemplate && !isConfigTemplateEnabledByType}
          >
            <Form.Item
              label={<>
                {$t({ defaultMessage: 'Report SNR Threshold:' })}
                <Tooltip.Question
                  title={$t(VenueMessages.SNR_THRESHOLD_TOOLTIP)}
                  placement='bottom'
                />
              </>}
            >
              <Space>
                <Form.Item noStyle
                  name='reportThreshold'
                  initialValue={0}
                  children={<InputNumber
                    disabled={!isAllowEditRogueAp}
                    onChange={() => setTriggerRogueAPDetection(true)}
                    min={0}
                    max={100}
                    style={{ width: '120px' }} />} />
                <span style={{ marginTop: '30px' }}>dB</span>
              </Space>
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Rogue AP Detection Policy Profile:' })}
            >
              <Space>
                <Form.Item noStyle
                  initialValue={roguePolicyIdValue}
                  name='roguePolicyId'>
                  <Select
                    disabled={!isAllowEditRogueAp}
                    children={selectOptions}
                    value={roguePolicyIdValue}
                    onChange={(value => setRogueApPolicyId(value))}
                    style={{ width: '200px' }}
                  />
                </Form.Item>
                <Button type='link'
                  disabled={!roguePolicyIdValue}
                  onClick={() => {
                    if (roguePolicyIdValue) {
                      setRogueDrawerVisible(true)
                    }
                  }
                  }>
                  {$t({ defaultMessage: 'View Details' })}
                </Button>
                {isAllowEditRogueAp && <RogueApModal
                  setPolicyId={setRogueApPolicyId}
                />
                }
              </Space>
              {rogueDrawerVisible && <RogueApDrawer
                visible={rogueDrawerVisible}
                setVisible={setRogueDrawerVisible}
                policyId={roguePolicyIdValue} />}
            </Form.Item>
          </FieldsetItem>
          }

          { !isTemplate && supportTlsKeyEnhance && <Space align='start'>
            <StepsFormLegacy.FieldLabel
              width='max-content'
              style={{ height: '32px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}
            >
              <span>{$t({ defaultMessage: 'TLS Enhanced Key (RSA 3072/ECDSA P-256)' })}</span>
              <Tooltip.Question
                // eslint-disable-next-line max-len
                title={$t({ defaultMessage: 'Strengthen the TLS connection strength between APs and R1 by utilizing RSA 3072 for WiFi 7 and ECDSA P-256 for non-WiFi 7 devices. Note that toggling the switch will prompt a reboot of all AP devices within this <venueSingular></venueSingular>.' })}
                placement='bottom'
                iconStyle={{ height: '16px', width: '16px' }}
              />
              <div style={{ margin: '2px' }}></div>
              <Form.Item
                valuePropName='checked'
                initialValue={tlsEnhancedKeyEnabled}
                name='tlsEnhancedKeyEnabled'
                children={
                  <Switch
                    data-testid='tls-enhanced-key'
                    checked={tlsEnhancedKeyEnabled}
                    onClick={(checked) => {
                      setTlsEnhancedKey(checked)
                    }}
                    style={{ marginLeft: '20px', marginTop: '16px' }}
                  />
                }
              />
            </StepsFormLegacy.FieldLabel>
          </Space> }
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </Loader>
  )
}

const CustomFieldSet = styled(Fieldset)`
  & > legend > label {
    font-weight: 100 !important;
  }
`

const FieldsetItem = ({
  children,
  label,
  disabled,
  switchStyle,
  triggerDirtyFunc,
  ...props
}: FormItemProps &
  { label: string,
    disabled?: boolean,
    children: ReactNode,
    switchStyle: CSSProperties,
    triggerDirtyFunc: (checked: boolean) => void
  }) => <Form.Item
  {...props}
  valuePropName='checked'
>
  <CustomFieldSet
    {...{ label, children, disabled }}
    switchStyle={switchStyle}
    onChange={() => triggerDirtyFunc(true)}/>
</Form.Item>

