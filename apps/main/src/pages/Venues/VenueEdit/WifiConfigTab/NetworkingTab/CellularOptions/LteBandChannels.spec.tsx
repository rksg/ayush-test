import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CellularNetworkSelectionEnum, CommonUrlsInfo, LteBandRegionEnum, WanConnectionEnum }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { fireEvent, within }          from '@acx-ui/test-utils'

import { LteBandChannels } from './LteBandChannels'


describe('LteBandChannels', () => {
  const params = { venueId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  const editData = {
    'model': 'M510',
    'primarySim': {
      'lteBands': [{
        'band3G': ['B2', 'B4'],
        'band4G': ['B4'],
        'region': LteBandRegionEnum.USA_CANADA
      }, {
        'band4G': ['B3'], 
        'region': LteBandRegionEnum.DOMAIN_1
      }],
      'enabled': false,
      'apn': 'defaultapn0000',
      'roaming': true,
      'networkSelection': CellularNetworkSelectionEnum.ThreeG
    },
    'secondarySim': {
      'lteBands': [{
        'band4G': ['B3'],
        'region': LteBandRegionEnum.DOMAIN_1
      }, {
        'band3G': ['B2'],
        'region': LteBandRegionEnum.USA_CANADA
      }],
      'enabled': true,
      'apn': 'defaultapn',
      'roaming': true,
      'networkSelection': CellularNetworkSelectionEnum.LTE
    },
    'wanConnection': WanConnectionEnum.CELLULAR,
    'primaryWanRecoveryTimer': 99
  }

  const regionCountriesMap = {
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

  const availableLteBands = {
    band3G: ['B2', 'B4', 'B5'],
    band4G: ['B2', 'B4', 'B12'],
    region: LteBandRegionEnum.USA_CANADA,
    countryCodes: ['US', 'CA']
  }


  it('should render LTE Band channel successfully', async () => {
   

    const { asFragment } = render(
      <Provider>
        <Form>
          <LteBandChannels 
           index={0}
           availableLteBands={availableLteBands} 
           isCurrent={false} 
           simCardNumber={0} 
           isShowDesc={false} 
           countryName={''} 
           regionName={''} 
           regionCountries={''} 
           regionCountriesMap={regionCountriesMap} 
           region={''} 
           formControlName={'primarySim'} 
           isShowOtherLteBands={false} 
           editData={editData} />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })


  it('should render LTE Band channel not show other bands successfully', async () => {

    render(
      <Provider>
        <Form>
          <LteBandChannels 
           index={2}
           availableLteBands={availableLteBands} 
           isCurrent={false} 
           simCardNumber={0} 
           isShowDesc={true} 
           countryName={''} 
           regionName={'USA & Canada'} 
           regionCountries={'USA, Canada'} 
           regionCountriesMap={regionCountriesMap} 
           region={LteBandRegionEnum.USA_CANADA} 
           formControlName={'primarySim'} 
           isShowOtherLteBands={true} 
           editData={editData} />
        </Form>
      </Provider>, {
        route: { params }
      })

      expect(screen.getByText(/USA & Canada/i)).toBeVisible()
      expect(screen.getByText(/USA, Canada/i)).toBeVisible()
      
   
  })
})
