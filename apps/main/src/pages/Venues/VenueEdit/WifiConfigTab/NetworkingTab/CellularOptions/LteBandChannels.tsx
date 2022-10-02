
import {
  Form,
  Checkbox
} from 'antd'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import { useIntl }           from 'react-intl'
import styled                from 'styled-components'

import { AvailableLteBands, VenueApModelCellular } from '@acx-ui/rc/utils'
import _ from 'lodash'
import { useEffect, useState } from 'react'

const { useWatch } = Form

export function LteBandChannels (
  props: {
    availableLteBands: AvailableLteBands,
    isCurrent: boolean,
    simCardNumber: number,
    isShowDesc: boolean,
    countryName: string,
    regionName: string,
    regionCountries: string,
    regionCountriesMap: any,
    region: string,
    formControlName: string,
    isShowOtherLteBands: boolean,
    editData: VenueApModelCellular
  }
) {
  const form = Form.useFormInstance()

  const object = _.get(props.editData, props.formControlName)
  useEffect(() => {
    const lteBandsArray = object.lteBands
    if (lteBandsArray && lteBandsArray.length == 4) {

      form.setFieldsValue({
        bandLteArray: {
          [props.formControlName]:
          {
            [lteBandsArray[0].region]: lteBandsArray[0],
            [lteBandsArray[1].region]: lteBandsArray[1],
            [lteBandsArray[2].region]: lteBandsArray[2],
            [lteBandsArray[3].region]: lteBandsArray[3],
          }
        }
      })
    }
  }, [object])


  const { $t } = useIntl()
  const onChange = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues)
  }
  let availableLteBand3G: any[] = []
  let availableLteBand4G: any[] = []

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
  const FieldLabel = styled.div<{ width: string }>`
    font-size: var(--acx-body-4-font-size);
    display: grid;
    line-height: 32px;
    grid-template-columns: ${props => props.width} 1fr;
`

  const CurrentCountryLabel = styled.span`
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
`


  const [
    enableRegion
  ] = [
    useWatch<boolean>(['editData', props.simCardNumber, props.region])
  ]



  const Styled = styled.div`
  div.ant-checkbox-group {
    display: flex;
    > label.ant-checkbox-wrapper {
      font-size: 12px;
      align-items: center;
      margin: 0 3px;
      width: auto;
      padding: 4px 12px;
      border: 1px solid rgb(217, 217, 217);
      border-right-width: 0;

      border: 1px solid #333333;
      border-radius: 4px;
      background-color: white;

      > span:first-child {
        display: none;
      }
    }

    > label.ant-checkbox-wrapper-checked {
      border: 1px solid #333333;
      border-radius: 4px;
      background-color: #333333;
      color: white;
    }

    > label.ant-checkbox-wrapper:last-child {
      border-right-width: 1px;
    }
  }
`


  return (
    <>

      {props.isCurrent &&
        <CurrentCountryLabel>{$t({ defaultMessage: 'Bands for current country' })}
          {' (' + props.availableLteBands?.region + ')'}
        </CurrentCountryLabel>
      }
      {!props.isCurrent &&

        <Form.Item
          name={['editData', props.simCardNumber, props.region]}
          initialValue={false}
          valuePropName='checked'
          style={{ marginBottom: '0px' }}
          children={
            <Checkbox children={props.region} />
          }
        />

      }
      {(props.isCurrent || (!props.isCurrent && enableRegion)) &&
        <>
          <FieldLabel width='25px'>
            {$t({ defaultMessage: '3G:' })}
            <Styled>
            <Form.Item
              style={{ marginBottom: '0px' }}
              initialValue={[]}
              name={['bandLteArray', props.formControlName, props.region, 'band3G']}
              children={
                  <Checkbox.Group
                    options={availableLteBand3G}
                    onChange={onChange}
                  />
              }
            />
             </Styled>
        </FieldLabel>

        <FieldLabel width='25px'>
          {$t({ defaultMessage: '4G:' })}
          <Styled>
            <Form.Item
            initialValue={[]}
            name={['bandLteArray', props.formControlName, props.region, 'band4G']}
              children={
                <Checkbox.Group
                  options={availableLteBand4G}
                  onChange={onChange}
                />
              }
            />
          </Styled>
        </FieldLabel></>
      }
    </>

  )
}
