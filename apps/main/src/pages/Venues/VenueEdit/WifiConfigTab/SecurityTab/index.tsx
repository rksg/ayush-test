import React, { ReactNode, useContext, useEffect, useRef, useState, CSSProperties } from 'react'

import { Form, FormItemProps, InputNumber, Select, Space } from 'antd'
import _                                                   from 'lodash'
import { FormattedMessage, useIntl }                       from 'react-intl'

import { Button, Fieldset, Loader, StepsFormLegacy, StepsFormLegacyInstance, Tooltip } from '@acx-ui/components'
import { RogueApModal }                                                                from '@acx-ui/rc/components'
import {
  useGetDenialOfServiceProtectionQuery,
  useUpdateDenialOfServiceProtectionMutation,
  useGetVenueRogueApQuery,
  useUpdateVenueRogueApMutation, useGetRoguePolicyListQuery
} from '@acx-ui/rc/services'
import { VenueMessages, redirectPreviousPage }   from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../'

import RogueApDrawer from './RogueApDrawer'

export interface SecuritySetting {
  dosProtectionEnabled: boolean,
  blockingPeriod: number,
  checkPeriod: number,
  failThreshold: number,
  rogueApEnabled: boolean,
  reportThreshold: number,
  roguePolicyId: string
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
  const basePath = useTenantLink('/venues/')

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

  const [updateDenialOfServiceProtection, { isLoading:
    isUpdatingDenialOfServiceProtection }] = useUpdateDenialOfServiceProtectionMutation()
  const [updateVenueRogueAp, {
    isLoading: isUpdatingVenueRogueAp }] = useUpdateVenueRogueApMutation()

  const { data: dosProctectionData } = useGetDenialOfServiceProtectionQuery({ params })
  const { data: venueRogueApData } = useGetVenueRogueApQuery({ params })

  const [roguePolicyIdValue, setRoguePolicyIdValue] = useState('')
  const [triggerDoSProtection, setTriggerDoSProtection] = useState(false)
  const [triggerRogueAPDetection, setTriggerRogueAPDetection] = useState(false)
  const [rogueDrawerVisible, setRogueDrawerVisible] = useState(false)

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
    if(dosProctectionData && venueRogueApData){
      const {
        enabled: dosProtectionEnabled,
        blockingPeriod,
        checkPeriod,
        failThreshold
      } = dosProctectionData

      const {
        enabled: rogueApEnabled,
        reportThreshold,
        roguePolicyId
      } = venueRogueApData

      formRef?.current?.setFieldsValue({
        dosProtectionEnabled,
        blockingPeriod,
        checkPeriod,
        failThreshold,
        rogueApEnabled,
        reportThreshold,
        roguePolicyId
      })
    }

    if (venueRogueApData?.roguePolicyId) {
      setRoguePolicyIdValue(venueRogueApData.roguePolicyId)
    }
  }, [dosProctectionData, venueRogueApData])

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

  return (
    <Loader states={[{
      isLoading: false,
      isFetching: isUpdatingDenialOfServiceProtection || isUpdatingVenueRogueAp
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
            triggerDirtyFunc={setTriggerRogueAPDetection}>
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
