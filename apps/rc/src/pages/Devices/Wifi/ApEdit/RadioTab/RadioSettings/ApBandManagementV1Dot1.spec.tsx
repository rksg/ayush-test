import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import {
  ApBandModeSettingsV1Dot1,
  ApModel,
  BandModeEnum
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { ApDataContext } from '../..'
import {
  triBandApCap
} from '../../../../__tests__/fixtures'

import { ApBandManagementV1Dot1 } from './ApBandManagementV1Dot1'

const r760Cap = triBandApCap.apModels.find(cap => cap.model === 'R760') as ApModel

describe('ApBandManagement', ()=> {

  describe('ApBandManagement with R760 AP', () => {
    it('should render correctly', async () => {
      const { result: hooks } = renderHook(() => {
        const [currentApBandModeData, setCurrentApBandModeData] =
          useState(
            {
              useVenueOrApGroupSettings: true,
              bandMode: BandModeEnum.TRIPLE
            } as ApBandModeSettingsV1Dot1)
        return { currentApBandModeData, setCurrentApBandModeData }
      })

      const MockedComponent = () => (<Provider>
        <ApDataContext.Provider value={{ apCapabilities: r760Cap }}>
          <ApBandManagementV1Dot1
            venueBandMode={BandModeEnum.DUAL}
            apGroupBandMode={BandModeEnum.DUAL}
            currentApBandModeData={hooks.current.currentApBandModeData}
            setCurrentApBandModeData={hooks.current.setCurrentApBandModeData}
            apGroupData=''
          />
        </ApDataContext.Provider>
      </Provider>)

      const { rerender } = render(
        <MockedComponent />, { route: { params: { tenantId: 'tenantId' } } }
      )

      expect(await screen.findByText(/Use inherited settings from/)).toBeInTheDocument()
      expect(screen.getByText('Dual-band')).toBeInTheDocument()
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

      await userEvent.click(screen.getByLabelText('Customize settings'))

      rerender(<MockedComponent />)

      const combo = await screen.findByRole('combobox')
      expect(combo).toBeInTheDocument()
      expect(combo).not.toBeDisabled()

      await userEvent.click(screen.getByRole('combobox'))

      expect(await screen.findByRole('option',
        { name: 'Tri-band', selected: true })).toBeInTheDocument()
    })
  })
})
