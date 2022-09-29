import { useState, useEffect, useContext } from 'react'

import {
  Select,
  Switch,
  Row,
  Col,
  Space,
  Form,
  Checkbox
} from 'antd'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import { isEqual }           from 'lodash'
import { useIntl }           from 'react-intl'
import styled                from 'styled-components'

import { Button, StepsForm, Table, TableProps, Loader, showToast, Subtitle } from '@acx-ui/components'
import { AvailableLteBands }                                                 from '@acx-ui/rc/utils'

const { useWatch } = Form

export function LteBandChannels (
  props: {
    availableLteBands: AvailableLteBands,
    isCurrent: boolean,
    simCardNumber: number
  }
) {

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
    useWatch<boolean>(['venue', props.simCardNumber, props.availableLteBands?.region])
  ]



  return (
    <>

      {props.isCurrent &&
        <CurrentCountryLabel>{$t({ defaultMessage: 'Bands for current country' })}
          {' (' + props.availableLteBands?.region + ')'}
        </CurrentCountryLabel>
      }
      {!props.isCurrent &&

        <Form.Item
          name={['venue', props.simCardNumber, props.availableLteBands?.region]}
          initialValue={false}
          valuePropName='checked'
          children={
            <Checkbox children={props.availableLteBands?.region} />
          }
        />
      }
      {(props.isCurrent || (!props.isCurrent && enableRegion)) &&
        <>
          <FieldLabel width='25px'>
            {$t({ defaultMessage: '3G:' })}
            <Form.Item
              children={
                <Checkbox.Group
                  options={availableLteBand3G}
                  disabled
                  onChange={onChange}
                />
              }
            />
          </FieldLabel>

          <FieldLabel width='25px'>
            {$t({ defaultMessage: '4G:' })}
            <Form.Item
              children={
                <Checkbox.Group
                  options={availableLteBand4G}
                  onChange={onChange}
                />
              }
            />
          </FieldLabel></>
      }
    </>

  )
}
