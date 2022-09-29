
import {
  Form,
  Checkbox
} from 'antd'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import { useIntl }           from 'react-intl'
import styled                from 'styled-components'

import { AvailableLteBands } from '@acx-ui/rc/utils'

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

      border: 1px solid black;
      border-radius: 4px;
      background-color: white;

      > span:first-child {
        display: none;
      }
    }

    > label.ant-checkbox-wrapper-checked {
      border: 1px solid black;
      border-radius: 4px;
      background-color: black;
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
          name={['venue', props.simCardNumber, props.availableLteBands?.region]}
          initialValue={false}
          valuePropName='checked'
          style={{ marginBottom: '0px' }}
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
              style={{ marginBottom: '0px' }}
              children={
                <Styled>
                  <Checkbox.Group
                    options={availableLteBand3G}
                    onChange={onChange}
                  />
                </Styled>
              }
            />
          </FieldLabel>

          <FieldLabel width='25px'>
            {$t({ defaultMessage: '4G:' })}
            <Form.Item
              children={
                <Styled>
                  <Checkbox.Group
                    options={availableLteBand4G}
                    onChange={onChange}
                  />
                </Styled>
              }
            />
          </FieldLabel></>
      }
    </>

  )
}
