import { useState, useEffect, useContext, createContext } from 'react'

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
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, StepsForm, Table, TableProps, Loader, showToast, Subtitle } from '@acx-ui/components'
import { useGetAvailableLteBandsQuery }                                      from '@acx-ui/rc/services'
import { AvailableLteBands, LteBandRegionEnum }                                                 from '@acx-ui/rc/utils'

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
  const { tenantId, venueId } = useParams()

  const venueContext = useContext(VenueEditContext)
  const LteBandLockCountriesJson = {
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

  const defaultAvailableLteBandsArray: AvailableLteBands[] = []
  let regionCountriesMap = _.cloneDeep(LteBandLockCountriesJson)
  const availableLteBands = useGetAvailableLteBandsQuery({ params: { tenantId, venueId } })
  const [availableLteBandsArray, setAvailableLteBandsArray] =
    useState(defaultAvailableLteBandsArray)

  useEffect(() => {
    let availableLteBandsContext = availableLteBands?.data


    if(availableLteBandsContext){

      availableLteBandsContext.forEach(lteBands => {
        regionCountriesMap[lteBands.region] =
        Object.assign(regionCountriesMap[lteBands.region], {
          countryCodes: lteBands.countryCodes
        })
      })

      setAvailableLteBandsArray(availableLteBandsContext)
    }


    // this.setCurrentRegion(this.venueSettings.countryCode);
    // this.setCurrentCountryName();
    // this.getCellularSupportedModels$(); //for edit
  }, [availableLteBands.data])



  return (

    <>
      <Subtitle level={3}>{$t({ defaultMessage: 'Cellular Options' })}</Subtitle>
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm>

          <CellularRadioSimSettings
            simCardNumber={1}
            availableLteBands={availableLteBandsArray} />
          <CellularRadioSimSettings
            simCardNumber={2}
            availableLteBands={availableLteBandsArray} />

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
