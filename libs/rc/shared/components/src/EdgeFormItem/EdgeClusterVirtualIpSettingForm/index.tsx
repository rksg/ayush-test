
import { Col, Form, Row, Slider } from 'antd'
import { useIntl }                from 'react-intl'

import { Button, StepsForm, Tooltip, useStepFormContext }      from '@acx-ui/components'
import { EdgeClusterStatus, EdgeIpModeEnum, VirtualIpSetting } from '@acx-ui/rc/utils'

import { VipCard } from './VipCard'

export interface VipInterface {
  interfaceName: string
  ip: string
  subnet: string
  ipMode: EdgeIpModeEnum
}

export interface VirtualIpFormType {
  timeout: number
  vipConfig: VipConfigType[]
}

export interface VipConfigType {
  interfaces: VirtualIpSetting['ports']
  vip: string
}

interface EdgeClusterVirtualIpSettingFormProps {
  currentClusterStatus?: EdgeClusterStatus
  lanInterfaces?: {
    [key: string]: VipInterface[]
  }
}

export const EdgeClusterVirtualIpSettingForm = (props: EdgeClusterVirtualIpSettingFormProps) => {
  const { currentClusterStatus, lanInterfaces } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const vipConfig = Form.useWatch('vipConfig', form)

  const maxVipCount = 1

  return (
    <Row gutter={[16, 30]}>
      <Col span={24}>
        <Form.List name='vipConfig'>
          {
            (fields, { add, remove }) => (
              <Row gutter={[16, 20]}>
                {
                  fields.map((field, index) =>
                    <Col key={`vip-${field.key}`} span={24}>
                      <VipCard
                        rootNamePath={['vipConfig']}
                        field={field}
                        index={index}
                        remove={remove}
                        vipConfig={vipConfig}
                        nodeList={currentClusterStatus?.edgeList}
                        lanInterfaces={lanInterfaces}
                      />
                    </Col>
                  )
                }
                <Col span={24}>
                  {
                    fields.length < maxVipCount &&
                    <Button
                      type='link'
                      onClick={() => add()}
                      children={$t({ defaultMessage: 'Add another virtual IP' })}
                    />
                  }
                </Col>
              </Row>
            )
          }
        </Form.List>
      </Col>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Failover Settings' })}</StepsForm.Title>
        <Form.Item
          label={
            <>
              {
                $t({ defaultMessage: 'HA Timeout' })
              }
              <Tooltip.Question
                title={
                  $t({ defaultMessage: `
                    The VRRP timer of 6 seconds or above is recommended
                    for RUCKUS Edge usecases. A timer lesser than this is
                    too aggressive and could potentially cause VRRP issues
                    in some networks. HA timeout refers to the duration
                    within which if a node does not receive a periodic
                    heartbeat from the active node. This triggers the
                    process of selecting the next active node to maintain
                    system functionality
                  ` })
                }
                placement='right'
              />
            </>
          }
          name='timeout'
        >
          <Slider
            tooltipVisible={false}
            style={{ width: '240px' }}
            min={3}
            max={15}
            marks={{
              3: $t({ defaultMessage: '3 seconds' }),
              15: $t({ defaultMessage: '15 seconds' })
            }}
          />
        </Form.Item>
      </Col>
    </Row>
  )
}