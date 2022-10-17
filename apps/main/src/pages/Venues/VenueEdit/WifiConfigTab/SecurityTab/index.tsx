import { ReactNode, useContext, useEffect, useRef } from 'react'

import { Col, Form, FormItemProps, InputNumber, Row, Select, Tooltip } from 'antd'
import { FormattedMessage, useIntl }                                   from 'react-intl'

import { Fieldset, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useGetRoguePoliciesQuery,
  useGetDenialOfServiceProtectionQuery,
  useUpdateDenialOfServiceProtectionMutation,
  useGetVenueRogueApQuery,
  useUpdateVenueRogueApMutation
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../'

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

  const [updateDenialOfServiceProtection] = useUpdateDenialOfServiceProtectionMutation()
  const [updateVenueRogueAp] = useUpdateVenueRogueApMutation()

  const { data: dosProctectionData } = useGetDenialOfServiceProtectionQuery({ params })
  const { data: venueRogueApData } = useGetVenueRogueApQuery({ params })

  const { selectOptions, selected } = useGetRoguePoliciesQuery({ params },{
    selectFromResult ({ data }) {
      return {
        selectOptions: data?.map(item => <Option key={item.id}>{item.name}</Option>) ?? [],
        selected: data?.find((item) => item.id === formRef.current?.getFieldValue('roguePolicyId'))
      }
    }
  })

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
          initialValue={false}>
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
          initialValue={false}>
          <Row>
            <Col span={2}>
              <Form.Item
                label={$t({ defaultMessage: 'Report SNR Threshold:' })}
                name='reportThreshold'
                initialValue={0}
                children={<InputNumber
                  min={0}
                  max={100}
                  style={{ width: '120px' }} />} />
            </Col>
            <Col span={1}>
              <div style={{ marginTop: '30px' }}>dB</div>
            </Col>
          </Row>
          <Form.Item
            name='roguePolicyId'
            label={$t({ defaultMessage: 'Report SNR Threshold:' })}
            style={{ width: '200px' }}
            initialValue={selected}
          >
            <Select children={selectOptions} />
          </Form.Item>
        </FieldsetItem>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

const FieldsetItem = ({
  children,
  label,
  ...props
}: FormItemProps & { label: string, children: ReactNode }) => <Form.Item
  {...props}
  valuePropName='checked'
>
  <Fieldset {...{ label, children }} />
</Form.Item>
