import { Col, Form, Radio, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import TierTopology2    from '../../../../../assets/images/personal-identity-diagrams/2-tier-topology.svg'
import TierTopology3    from '../../../../../assets/images/personal-identity-diagrams/3-tier-topology.svg'
import WirelessTopology from '../../../../../assets/images/personal-identity-diagrams/wireless-topology.svg'

import { TopologySelectCard } from './TopologySelectCard'

export const Wireless = 'Wireless'
export const TwoTier = '2-Tier'
export const ThreeTier = '3-Tier'

export const NetworkTopologyForm = () => {
  const { $t } = useIntl()

  return (
    <Row>
      <Col span={20}>
        <Row>
          <Col span={24}>
            <StepsForm.Title>{$t({ defaultMessage: 'Network Topology' })}</StepsForm.Title>
          </Col>
          <Col span={24}>
            {/* eslint-disable-next-line max-len*/}
            {$t({ defaultMessage: 'Select the network topology for this <venueSingular></venueSingular> and ensure device compatibility.' })}
          </Col>
        </Row>
        <Form.Item name='networkTopologyType'>
          <Radio.Group
            style={{ width: '100%', marginTop: '20px' }}
          >
            <Row gutter={20}>
              <Col span={8}>
                <TopologySelectCard
                  id={Wireless}
                  title={$t({ defaultMessage: 'Wireless topology' })}
                  diagram={<img
                    style={{ margin: 'auto', marginTop: '180px', scale: '1.2' }}
                    src={WirelessTopology}
                    width={'100%'}
                    alt={$t({ defaultMessage: 'Personal Identity Topology' })}
                  />}
                />
              </Col>
              <Col span={8}>
                <TopologySelectCard
                  id={TwoTier}
                  title={$t({ defaultMessage: '2-tier topology' })}
                  diagram={<img
                    style={{ margin: 'auto', marginTop: '130px', scale: '1.2' }}
                    src={TierTopology2}
                    width={'100%'}
                    alt={$t({ defaultMessage: 'Personal Identity Topology' })}
                  />}
                />
              </Col>
              <Col span={8}>
                <TopologySelectCard
                  id={ThreeTier}
                  title={$t({ defaultMessage: '3-tier topology' })}
                  diagram={<img
                    style={{ margin: 'auto', marginTop: '90px', scale: '1.2' }}
                    src={TierTopology3}
                    width={'100%'}
                    alt={$t({ defaultMessage: 'Personal Identity Topology' })}
                  />}
                />
              </Col>
            </Row>
          </Radio.Group>
        </Form.Item>
      </Col>
    </Row>
  )
}