import React, { useContext, useState, useEffect } from 'react'

import {
  Select,
  Switch,
  Divider,
  Form,
  Input
} from 'antd'
import { useIntl }   from 'react-intl'

import { AvailableLteBands, CellularNetworkSelectionEnum, VenueApModelCellular } from '@acx-ui/rc/utils'

import { LteBandChannels } from './LteBandChannels'

export interface ModelOption {
  label: string
  value: string
}

const { Option } = Select

export function CellularRadioSimSettings (props: {
  availableLteBands: AvailableLteBands[],
  simCardNumber: number,
  legend: string,
  regionCountriesMap: any,
  currentRegion:string,
  currentCountryName: string,
  formControlName: string,
  editData: VenueApModelCellular
}) {
  const { $t } = useIntl()
  const a = props.availableLteBands[0]
  let isShowOtherLteBands = false //TODO

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
          }}>{props.simCardNumber} {props.legend} </div>

          <Form.Item
            style={{
              display: 'flex', alignItems: 'center',
              height: '30px'
            }}
            name={['editData', props.formControlName, 'enabled']}
            initialValue={false}
            valuePropName='checked'
            children={
              <Switch />
            }
          />
        </div>
      </Divider>

      <Form.Item
        name={['editData',props.formControlName,'apn']}
        label={$t({ defaultMessage: 'APN:' })}
        initialValue={1}
        children={<Input style={{ width: '150px' }}></Input>}
      />

      <Form.Item
        name={['editData', props.formControlName, 'networkSelection']}
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
        name={['editData',props.formControlName, 'roaming']}
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
              key={index}
              editData={props.editData}
              formControlName={props.formControlName}
              simCardNumber={props.simCardNumber}
              availableLteBands={item}
              isShowDesc={item.region == 'DOMAIN_1' || item.region == 'DOMAIN_2'}
              isShowOtherLteBands={isShowOtherLteBands}
              countryName = {props.currentCountryName}
              regionName ={item.region} //getRegionName
              regionCountries = {item.region} //getRegionCountries
              regionCountriesMap = {props.regionCountriesMap}
              region = {item.region}
              isCurrent={index === 0} />
          ))
        }
      />

      <Divider orientation='left' plain/>
    </div>

  )
}
