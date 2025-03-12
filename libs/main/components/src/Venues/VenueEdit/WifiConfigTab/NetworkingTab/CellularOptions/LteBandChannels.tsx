
import { useEffect } from 'react'

import {
  Form,
  Checkbox
} from 'antd'
import { CheckboxChangeEvent }        from 'antd/lib/checkbox'
import { get, isEmpty, keys, pickBy } from 'lodash'
import { useIntl }                    from 'react-intl'

import { StepsFormLegacy }                                                                                                   from '@acx-ui/components'
import { AvailableLteBandOptions, AvailableLteBands, CountryIsoDisctionary, LteBandLockCountriesJson, VenueApModelCellular } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'


const { useWatch } = Form

export function LteBandChannels (
  props: {
    index: number,
    availableLteBands: AvailableLteBands,
    isCurrent: boolean,
    simCardNumber: number,
    isShowDesc: boolean,
    regionName: string,
    countryCode: string,
    regionCountries: string,
    regionCountriesMap: LteBandLockCountriesJson,
    region: string,
    formControlName: 'primarySim'|'secondarySim',
    isShowOtherLteBands: boolean,
    editData: VenueApModelCellular,
    disabled?: boolean
  }
) {
  const form = Form.useFormInstance()
  const { formControlName, region, regionName,
    editData, countryCode, availableLteBands, disabled } = props
  const [enableRegion] = [
    useWatch<boolean>(['checkbox', formControlName, region])
  ]
  const object = get(editData, formControlName)
  useEffect(() => {
    const lteBandsArray = object.lteBands
    if (lteBandsArray && lteBandsArray.length === 4) {
      form.setFieldsValue({
        bandLteArray: {
          [props.formControlName]:
          {
            [lteBandsArray[0].region]: lteBandsArray[0],
            [lteBandsArray[1].region]: lteBandsArray[1],
            [lteBandsArray[2].region]: lteBandsArray[2],
            [lteBandsArray[3].region]: lteBandsArray[3]
          }
        }
      }
      )

      if(lteBandsArray){
        const lteBandsArrayIndex = lteBandsArray.findIndex(i=>i.region == region)
        form.setFieldValue(['checkbox', formControlName, props.region],
          (!isEmpty(lteBandsArray[lteBandsArrayIndex]?.band3G)||
        !isEmpty(lteBandsArray[lteBandsArrayIndex]?.band4G)))

      }
    }
  }, [object])

  // set current country name
  let currentCountryName = ''
  const getCurrentCountryName = function (countryCode: string) {
    return pickBy(CountryIsoDisctionary, (val) => {
      return val.toUpperCase() === countryCode
    })
  }
  const currentCountry = getCurrentCountryName(countryCode)
  if (currentCountry) {
    currentCountryName = keys(currentCountry)[0]
  }

  const { $t } = useIntl()
  let availableLteBand3G: AvailableLteBandOptions[] = []
  let availableLteBand4G: AvailableLteBandOptions[] = []

  if (availableLteBands.band3G) {
    availableLteBand3G = availableLteBands.band3G.map((band: string) => ({
      value: band,
      label: band
    })
    )
  }

  if (availableLteBands.band4G) {
    availableLteBand4G = availableLteBands.band4G.map((band: string) => ({
      value: band,
      label: band
    })
    )
  }

  const onCheckChange = function (e: CheckboxChangeEvent) {
    if (!e.target.checked) {
      form.setFieldValue(['bandLteArray', formControlName, region, 'band3G'], [])
      form.setFieldValue(['bandLteArray', formControlName, region, 'band4G'], [])
    }
  }

  return (
    <>
      {props.isCurrent &&
        <UI.CurrentCountryLabel>{$t({ defaultMessage: 'Bands for current country' })}
          {' (' + currentCountryName + ')'}
        </UI.CurrentCountryLabel>
      }
      {(!props.isCurrent && props.isShowOtherLteBands) &&
        <>
          <Form.Item
            name={['checkbox', formControlName, region]}
            initialValue={false}
            valuePropName='checked'
            style={{ marginBottom: '0px' }}
            children={
              <Checkbox
                disabled={disabled}
                children={regionName}
                onChange={onCheckChange} />
            }
          />
          {props.isShowDesc &&
            <UI.CountryDescLabel>{props.regionCountries}</UI.CountryDescLabel>}
        </>
      }
      {(props.isCurrent || (!props.isCurrent && enableRegion && props.isShowOtherLteBands)) &&
        <>
          <StepsFormLegacy.FieldLabel width='25px'>
            {$t({ defaultMessage: '3G:' })}
            <StepsFormLegacy.MultiSelect>
              <Form.Item
                style={{ marginBottom: '0px' }}
                initialValue={[]}
                name={['bandLteArray', props.formControlName, props.region, 'band3G']}
                children={
                  <Checkbox.Group
                    disabled={disabled}
                    options={availableLteBand3G}
                  />
                }
              />
            </StepsFormLegacy.MultiSelect>
          </StepsFormLegacy.FieldLabel>

          <StepsFormLegacy.FieldLabel width='25px'>
            {$t({ defaultMessage: '4G:' })}
            <StepsFormLegacy.MultiSelect>
              <Form.Item
                initialValue={[]}
                name={['bandLteArray', formControlName, region, 'band4G']}
                children={
                  <Checkbox.Group
                    disabled={disabled}
                    options={availableLteBand4G}
                  />
                }
              />
            </StepsFormLegacy.MultiSelect>
          </StepsFormLegacy.FieldLabel></>
      }
    </>

  )
}
