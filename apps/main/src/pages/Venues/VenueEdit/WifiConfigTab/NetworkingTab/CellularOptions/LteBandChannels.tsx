
import { useEffect } from 'react'

import {
  Form,
  Checkbox
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { AvailableLteBandOptions, AvailableLteBands, LteBandLockCountriesJson, VenueApModelCellular } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'


const { useWatch } = Form

export function LteBandChannels (
  props: {
    index: number,
    availableLteBands: AvailableLteBands,
    isCurrent: boolean,
    simCardNumber: number,
    isShowDesc: boolean,
    countryName: string,
    regionName: string,
    regionCountries: string,
    regionCountriesMap: LteBandLockCountriesJson,
    region: string,
    formControlName: 'primarySim'|'secondarySim',
    isShowOtherLteBands: boolean,
    editData: VenueApModelCellular
  }
) {
  const form = Form.useFormInstance()
  const [enableRegion] = [
    useWatch<boolean>(['checkbox', props.formControlName, props.region])
  ]
  const object = _.get(props.editData, props.formControlName)
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
        const lteBandsArrayIndex = lteBandsArray.findIndex(i=>i.region==props.region)
        form.setFieldValue(['checkbox', props.formControlName, props.region], 
          (!_.isEmpty(lteBandsArray[lteBandsArrayIndex]?.band3G)||
        !_.isEmpty(lteBandsArray[lteBandsArrayIndex]?.band4G)))
     
      }
    }
  }, [object])


  const { $t } = useIntl()
  let availableLteBand3G: AvailableLteBandOptions[] = []
  let availableLteBand4G: AvailableLteBandOptions[] = []

  if (props.availableLteBands.band3G) {
    availableLteBand3G = props.availableLteBands.band3G.map((band: string) => ({
      value: band,
      label: band
    })
    )
  }

  if (props.availableLteBands.band4G) {
    availableLteBand4G = props.availableLteBands.band4G.map((band: string) => ({
      value: band,
      label: band
    })
    )
  }

  return (
    <>
      {props.isCurrent &&
        <UI.CurrentCountryLabel>{$t({ defaultMessage: 'Bands for current country' })}
          {' (' + props.regionCountries + ')'}
        </UI.CurrentCountryLabel>
      }
      {(!props.isCurrent && props.isShowOtherLteBands) &&
        <>
          <Form.Item
            name={['checkbox', props.formControlName, props.region]}
            initialValue={false}
            valuePropName='checked'
            style={{ marginBottom: '0px' }}
            children={
              <Checkbox children={props.regionName} />
            }
          />
          {props.isShowDesc &&
            <UI.CountryDescLabel>{props.regionCountries}</UI.CountryDescLabel>}
        </>
      }
      {(props.isCurrent || (!props.isCurrent && enableRegion && props.isShowOtherLteBands)) &&
        <>
          <UI.FieldLabel width='25px'>
            {$t({ defaultMessage: '3G:' })}
            <UI.MultiSelect>
              <Form.Item
                style={{ marginBottom: '0px' }}
                initialValue={[]}
                name={['bandLteArray', props.formControlName, props.region, 'band3G']}
                children={
                  <Checkbox.Group
                    options={availableLteBand3G}
                  />
                }
              />
            </UI.MultiSelect>
          </UI.FieldLabel>

          <UI.FieldLabel width='25px'>
            {$t({ defaultMessage: '4G:' })}
            <UI.MultiSelect>
              <Form.Item
                initialValue={[]}
                name={['bandLteArray', props.formControlName, props.region, 'band4G']}
                children={
                  <Checkbox.Group
                    options={availableLteBand4G}
                  />
                }
              />
            </UI.MultiSelect>
          </UI.FieldLabel></>
      }
    </>

  )
}
