import React, { ReactNode, useContext, useEffect, useRef, useState, CSSProperties } from 'react'

import { Form, FormItemProps, InputNumber, Select, Space, Switch } from 'antd'
import _                                                           from 'lodash'
import { FormattedMessage, useIntl }                               from 'react-intl'

import { Button, Fieldset, Loader, StepsFormLegacy, StepsFormLegacyInstance, Tooltip, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                       from '@acx-ui/feature-toggle'
import { RogueApModal, usePathBasedOnConfigTemplate }                                                   from '@acx-ui/rc/components'
import {
  useGetDenialOfServiceProtectionQuery,
  useUpdateDenialOfServiceProtectionMutation,
  useGetVenueRogueApQuery,
  useUpdateVenueRogueApMutation, useGetRoguePolicyListQuery,
  useGetVenueApEnhancedKeyQuery, useUpdateVenueApEnhancedKeyMutation,
  useGetVenueTemplateDoSProtectionQuery, useUpdateVenueTemplateDoSProtectionMutation
} from '@acx-ui/rc/services'
import { VenueDosProtection, VenueMessages, redirectPreviousPage, useConfigTemplate } from '@acx-ui/rc/utils'
import { useNavigate, useParams }                                                     from '@acx-ui/react-router-dom'

import { VenueEditContext }                                                                from '../..'
import { useVenueConfigTemplateMutationFnSwitcher, useVenueConfigTemplateQueryFnSwitcher } from '../../../venueConfigTemplateApiSwitcher'

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

export function SecurityTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/venues/')
  const { isTemplate } = useConfigTemplate()
  const supportTlsKeyEnhance = useIsSplitOn(Features.WIFI_EDA_TLS_KEY_ENHANCE_MODE_CONFIG_TOGGLE)

  const DEFAULT_POLICY_ID = 'c1fe63007a5d4a71858d487d066eee6d'
  const DEFAULT_PROFILE_NAME = 'Default profile'

  const DEFAULT_OPTIONS = [{
    id: DEFAULT_POLICY_ID,
    name: DEFAULT_PROFILE_NAME
  }]

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

  const [updateVenueRogueAp, {
    isLoading: isUpdatingVenueRogueAp }] = useUpdateVenueRogueApMutation()

  const { data: dosProctectionData } = useVenueConfigTemplateQueryFnSwitcher<VenueDosProtection>(
    useGetDenialOfServiceProtectionQuery,
    useGetVenueTemplateDoSProtectionQuery
  )

  const { data: venueRogueApData } = useGetVenueRogueApQuery({ params }, { skip: isTemplate })

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

  const { selectOptions, selected } = useGetRoguePolicyListQuery({ params },{
    selectFromResult ({ data }) {
      if (data?.length === 0) {
        return {
          selectOptions: DEFAULT_OPTIONS.map(item => <Option key={item.id}>{item.name}</Option>),
          selected: DEFAULT_OPTIONS.find((item) =>
            item.id === DEFAULT_POLICY_ID
          )
        }
      }
      return {
        selectOptions: data?.map(item => <Option key={item.id}>{item.name}</Option>) ?? [],
        selected: data?.find((item) => item.id === formRef.current?.getFieldValue('roguePolicyId'))
      }
    }
  })

  useEffect(() => {
    if (selectOptions.length > 0) {
      if (_.isEmpty(formRef.current?.getFieldValue('roguePolicyId'))){
        // eslint-disable-next-line max-len
        const defaultProfile = selectOptions.find(option => option.props.children === DEFAULT_PROFILE_NAME)
        formRef.current?.setFieldValue('roguePolicyId', defaultProfile?.key)
      }
    }
    if (!roguePolicyIdValue && selected?.id) {
      setRoguePolicyIdValue(selected.id)
    }
  }, [selectOptions, selected])

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
      tlsEnhancedKeyEnabled: venueApEnhancedKeyData.tlsEnhancedKeyEnabled
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
        await updateDenialOfServiceProtection({ params, payload: dosProtectionPayload })
        setTriggerDoSProtection(false)
      }

      if(triggerRogueAPDetection){
        const rogueApPayload = {
          enabled: data?.rogueApEnabled,
          reportThreshold: data?.reportThreshold,
          roguePolicyId: data?.roguePolicyId
        }
        await updateVenueRogueAp({ params, payload: rogueApPayload })
        setTriggerRogueAPDetection(false)
      }

      if(triggerTlsEnhancedKey){
        handleUpdateApEnhancedKey(data?.tlsEnhancedKeyEnabled)
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
      title: $t({ defaultMessage: 'TLS Enhanced Key: RSA 3072/ECDSA P-256' }),
      content:
        // eslint-disable-next-line max-len
        $t({ defaultMessage:
          `Boosting TLS key will prompt a reboot of all AP devices within
          this venue. Are you sure you want to continue?` }),
      okText: $t({ defaultMessage: 'Continue' }),
      onOk: async () => {
        try {
          const tlsEnhancedKeyEnabledPayload = {
            tlsEnhancedKeyEnabled: enabled
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
      >
        <StepsFormLegacy.StepForm>
          <FieldsetItem
            name='dosProtectionEnabled'
            label={$t({ defaultMessage: 'DoS Protection:' })}
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
          <FieldsetItem
            name='rogueApEnabled'
            label={$t({ defaultMessage: 'Rogue AP Detection:' })}
            initialValue={false}
            switchStyle={{}}
            triggerDirtyFunc={setTriggerRogueAPDetection}
            hidden={isTemplate}
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
                <RogueApModal
                  setPolicyId={setRogueApPolicyId}
                />
              </Space>
              { rogueDrawerVisible && <RogueApDrawer
                visible={rogueDrawerVisible}
                setVisible={setRogueDrawerVisible}
                policyId={roguePolicyIdValue} /> }
            </Form.Item>
          </FieldsetItem>
          { !isTemplate && supportTlsKeyEnhance && <Space align='start'>
            <StepsFormLegacy.FieldLabel
              width='max-content'
              style={{ height: '32px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}
            >
              <span>{$t({ defaultMessage: 'TLS Enhanced Key: RSA 3072/ECDSA P-256' })}</span>
              <Tooltip.Question
                // eslint-disable-next-line max-len
                title={$t({ defaultMessage: 'Boosting TLS can enhance the TLS connection strength between APs and R1. Note that toggling the switch will prompt a reboot of all AP devices within this venue.' })}
                placement='bottom'
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

const FieldsetItem = ({
  children,
  label,
  switchStyle,
  triggerDirtyFunc,
  ...props
}: FormItemProps &
  { label: string,
    children: ReactNode,
    switchStyle: CSSProperties,
    triggerDirtyFunc: (checked: boolean) => void
  }) => <Form.Item
  {...props}
  valuePropName='checked'
>
  <Fieldset
    {...{ label, children }}
    switchStyle={switchStyle}
    onChange={() => triggerDirtyFunc(true)}/>
</Form.Item>
