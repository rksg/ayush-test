import { useState, useEffect, useContext } from 'react'

import {
  Select,
  Switch,
  Row,
  Col,
  Space,
  Divider,
  Checkbox,
  Form,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import { Button, StepsForm, Table, TableProps, Loader, showToast, Subtitle } from '@acx-ui/components'

import { CellularRadoSimSettings } from './CellularRadoSimSettings'

export interface ModelOption {
  label: string
  value: string
}

export enum CellularNetworkSelectionEnum {
  AUTO = 'AUTO',
  LTE = 'LTE',
  ThreeG = 'ThreeG',
}

export const LteBandLockCountriesJson = {
  DOMAIN_1: {
    name: 'Domain 1 countries',
    // eslint-disable-next-line max-len
    countries: 'European Union, Hong Kong, India, Malaysia, Philippines, Singapore, Thailand, Turkey, United Kingdom, Vietnam'
  },
  DOMAIN_2: {
    name: 'Domain 2 countries',
    countries: 'Australia, Brazil, Mexico, New Zealand, Taiwan'
  },
  USA_CANADA: {
    name: 'USA & Canada',
    countries: 'USA, Canada'
  },
  JAPAN: {
    name: 'Japan',
    countries: 'Japan'
  }
}
const { Option } = Select
export enum WanConnectionEnum {
  ETH_WITH_CELLULAR_FAILOVER = 'ETH_WITH_CELLULAR_FAILOVER',
  CELLULAR_WITH_ETH_FAILOVER = 'CELLULAR_WITH_ETH_FAILOVER',
  ETH = 'ETH',
  CELLULAR = 'CELLULAR',
}


export function CellularOptionsForm () {
  const { $t } = useIntl()

  const wanConnectionOptions = [
    {
      label: 'Ethernet (Primary) with cellular failover',
      value: WanConnectionEnum.ETH_WITH_CELLULAR_FAILOVER
    }, {
      label: 'Cellular (Primary) with ethernet failover',
      value: WanConnectionEnum.CELLULAR_WITH_ETH_FAILOVER
    }, {
      label: 'Ethernet only',
      value: WanConnectionEnum.ETH
    }, {
      label: 'Cellular only',
      value: WanConnectionEnum.CELLULAR
    }
  ]


  return (
    <>
      <Subtitle level={3}>{$t({ defaultMessage: 'Cellular Options' })}</Subtitle>
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm>
          <CellularRadoSimSettings/>
          <Form.Item
            name={'wanConnection'}
            label={$t({ defaultMessage: 'WAN Connection:' })}
            initialValue={WanConnectionEnum.ETH_WITH_CELLULAR_FAILOVER}
            rules={[{
              required: true
            }]}
            children={
              <Select
                style={{ width: '330px' }}>
                <Option value={WanConnectionEnum.ETH_WITH_CELLULAR_FAILOVER}>
                  {$t({ defaultMessage: 'Ethernet (Primary) with cellular failover' })}
                </Option>
                <Option value={WanConnectionEnum.CELLULAR_WITH_ETH_FAILOVER}>
                  {$t({ defaultMessage: 'Cellular (Primary) with ethernet failover' })}
                </Option>
                <Option value={WanConnectionEnum.ETH}>
                  {$t({ defaultMessage: 'Ethernet only' })}
                </Option>
                <Option value={WanConnectionEnum.CELLULAR}>
                  {$t({ defaultMessage: 'Cellular only' })}
                </Option>
              </Select>
            }
          />
          <Form.Item
            name={'primaryWanRecoveryTimer'}
            label={$t({ defaultMessage: 'Primary WAN Recovery Timer:' })}
            initialValue={60}
            rules={[{
              required: true
            }, {
              type: 'number', max: 300, min: 10,
              message: $t({ defaultMessage:
                'Primary WAN Recovery Timer must be between 10 and 300' })
            }]}
            children={<Input style={{ width: '150px' }}></Input>}
          />
        </StepsForm.StepForm>
      </StepsForm>

    </>

  )
}
