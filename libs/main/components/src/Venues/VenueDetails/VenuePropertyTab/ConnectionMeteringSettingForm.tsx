import { useEffect, useState, useRef } from 'react'

import { ArrowUpOutlined, ArrowDownOutlined }        from '@ant-design/icons'
import { Col, Form, Row, Select, Space, Typography } from 'antd'
import { useWatch }                                  from 'antd/lib/form/Form'
import moment                                        from 'moment-timezone'
import { useIntl }                                   from 'react-intl'
import styled                                        from 'styled-components'

import { StepsForm, Button,  Modal, ModalType, Subtitle, Tooltip, DatePicker } from '@acx-ui/components'
import { ConnectionMeteringForm, ConnectionMeteringFormMode }                  from '@acx-ui/rc/components'
import {
  BillingCycleType,
  ConnectionMetering
} from '@acx-ui/rc/utils'
import { hasCrossVenuesPermission } from '@acx-ui/user'

const Info = styled(Typography.Text)`
  overflow-wrap: anywhere;
  font-size: 12px;
`

function RateLimitLabel (props:{ uploadRate?:number, downloadRate?:number }) {
  const { uploadRate, downloadRate } = props
  const { $t } = useIntl()
  return (<div style={{ display: 'flex' }}>
    <div style={{ display: 'flex' }}>
      <div><ArrowDownOutlined /></div>
      <div>
        <Info>
          {downloadRate ? downloadRate + 'Mbps' : $t({ defaultMessage: 'Unlimited' })}
        </Info>
      </div>
    </div>
    <div style={{ display: 'flex', marginLeft: '4px' }}>
      <div><ArrowUpOutlined /></div>
      <div>
        <Info>{uploadRate ? uploadRate + 'Mbps' : $t({ defaultMessage: 'Unlimited' })}</Info>
      </div>
    </div>
  </div>)
}

function DataConsumptionLable (props: {
  billingCycleRepeat: boolean,
  biilingCycleType: BillingCycleType,
  billingCycleDays: number | null
}) {
  const { $t } = useIntl()
  const { billingCycleRepeat, biilingCycleType, billingCycleDays } = props

  if (!billingCycleRepeat) return <Info>{$t({ defaultMessage: 'Once' })}</Info>
  return <Info>{ $t({ defaultMessage: `Repeating cycles {
    cycleType, select,
    CYCLE_MONTHLY {(Monthly)}
    CYCLE_WEEKLY {(Weekly)}
    CYCLE_NUM_DAYS {(Per {cycleDays} days)}
    other {}
  }` }, {
    cycleType: biilingCycleType,
    cycleDays: billingCycleDays
  })}</Info>

}

export function ConnectionMeteringPanel (props: { data:ConnectionMetering }) {
  const { $t } = useIntl()
  const { data } = props
  return (
    <div>
      <div>
        <Subtitle level={5}>
          {$t({ defaultMessage: 'Rate limiting' })}
        </Subtitle>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '40%' }}>
          <Info>{$t({ defaultMessage: 'Rate limit:' })}</Info>
        </div>
        <div style={{ width: '60%', fontSize: '12px' }}>
          <RateLimitLabel uploadRate={data.uploadRate} downloadRate={data.downloadRate} />
        </div>
      </div>
      <div style={{ marginTop: '4px' }}>
        <Subtitle level={5}>
          {$t({ defaultMessage: 'Data consumption' })}
        </Subtitle>
      </div>
      <div style={{ display: 'flex', fontSize: '12px' }}>
        <div style={{ width: '40%' }}>
          <Info>{$t({ defaultMessage: 'MaxData:' })}</Info>
        </div>
        <div style={{ width: '60%' }}>
          <Info>{data.dataCapacity > 0 ? data.dataCapacity + 'MB' :
            $t({ defaultMessage: 'Unlimited' })}</Info>
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: '12px' }}>
        <div style={{ width: '40%' }}>
          <Info>{$t({ defaultMessage: 'Consumption cycle:' })}</Info>
        </div>
        <div style={{ width: '60%' }}>
          <DataConsumptionLable
            billingCycleRepeat={data.billingCycleRepeat}
            biilingCycleType={data.billingCycleType}
            billingCycleDays={data.billingCycleDays}/>
        </div>
      </div>
    </div>
  )
}


export function ConnectionMeteringSettingForm (
  props:{ data: ConnectionMetering[], isEdit: boolean }
){
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { data, isEdit } = props
  const [modalVisible, setModalVisible] = useState(false)
  const onModalClose = () => setModalVisible(false)
  const [profileMap, setProfileMap] = useState(new Map(data.map((p) => [p.id, p])))
  const profileId = useWatch('meteringProfileId', form)
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldScrollDown = useRef<boolean>(!isEdit)

  useEffect(()=> {
    if (shouldScrollDown.current && profileId && bottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [profileId])

  useEffect(()=> {
    setProfileMap(new Map(data.map((p) => [p.id, p])))
  }, [data])


  return (
    <>
      <StepsForm.Title style={{ fontSize: '14px' }}>
        {$t({ defaultMessage: 'Traffic Control' })}
      </StepsForm.Title>
      <Space direction={'vertical'} size={24} style={{ display: 'flex', marginTop: '5px' }}>
        <Row>
          <Col span={21}>
            <Form.Item
              label={
                <>
                  {$t({ defaultMessage: 'Data Usage Metering' })}
                  <Tooltip.Question
                    // eslint-disable-next-line max-len
                    title={$t({ defaultMessage: 'All devices that belong to this unit will be applied to the selected data usage metering profile' })}
                    placement='top'
                  />
                </>
              }
              name={'meteringProfileId'}
            >
              <Select
                allowClear
                placeholder={$t({ defaultMessage: 'Select...' })}
                options={Array.from(profileMap,
                  (entry) => ({ label: entry[1].name, value: entry[0] }))}
                onChange={()=> {shouldScrollDown.current = true}}
              />
            </Form.Item>
          </Col>
          <Col span={3}>{
            hasCrossVenuesPermission({ needGlobalPermission: true }) &&[
              <Button
                key={'addMetering'}
                style={{ marginLeft: '5px', height: '100%' }}
                type={'link'}
                onClick={()=>setModalVisible(true)}
              >
                {$t({ defaultMessage: 'Add' })}
              </Button>]}
          </Col>
        </Row>
        {profileId && profileMap.has(profileId) &&
        <>
          <Row>
            <Col span={24}>
              <ConnectionMeteringPanel
                data={profileMap.get(profileId)!!}/>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name={'expirationDate'}
                label={$t({ defaultMessage: 'Expiration Date of Data Consumption' })}
                required
                rules={[{ required: true }]}
                getValueFromEvent={(onChange) => onChange ? moment(onChange): undefined}
                getValueProps={(i) => ({ value: i ? moment(i) : undefined })}
                initialValue={form.getFieldValue('expirationDate')}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(date)=> date.diff(moment.now()) < 0}
                />
              </Form.Item>
              <div ref={bottomRef}></div>
            </Col>
          </Row>
        </>}
      </Space>

      <Modal
        title={$t({ defaultMessage: 'Add Data Usage Metering' })}
        visible={modalVisible}
        type={ModalType.ModalStepsForm}
        children={<ConnectionMeteringForm
          mode={ConnectionMeteringFormMode.CREATE}
          useModalMode={true}
          modalCallback={(id?: string) => {
            if (id) {
              form.setFieldValue('meteringProfileId', id)
            }
            onModalClose()
          }}
        />}
        onCancel={onModalClose}
        width={1200}
        destroyOnClose={true}
      />
    </>
  )
}
