import { useState } from 'react'

import { Col, Form, Row, Slider } from 'antd'
import { useIntl }                from 'react-intl'

import { Button, StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'
import { EdgeClusterStatus, EdgePortInfo }                from '@acx-ui/rc/utils'

import { SelectInterfaceDrawer } from './SelectInterfaceDrawer'
import { VipCard }               from './VipCard'

export interface VirtualIpFormType {
  timeout: number
  vipConfig: {
    interfaces: {
      [key: string]: EdgePortInfo
    }
    vip: string
  }[]
}

interface EdgeClusterVirtualIpSettingFormProps {
  currentClusterStatus?: EdgeClusterStatus
  lanInterfaces?: {
    [key: string]: EdgePortInfo[]
  }
}

export const EdgeClusterVirtualIpSettingForm = (props: EdgeClusterVirtualIpSettingFormProps) => {
  const { currentClusterStatus, lanInterfaces } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const [selectInterfaceDrawerVisible, setSelectInterfaceDrawerVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const vipConfig = Form.useWatch('vipConfig', form)

  const maxVipCount = 2

  const openDrawer = (index: number) => {
    setCurrentIndex(index)
    setSelectInterfaceDrawerVisible(true)
  }

  const handleSelectPort = (data: { [key: string]: EdgePortInfo | undefined }, index?: number) => {
    if(index === undefined) return
    vipConfig[index].interfaces = data
    form.setFieldValue('vipConfig', vipConfig)
  }

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
                        field={field}
                        index={index}
                        remove={remove}
                        vipConfig={vipConfig}
                        currentClusterStatus={currentClusterStatus}
                        openDrawer={openDrawer}
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
                title={$t({ defaultMessage: `
                            HA timeout refers to the duration within which if a node
                            does not receive a periodic heartbeat from the active node.
                            This triggers the process of selecting the next active node
                            to maintain system functionality
                            ` })}
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
        <SelectInterfaceDrawer
          visible={selectInterfaceDrawerVisible}
          setVisible={setSelectInterfaceDrawerVisible}
          handleFinish={handleSelectPort}
          currentVipIndex={currentIndex}
          editData={vipConfig?.[currentIndex]?.interfaces}
          currentClusterStatus={currentClusterStatus}
          selectedInterfaces={vipConfig}
          lanInterfaces={lanInterfaces}
        />
      </Col>
    </Row>
  )
}