import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Divider, Form, InputNumber, Row, Select, Switch, Tooltip } from 'antd'
import { useIntl }                                                       from 'react-intl'

import { showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
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

  const [dosProtection, setDosProtection] = useState<boolean>(false)
  const [rogueAp, setRogueAp] = useState<boolean>(false)

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

      setDosProtection(dosProtectionEnabled)
      rogueApEnabled && setRogueAp(rogueApEnabled)
    }
  }, [dosProctectionData, venueRogueApData])

  const handleUpdateSecuritySettings = async (data?: SecuritySetting) => {
    try {
      if(data?.dosProtectionEnabled){
        const payload = {
          enabled: data?.dosProtectionEnabled,
          blockingPeriod: data?.blockingPeriod,
          checkPeriod: data?.checkPeriod,
          failThreshold: data?.failThreshold
        }
        await updateDenialOfServiceProtection({ params, payload })
      }

      if(data?.rogueApEnabled){
        const payload = {
          enabled: data?.rogueApEnabled,
          reportThreshold: data?.reportThreshold,
          roguePolicyId: data?.roguePolicyId
        }
        await updateVenueRogueAp({ params, payload })
      }
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
      tabKey: 'security',
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
        <Divider orientation='left' plain>
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto 100px', gridGap: '5px',
            height: '30px'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              height: '30px'
            }}> {$t({ defaultMessage: 'Dos Protection' })} </div>
            <Form.Item
              name='dosProtectionEnabled'
              valuePropName='checked'
              initialValue={false}
              style={{
                display: 'flex', alignItems: 'center',
                height: '30px'
              }}
            >
              <Switch onChange={() => setDosProtection(!dosProtection)}/>
            </Form.Item>
          </div>
        </Divider>
        { dosProtection &&
        <div>
          <div style={{
            display: 'inline-block',
            paddingTop: '5px',
            paddingRight: '5px'
          }}> {$t({ defaultMessage: 'Block a client for ' })} </div>
          <Tooltip title={$t({ defaultMessage: 'Allowed values are 30-600' })}>
            <Form.Item
              style={{
                display: 'inline-block',
                paddingRight: '5px'
              }}
              name='blockingPeriod'
              rules={[
                { required: true }
              ]}
              initialValue={60}
              children={<InputNumber min={30} max={600} style={{ width: '70px' }} />}
            />
          </Tooltip>
          <div style={{
            display: 'inline-block',
            paddingTop: '5px',
            paddingRight: '5px'
          }}> {$t({ defaultMessage: ' seconds after ' })} </div>
          <Tooltip title={$t({ defaultMessage: 'Allowed values are 2-25' })}>
            <Form.Item
              style={{
                display: 'inline-block',
                paddingRight: '5px'
              }}
              rules={[
                { required: true }
              ]}
              name='failThreshold'
              initialValue={5}
              children={<InputNumber min={2} max={25} style={{ width: '70px' }} />}
            />
          </Tooltip>
          <div style={{
            display: 'inline-block',
            paddingTop: '5px',
            paddingRight: '5px'
          }}> {$t({ defaultMessage: '  repeat authentication failures within ' })} </div>
          <Tooltip title={$t({ defaultMessage: 'Allowed values are 30-600' })}>
            <Form.Item
              style={{
                display: 'inline-block',
                paddingRight: '5px'
              }}
              name='checkPeriod'
              initialValue={30}
              children={<InputNumber min={30} max={600} style={{ width: '70px' }} />}
            />
          </Tooltip>
          <div style={{
            display: 'inline-block',
            paddingTop: '5px',
            paddingRight: '5px'
          }}> {$t({ defaultMessage: ' seconds' })} </div>
        </div>
        }
        <Divider orientation='left' plain>
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto 100px', gridGap: '5px',
            height: '30px'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              height: '30px'
            }}> {$t({ defaultMessage: 'Rogue AP Detection:' })} </div>
            <Form.Item
              name='rogueApEnabled'
              valuePropName='checked'
              initialValue={false}
              style={{
                display: 'flex', alignItems: 'center',
                height: '30px'
              }}
            >
              <Switch onChange={() => setRogueAp(!rogueAp)}/>
            </Form.Item>
          </div>
        </Divider>
        { rogueAp &&
        <>
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
            <Select
              children={selectOptions} />
          </Form.Item>
        </>
        }
      </StepsForm.StepForm>
    </StepsForm>
  )
}
