import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Subtitle } from '@acx-ui/components'

import { InterfaceSettingsFormType } from '../types'

import { VipCard } from './VipCard'

interface VipDisplayFormProps {
  vipConfig?: InterfaceSettingsFormType['vipConfig']
  timeout?: string
}

export const VipDisplayForm = (props: VipDisplayFormProps) => {
  const { vipConfig, timeout } = props
  const { $t } = useIntl()
  const validVipConfig = vipConfig?.filter(item => item?.vip && item?.interfaces)

  return (
    <>
      <Subtitle level={4}>
        { $t({ defaultMessage: 'Cluster Virtual IP' }) }
      </Subtitle>
      {
        !!validVipConfig?.length &&
          <>
            <Form.Item>
              {
                <Row>
                  <Col span={12}>
                    {
                      validVipConfig?.map((item, index) => (
                        <VipCard
                          key={item.vip}
                          index={index + 1}
                          data={item}
                        />
                      ))
                    }
                  </Col>
                </Row>
              }
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'HA Timeout' })}
            >
              {`${timeout} seconds`}
            </Form.Item>
          </>
      }
    </>
  )
}