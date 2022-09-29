import React, { useContext, useState, useEffect } from 'react'

import {
  Select,
  Switch,
  Divider,
  Form,
  Input
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { AvailableLteBands, CellularNetworkSelectionEnum } from '@acx-ui/rc/utils'

import { LteBandChannels } from './LteBandChannels'

export interface ModelOption {
  label: string
  value: string
}

const { Option } = Select

export function CellularRadioSimSettings (props: {
  availableLteBands: AvailableLteBands[],
  simCardNumber: number
}) {
  const { $t } = useIntl()
  // const { tenantId, venueId } = useParams()
  const a = props.availableLteBands[0]

  return (
    <div style={{

    }}>
      <Divider orientation='left' plain>
        <div style={{
          display: 'grid', gridTemplateColumns: 'auto 100px', gridGap: '5px',
          height: '30px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            height: '30px'
          }}>{props.simCardNumber} Primary SIM </div>

          <Form.Item
            style={{
              display: 'flex', alignItems: 'center',
              height: '30px'
            }}
            name={['venue', props.simCardNumber, 'enable']}
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
      <Form.Item
        label={$t({ defaultMessage: 'LTE Bank Lock' })}
        children={
          props.availableLteBands.map((item, index) => (
            <LteBandChannels
              simCardNumber={props.simCardNumber}
              availableLteBands={item}
              isCurrent={index === 0} />
          ))
        }
      />

      <Divider orientation='left' plain/>
    </div>

  )
}
