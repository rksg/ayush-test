import { useState, useEffect, useRef } from 'react'

import {
  Select,
  Form,
  Input
} from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { StepsForm, StepsFormInstance, Subtitle }                                                                from '@acx-ui/components'
import { useGetAvailableLteBandsQuery, useGetVenueApModelCellularQuery, useGetVenueSettingsQuery }                       from '@acx-ui/rc/services'
import { AvailableLteBands, CountryIsoDisctionary, LteBandLockChannel, LteBandRegionEnum, VenueApModelCellular } from '@acx-ui/rc/utils'

import { CellularRadioSimSettings } from './CellularRadioSimSettings'

export interface ModelOption {
  label: string
  value: string
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
  const { tenantId, venueId } = useParams()

  const LteBandLockCountriesJson = {
    [LteBandRegionEnum.DOMAIN_1]: {
      name: 'Domain 1 countries',
      // eslint-disable-next-line max-len
      countries: 'European Union, Hong Kong, India, Malaysia, Philippines, Singapore, Thailand, Turkey, United Kingdom, Vietnam'
    },
    [LteBandRegionEnum.DOMAIN_2]: {
      name: 'Domain 2 countries',
      countries: 'Australia, Brazil, Mexico, New Zealand, Taiwan'
    },
    [LteBandRegionEnum.USA_CANADA]: {
      name: 'USA & Canada',
      countries: 'USA, Canada'
    },
    [LteBandRegionEnum.JAPAN]: {
      name: 'Japan',
      countries: 'Japan'
    }
  }

  const defaultAvailableLteBandsArray: AvailableLteBands[] = []
  const defaultEditData: VenueApModelCellular = {
    primarySim: {}, secondarySim: {},
    primaryWanRecoveryTimer: 0
  }
  let regionCountriesMap = _.cloneDeep(LteBandLockCountriesJson)

  const venueApModelCellular = useGetVenueApModelCellularQuery({ params: { tenantId, venueId } })
  const availableLteBands = useGetAvailableLteBandsQuery({ params: { tenantId, venueId } })
  const venueData = useGetVenueSettingsQuery({ params: { tenantId, venueId } })
  const [currentRegion, setCurrentRegion] = useState('');
  const [currentCountryName, setCurrentCountryName] = useState('');
  const [availableLteBandsArray, setAvailableLteBandsArray] =
    useState(defaultAvailableLteBandsArray)
  const [editData, setEditData] = useState(defaultEditData)
  const formRef = useRef<StepsFormInstance>()
  const form = Form.useFormInstance()

  const shiftCurrentRegionToFirst = function (lteBands: LteBandLockChannel[]) {
    if (!_.isEmpty(currentRegion)) {
      const index = lteBands.findIndex(item => item.region === currentRegion)
      lteBands.splice(0, 0, lteBands.splice(index, 1)[0])
    }
  }

  const sortByLteBandRegionEnum = function (availableLteBands: AvailableLteBands[]) {
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

  const getCurrentCountryName = function (countryCode: string) {
    return _.pickBy(CountryIsoDisctionary, (val) => {
      return val.toUpperCase() === countryCode
    })
  }

  useEffect(() => {
    let availableLteBandsContext = _.cloneDeep(availableLteBands?.data)
    let venueApModelCellularContext = _.cloneDeep(venueApModelCellular.data)
    const countryCode = _.get(venueData, 'data.countryCode')
    
    if (availableLteBandsContext && countryCode) {

      availableLteBandsContext.forEach(lteBands => {
        regionCountriesMap[lteBands.region] =
          Object.assign(regionCountriesMap[lteBands.region], {
            countryCodes: lteBands.countryCodes
          })
      })

      //setCurrentCountry
      Object.keys(regionCountriesMap).map(function (objectKey) {
        const value = _.get(regionCountriesMap, objectKey)
        if (value.countryCodes.indexOf(countryCode) > -1) { 
          setCurrentRegion(objectKey) }
      })

      //setCurrentCountryName
      const currentCountry = getCurrentCountryName(countryCode)

      if (currentCountry) {
        setCurrentCountryName( _.keys(currentCountry)[0])
      }

      // this.getCellularSupportedModels$(); 
      if (venueApModelCellularContext) {
        venueApModelCellularContext.primarySim.lteBands =
          venueApModelCellularContext.primarySim?.lteBands || []
        venueApModelCellularContext.secondarySim.lteBands =
          venueApModelCellularContext.secondarySim?.lteBands || []

        //createDefaultRegion
        for (const region in LteBandRegionEnum) {
          if (!venueApModelCellularContext.primarySim.lteBands.some(
            item => item.region === region)) {
            venueApModelCellularContext.primarySim.lteBands.push({
              region: _.get(region, region)
            })
          }

          if (!venueApModelCellularContext.secondarySim.lteBands.some(
            item => item.region === region)) {
            venueApModelCellularContext.secondarySim.lteBands.push({
              region: _.get(region, region)
            })
          }
        }

        //sortByLteBandRegionEnum
        sortByLteBandRegionEnum(venueApModelCellularContext.primarySim.lteBands)
        sortByLteBandRegionEnum(venueApModelCellularContext.secondarySim.lteBands)
        sortByLteBandRegionEnum(availableLteBandsContext)

        //shiftCurrentRegionToFirst
        shiftCurrentRegionToFirst(venueApModelCellularContext.primarySim.lteBands)
        shiftCurrentRegionToFirst(venueApModelCellularContext.secondarySim.lteBands)
        shiftCurrentRegionToFirst(availableLteBandsContext)

        setEditData(venueApModelCellularContext)

        formRef?.current?.setFieldsValue({ editData: venueApModelCellularContext })
      }
      setAvailableLteBandsArray(availableLteBandsContext)
    }

  }, [availableLteBands.data, venueApModelCellular.data, form])

  return (
    <>
      <Subtitle level={3}>{$t({ defaultMessage: 'Cellular Options' })}</Subtitle>
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm
          formRef={formRef}>
          <CellularRadioSimSettings
            editData={editData}
            simCardNumber={1}
            legend={$t({ defaultMessage: 'Primary SIM' })}
            regionCountriesMap={regionCountriesMap}
            currentRegion={currentRegion}
            currentCountryName={currentCountryName}
            availableLteBands={availableLteBandsArray}
            formControlName={'primarySim'} />
          <CellularRadioSimSettings
            editData={editData}
            simCardNumber={2}
            legend={$t({ defaultMessage: 'Secondary SIM' })}
            regionCountriesMap={regionCountriesMap}
            currentRegion={currentRegion}
            currentCountryName={currentCountryName}
            availableLteBands={availableLteBandsArray}
            formControlName={'secondarySim'} />
          <Form.Item
            name={['editData', 'wanConnection']}
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
            name={['editData', 'primaryWanRecoveryTimer']}
            label={$t({ defaultMessage: 'Primary WAN Recovery Timer:' })}
            initialValue={60}
            rules={[{
              required: true
            }, {
              type: 'number', max: 300, min: 10,
              message: $t({
                defaultMessage:
                  'Primary WAN Recovery Timer must be between 10 and 300'
              })
            }]}
            children={<Input style={{ width: '150px' }}></Input>}
          />
        </StepsForm.StepForm>
      </StepsForm>

    </>

  )
}

