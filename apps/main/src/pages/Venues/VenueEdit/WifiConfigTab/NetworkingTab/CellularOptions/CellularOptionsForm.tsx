import { useState, useEffect, useRef, useContext } from 'react'

import {
  Select,
  Form,
  InputNumber
} from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { showToast, StepsForm, StepsFormInstance, Subtitle }                                                                               from '@acx-ui/components'
import { useGetAvailableLteBandsQuery, useGetVenueApModelCellularQuery, useGetVenueSettingsQuery, useUpdateVenueCellularSettingsMutation } from '@acx-ui/rc/services'
import { AvailableLteBands, LteBandRegionEnum, VenueApModelCellular }                                                                      from '@acx-ui/rc/utils'

import { VenueEditContext } from '../../..'

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
  const params = useParams()
  const { tenantId, venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)

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
  const [currentRegion, setCurrentRegion] = useState('')
  const [availableLteBandsArray, setAvailableLteBandsArray] =
    useState(defaultAvailableLteBandsArray)
  const [editData, setEditData] = useState(defaultEditData)
  const formRef = useRef<StepsFormInstance>()
  const form = Form.useFormInstance()

  useEffect(() => {
    let availableLteBandsData = _.cloneDeep(availableLteBands.data)
    let venueApModelCellularData = _.cloneDeep(venueApModelCellular.data)
    const countryCode = _.get(venueData, 'data.countryCode')

    if (availableLteBandsData && countryCode) {

      availableLteBandsData.forEach(lteBands => {
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

      // this.getCellularSupportedModels$();
      if (venueApModelCellularData) {
        venueApModelCellularData.primarySim.lteBands =
          venueApModelCellularData.primarySim?.lteBands || []
        venueApModelCellularData.secondarySim.lteBands =
          venueApModelCellularData.secondarySim?.lteBands || []


        //createDefaultRegion
        for (const region in LteBandRegionEnum) {

          if (!venueApModelCellularData.primarySim.lteBands.some(
            item => item.region === region)) {
            venueApModelCellularData.primarySim.lteBands.push({
              region: _.get(region, region)
            })
          }

          if (!venueApModelCellularData.secondarySim.lteBands.some(
            item => item.region === region)) {
            venueApModelCellularData.secondarySim.lteBands.push({
              region: _.get(region, region)
            })
          }
        }

        setEditData(venueApModelCellularData)

        formRef?.current?.setFieldsValue({ editData: venueApModelCellularData })
      }
      setAvailableLteBandsArray(availableLteBandsData)
    }

  }, [availableLteBands, venueApModelCellular, venueData, form])
  const onChange = () =>{
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networking',
      tabTitle: $t({ defaultMessage: 'Networking' }),
      isDirty: true
    })
    setEditNetworkingContextData && setEditNetworkingContextData({
      ...editNetworkingContextData,
      meshData: { mesh: true },
      updateCellular: handleVenueCellularSettings
    })
  }
  const [updateVenueCellularSettings] = useUpdateVenueCellularSettingsMutation()

  const handleVenueCellularSettings = async (payload: VenueApModelCellular) => {
    try {
      const lteBand = formRef?.current?.getFieldsValue().bandLteArray

      const genLteBands = function (ltBand: { [x: string]: { band4G: string[], band3G: string[] } }) {
        let lteBandArray: { region: string; band3G: string[]; band4G: string[] }[] = []
        Object.keys(ltBand).forEach(region => {
          lteBandArray.push({
            region,
            band3G: ltBand[region].band3G, band4G: ltBand[region].band4G
          })
        })
        return lteBandArray;
      }

      let value = formRef?.current?.getFieldValue('editData')
      value.primarySim.lteBands = genLteBands(lteBand.primarySim)
      value.secondarySim.lteBands = genLteBands(lteBand.secondarySim)

      await updateVenueCellularSettings({ params,
        payload: { ...payload, ...value } })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <Subtitle level={3}>{$t({ defaultMessage: 'Cellular Options' })}</Subtitle>
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm
          formRef={formRef}
          onChange={onChange}>
          <CellularRadioSimSettings
            editData={editData}
            simCardNumber={1}
            countryCode={_.get(venueData, 'data.countryCode')}
            legend={$t({ defaultMessage: 'Primary SIM' })}
            regionCountriesMap={regionCountriesMap}
            currentRegion={currentRegion}
            availableLteBands={availableLteBandsArray}
            formControlName={'primarySim'} />
          <CellularRadioSimSettings
            editData={editData}
            simCardNumber={2}
            legend={$t({ defaultMessage: 'Secondary SIM' })}
            regionCountriesMap={regionCountriesMap}
            countryCode={_.get(venueData, 'data.countryCode')}
            currentRegion={currentRegion}
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
            children={<InputNumber style={{ width: '150px' }}/>}
          />
        </StepsForm.StepForm>
      </StepsForm>

    </>

  )
}

