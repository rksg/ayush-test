import { useState, useEffect, useContext } from 'react'

import {
  Select,
  Switch,
  Row,
  Col,
  Space,
  Divider,
  Form,
  Input
} from 'antd'
import { isEqual } from 'lodash'
import { useIntl } from 'react-intl'

import { CellularNetworkSelectionEnum } from './CellularOptionsForm'


export interface ModelOption {
  label: string
  value: string
}

const { Option } = Select


export function CellularRadoSimSettings () {
  const { $t } = useIntl()



  return (
    <>
      <Divider orientation='left' plain>
        <div style={{
          display: 'grid', gridTemplateColumns: 'auto 100px', gridGap: '5px',
          height: '30px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            height: '30px'
          }}>1 Primary SIM</div>

          <Form.Item
            style={{
              display: 'flex', alignItems: 'center',
              height: '30px'
            }}
            name={['wlan', 'advancedCustomization', 'hideSsid']}
            initialValue={false}
            valuePropName='checked'
            children={
              <Switch />
            }
          />
        </div>
      </Divider>

      <Form.Item
        name={'apn'}
        label={$t({ defaultMessage: 'APN:' })}
        initialValue={1}
        children={<Input style={{ width: '150px' }}></Input>}
      />

      <Form.Item
        name={'networkSelection'}
        rules={[{
          required: true
        }]}
        label={$t({ defaultMessage: '3G/4G (LTE) Selection:' })}
        initialValue={CellularNetworkSelectionEnum.AUTO}
        children={
          <Select
            style={{ width: '150px' }}>
            <Option value={CellularNetworkSelectionEnum.AUTO}>
              {$t({ defaultMessage: 'Auto' })}
            </Option>
            <Option value={CellularNetworkSelectionEnum.LTE}>
              {$t({ defaultMessage: '4G (LTE) only' })}
            </Option>
            <Option value={CellularNetworkSelectionEnum.ThreeG}>
              {$t({ defaultMessage: '3G only' })}
            </Option>
          </Select>
        }
      />

      <Form.Item
        name={'dataRoming'}
        label={$t({ defaultMessage: 'Data Roaming' })}
        initialValue={false}
        valuePropName='checked'
        children={<Switch />}
      />

    </>

  )
}
