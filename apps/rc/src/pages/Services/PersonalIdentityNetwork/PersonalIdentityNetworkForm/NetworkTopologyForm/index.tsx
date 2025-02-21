import { useContext, useState } from 'react'

import { Col, Form, Radio, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { Button, StepsForm }                              from '@acx-ui/components'
import { EdgeCompatibilityDrawer, EdgeCompatibilityType } from '@acx-ui/rc/components'
import { IncompatibilityFeatures }                        from '@acx-ui/rc/utils'

import TierTopology2                          from '../../../../../assets/images/personal-identity-diagrams/2-tier-topology.svg'
import TierTopology3                          from '../../../../../assets/images/personal-identity-diagrams/3-tier-topology.svg'
import WirelessTopology                       from '../../../../../assets/images/personal-identity-diagrams/wireless-topology.svg'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { TopologySelectCard } from './TopologySelectCard'

export enum NetworkTopologyType {
  Wireless = 'Wireless',
  TwoTier = '2-Tier',
  ThreeTier = '3-Tier'
}

export const NetworkTopologyForm = () => {
  const { $t } = useIntl()
  const { switchList, requiredSwitchModels } = useContext(PersonalIdentityNetworkFormContext)
  const [isCompatibilityDrawerVisible, setIsCompatibilityDrawerVisible] = useState(false)
  const existedSwitchModelList = switchList?.map(switchItem => switchItem.model)
  const hasCompatibleSwitch = requiredSwitchModels?.some(model =>
    existedSwitchModelList?.some(existedSwitchModel => existedSwitchModel?.startsWith(model)))


  // eslint-disable-next-line max-len
  const RadioGroupComponent = (props: { value?: NetworkTopologyType, onChange?: (value: unknown) => void }) => {
    return <Radio.Group
      style={{ width: '100%', marginTop: '20px' }}
      {...props}
    >
      <Row gutter={20}>
        <Col span={8}>
          <TopologySelectCard
            id={NetworkTopologyType.Wireless}
            title={$t({ defaultMessage: 'Wireless topology' })}
            isActive={props.value === NetworkTopologyType.Wireless}
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
            id={NetworkTopologyType.TwoTier}
            title={$t({ defaultMessage: '2-tier topology' })}
            isActive={props.value === NetworkTopologyType.TwoTier}
            diagram={<img
              style={{ margin: 'auto', marginTop: '130px', scale: '1.2' }}
              src={TierTopology2}
              width={'100%'}
              alt={$t({ defaultMessage: 'Personal Identity Topology' })}
            />}
            disabled={!hasCompatibleSwitch}
          />
        </Col>
        <Col span={8}>
          <TopologySelectCard
            id={NetworkTopologyType.ThreeTier}
            title={$t({ defaultMessage: '3-tier topology' })}
            isActive={props.value === NetworkTopologyType.ThreeTier}
            diagram={<img
              style={{ margin: 'auto', marginTop: '90px', scale: '1.2' }}
              src={TierTopology3}
              width={'100%'}
              alt={$t({ defaultMessage: 'Personal Identity Topology' })}
            />}
            disabled={!hasCompatibleSwitch}
          />
        </Col>
      </Row>
    </Radio.Group>
  }

  return (
    <>
      <Row>
        <Col span={20}>
          <Row>
            <Col span={24}>
              <StepsForm.Title>{$t({ defaultMessage: 'Network Topology' })}</StepsForm.Title>
            </Col>
            <Col span={24}>
              {$t(
              // eslint-disable-next-line max-len
                { defaultMessage: 'Select the network topology for this <venueSingular></venueSingular> and ensure device compatibility. {requirement}' },
                // eslint-disable-next-line max-len
                {
                  requirement: <Button
                    type='link'
                    onClick={() => setIsCompatibilityDrawerVisible(true)}
                    children={$t({ defaultMessage: 'See compatibility requirement' })}
                  />
                }
              )}
            </Col>
          </Row>
          <Form.Item name='networkTopologyType'>
            <RadioGroupComponent />
          </Form.Item>
        </Col>
      </Row>
      <EdgeCompatibilityDrawer
        visible={isCompatibilityDrawerVisible}
        type={EdgeCompatibilityType.ALONE}
        title={$t({ defaultMessage: 'Compatibility Requirement' })}
        featureName={IncompatibilityFeatures.PIN}
        onClose={() => setIsCompatibilityDrawerVisible(false)}
      />
    </>
  )
}