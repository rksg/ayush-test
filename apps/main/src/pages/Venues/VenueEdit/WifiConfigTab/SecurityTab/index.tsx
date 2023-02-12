import React, { ReactNode, useContext, useEffect, useRef, useState, CSSProperties } from 'react'

import { Form, FormItemProps, InputNumber, Select, Space } from 'antd'
import _                                                   from 'lodash'
import { FormattedMessage, useIntl }                       from 'react-intl'

import { Button, Fieldset, Loader, showToast, StepsForm, StepsFormInstance, Tooltip } from '@acx-ui/components'
import {
  useGetDenialOfServiceProtectionQuery,
  useUpdateDenialOfServiceProtectionMutation,
  useGetVenueRogueApQuery,
  useUpdateVenueRogueApMutation, useGetRoguePolicyListQuery
} from '@acx-ui/rc/services'
import { getPolicyRoutePath, PolicyOperation, PolicyType, VenueMessages } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                          from '@acx-ui/react-router-dom'

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

  const formRef = useRef<StepsFormInstance>()
  const {
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
  const [rogueDrawerVisible, setRogueDrawerVisible] = useState(false)

  const { selectOptions, selected } = useGetRoguePolicyListQuery({ params },{
    selectFromResult ({ data }) {
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
        const defaultProfile = selectOptions.find(option => option.props.children === 'Default profile')
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
  }, [dosProctectionData, venueRogueApData])

  const handleUpdateSecuritySettings = async (data?: SecuritySetting) => {
    try {
      const dosProtectionPayload = {
        enabled: data?.dosProtectionEnabled,
        blockingPeriod: data?.blockingPeriod,
        checkPeriod: data?.checkPeriod,
        failThreshold: data?.failThreshold
      }
      await updateDenialOfServiceProtection({ params, payload: dosProtectionPayload })

      const rogueApPayload = {
        enabled: data?.rogueApEnabled,
        reportThreshold: data?.reportThreshold,
        roguePolicyId: data?.roguePolicyId
      }
      await updateVenueRogueAp({ params, payload: rogueApPayload })

      setEditContextData({
        ...editContextData,
        isDirty: false
      })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
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

  return (
    <Loader states={[{
      isLoading: false,
      isFetching: isUpdatingDenialOfServiceProtection || isUpdatingVenueRogueAp
    }]}>
      <StepsForm
        formRef={formRef}
        onFinish={handleUpdateSecuritySettings}
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
        onFormChange={handleChange}
      >
        <StepsForm.StepForm>
          <FieldsetItem
            name='dosProtectionEnabled'
            label={$t({ defaultMessage: 'DoS Protection:' })}
            initialValue={false}
            switchStyle={{ marginLeft: '78.5px' }}>
            <FormattedMessage
              defaultMessage={`
              Block a client for <blockingPeriod></blockingPeriod> seconds
              after <failThreshold></failThreshold> repeat authentication failures
              within <checkPeriod></checkPeriod> seconds
            `}
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
                      children={<InputNumber min={30} max={600} style={{ width: '70px' }} />}
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
                      children={<InputNumber min={2} max={25} style={{ width: '70px' }} />}
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
                      children={<InputNumber min={30} max={600} style={{ width: '70px' }} />}
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
            switchStyle={{}}>
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
                  children={<InputNumber min={0} max={100} style={{ width: '120px' }} />} />
                <span style={{ marginTop: '30px' }}>dB</span>
              </Space>
            </Form.Item>
            <Form.Item
              name='roguePolicyId'
              label={$t({ defaultMessage: 'Rogue AP Detection Policy Profile:' })}
              initialValue={roguePolicyIdValue}
            >
              <Space>
                <Select
                  children={selectOptions}
                  value={roguePolicyIdValue}
                  onChange={(value => {
                    formRef.current?.setFieldValue('roguePolicyId', value)
                    setRoguePolicyIdValue(value)
                  })}
                  style={{ width: '200px' }}
                />
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
                <TenantLink
                  to={getPolicyRoutePath({
                    type: PolicyType.ROGUE_AP_DETECTION,
                    oper: PolicyOperation.CREATE
                  })}
                >
                  {$t({ defaultMessage: 'Add Profile' })}
                </TenantLink>
              </Space>
              { rogueDrawerVisible && <RogueApDrawer
                visible={rogueDrawerVisible}
                setVisible={setRogueDrawerVisible}
                policyId={roguePolicyIdValue} /> }
            </Form.Item>
          </FieldsetItem>
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}

const FieldsetItem = ({
  children,
  label,
  switchStyle,
  ...props
}: FormItemProps & { label: string, children: ReactNode, switchStyle: CSSProperties }) => <Form.Item
  {...props}
  valuePropName='checked'
>
  <Fieldset {...{ label, children }} switchStyle={switchStyle}/>
</Form.Item>
