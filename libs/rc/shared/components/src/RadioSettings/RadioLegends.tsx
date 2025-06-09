/* eslint-disable max-len */
import styled from 'styled-components/macro'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

const displayWidth = '40px'
const RadioLegendsComponent = styled.div`
  position: relative;
  padding-top: 1em;
  .legends {
    position: absolute;
    display: grid;
    grid-template-columns: 190px 114px 313px ;
    grid-column-gap: 8px;
    height: 16px;

    .legend {
      border: 1px dashed var(--acx-neutrals-50);
      border-bottom: none;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      position: relative;

      .legend-display {
        position: absolute;
        width: ${displayWidth};
        height: 20px;
        top: -10px;
        left: calc(50% - ${displayWidth}/2);
        text-align: center;
        background: white;
        font-weight: 300;
      }
    }
  }
`

export function RadioLegends (props: { isDual5gMode: boolean, isTriBandRadio: boolean, isSupport6GCountry: boolean }) {
  const { isDual5gMode, isSupport6GCountry, isTriBandRadio } = props
  const isWifiSwitchableRfEnabled = useIsSplitOn(Features.WIFI_SWITCHABLE_RF_TOGGLE)

  if (!(isTriBandRadio || isWifiSwitchableRfEnabled)) return null

  return (
    <RadioLegendsComponent>
      { isDual5gMode &&
        <div className='legends'
          style={{ gridTemplateColumns: (isTriBandRadio || (isWifiSwitchableRfEnabled && isSupport6GCountry)) ?
            '190px 114px 313px' : '190px 313px' }}>
          <div></div>
          {(isTriBandRadio || (isWifiSwitchableRfEnabled && isSupport6GCountry)) && <div></div>}
          <div className='legend'>
            <div className='legend-display'>R760</div>
          </div>
        </div>
      }
    </RadioLegendsComponent>
  )
}
