import { ReactNode, useState } from 'react'

import {
  Select,
  Switch,
  Form,
  Input,
  Button,
  FormItemProps
} from 'antd'
import { get, isEmpty } from 'lodash'
import { useIntl }      from 'react-intl'

import { Fieldset }    from '@acx-ui/components'
import {
  AvailableLteBands,
  CellularNetworkSelectionEnum,
  LteBandLockChannel,
  LteBandLockCountriesJson,
  LteBandRegionEnum,
  VenueApModelCellular,
  excludeSpaceRegExp } from '@acx-ui/rc/utils'

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
  countryCode: string,
  regionCountriesMap: LteBandLockCountriesJson,
  currentRegion: string,
  formControlName: 'primarySim' | 'secondarySim',
  editData: VenueApModelCellular,
  disabled?: boolean
}) {
  const { $t } = useIntl()
  const { disabled, formControlName, legend,
    editData, availableLteBands, simCardNumber } = props
  const [isShowOtherLteBands, setIsShowOtherLteBands] = useState(false)

  const shiftCurrentRegionToFirst = function (lteBands: LteBandLockChannel[]) {
    if (!isEmpty(props.currentRegion)) {
      const index = lteBands.findIndex(item => item.region === props.currentRegion)
      lteBands.splice(0, 0, lteBands.splice(index, 1)[0])
    }
  }

  const sortByLteBandRegionEnum = function (availableLteBands: LteBandLockChannel[]) {
    const map = {
      [LteBandRegionEnum.DOMAIN_1]: 0,
      [LteBandRegionEnum.DOMAIN_2]: 1,
      [LteBandRegionEnum.USA_CANADA]: 2,
      [LteBandRegionEnum.JAPAN]: 3
    }
    availableLteBands.sort((a, b) => {
      if (map[a.region] < map[b.region]) {
        return -1
      }
      if (map[a.region] > map[b.region]) {
        return 1
      }
      return 0
    })
  }

  sortByLteBandRegionEnum(availableLteBands)
  shiftCurrentRegionToFirst(availableLteBands)
  if (props.editData[formControlName].lteBands) {
    shiftCurrentRegionToFirst(get(editData, [formControlName] + '.lteBands'))
    sortByLteBandRegionEnum(get(editData, [formControlName] + '.lteBands'))
  }

  return (
    <FieldsetItem
      name={['editData', formControlName, 'enabled']}
      label={$t({ defaultMessage: '{simCardNumber} {legend}' },
        { simCardNumber, legend })}
      //disabled={disabled}
      initialValue={false}>

      <Form.Item
        name={['editData', formControlName, 'apn']}
        label={$t({ defaultMessage: 'APN:' })}
        initialValue={1}
        rules={[
          { validator: (_, value) => excludeSpaceRegExp(value) }
        ]}
        children={<Input disabled={disabled} style={{ width: '150px' }} />}
      />

      <Form.Item
        name={['editData', formControlName, 'networkSelection']}
        label={$t({ defaultMessage: '3G/4G (LTE) Selection:' })}
        initialValue={CellularNetworkSelectionEnum.AUTO}
        children={
          <Select
            disabled={disabled}
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
        name={['editData', formControlName, 'roaming']}
        label={$t({ defaultMessage: 'Data Roaming' })}
        initialValue={false}
        valuePropName='checked'
        children={<Switch disabled={disabled} />}
      />


      <Form.Item
        label={$t({ defaultMessage: 'LTE Bank Lock' })}
        children={
          availableLteBands.map((item, index) => (
            <div
              key={formControlName + index}>
              <LteBandChannels
                index={index}
                disabled={disabled}
                editData={props.editData}
                formControlName={formControlName}
                simCardNumber={props.simCardNumber}
                availableLteBands={item}
                countryCode={props.countryCode}
                isShowDesc={item.region === 'DOMAIN_1' || item.region === 'DOMAIN_2'}
                isShowOtherLteBands={isShowOtherLteBands}
                regionName={props.regionCountriesMap[item.region].name}
                regionCountries={props.regionCountriesMap[item.region].countries}
                regionCountriesMap={props.regionCountriesMap}
                region={item.region}
                isCurrent={index === 0} />
              {index === 0 &&
                <Button
                  type='link'
                  disabled={disabled}
                  onClick={() => {
                    setIsShowOtherLteBands(!isShowOtherLteBands)
                  }}
                >
                  {isShowOtherLteBands ?
                    $t({ defaultMessage: 'Hide bands for other countries' }) :
                    $t({ defaultMessage: 'Show bands for other countries' })}
                </Button>
              }
            </div>
          ))
        }
      />
    </FieldsetItem>
  )
}
const FieldsetItem = ({
  children,
  label,
  disabled,
  ...props
}: FormItemProps & { label: string, children: ReactNode, disabled?: boolean }) => <Form.Item
  {...props}
  valuePropName='checked'
>
  <Fieldset {...{ label, children, disabled }} />
</Form.Item>