import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import {
  ApBandModeSettings,
  BandModeEnum
} from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { act, render, renderHook, screen } from '@acx-ui/test-utils'

import { ApDataContext } from '../..'
import {
  triBandApCap,
  venueSetting
} from '../../../../__tests__/fixtures'

import { ApBandManagement } from './ApBandManagement'

const r760Cap = triBandApCap.apModels.find(cap => cap.model === 'R760')

describe('ApBandManagement', ()=> {

  describe('ApBandManagement with R760 AP', () => {
    it('should render correctly', async () => {
      const { result: hooks } = renderHook(() => {
        const [currentApBandModeData, setCurrentApBandModeData] =
          useState({ useVenueSettings: true, bandMode: BandModeEnum.TRIPLE } as ApBandModeSettings)
        return { currentApBandModeData, setCurrentApBandModeData }
      })

      const MockedComponent = () => (<Provider>
        <ApDataContext.Provider value={{ apCapabilities: r760Cap }}>
          <ApBandManagement
            venue={venueSetting}
            venueBandMode={BandModeEnum.DUAL}
            isSupportDual5GAp={r760Cap.supportDual5gMode}
            isSupportTriBandRadioAp={r760Cap.supportTriRadio}
            currentApBandModeData={hooks.current.currentApBandModeData}
            setCurrentApBandModeData={hooks.current.setCurrentApBandModeData} />
        </ApDataContext.Provider>
      </Provider>)

      const { rerender } = render(
        <MockedComponent />, { route: { params: { tenantId: 'tenantId' } } })

      expect(await screen.findByRole('button', { name: 'Change' })).toBeInTheDocument()

      expect(await screen.findByRole('combobox')).toBeDisabled()

      expect(await screen.findAllByTitle('Dual-band')).toHaveLength(1)
      expect(screen.queryAllByTitle('Tri-band')).toHaveLength(0)

      await userEvent.click(screen.getByRole('button', { name: 'Change' }))

      rerender(<MockedComponent />)

      expect(await screen.findByRole('button', { name: 'Same as Venue' })).toBeInTheDocument()

      expect(await screen.findByRole('combobox')).not.toBeDisabled()

      expect(await screen.findAllByTitle('Tri-band')).toHaveLength(1)
      expect(screen.queryAllByTitle('Dual-band')).toHaveLength(0)

      expect(hooks.current.currentApBandModeData.useVenueSettings).toEqual(false)

      await act(async () => {
        hooks.current.setCurrentApBandModeData({
          useVenueSettings: true, bandMode: BandModeEnum.TRIPLE })
      })

      rerender(<MockedComponent />)

      expect(await screen.findByRole('button', { name: 'Change' })).toBeInTheDocument()

      expect(await screen.findByRole('combobox')).toBeDisabled()

      expect(await screen.findAllByTitle('Dual-band')).toHaveLength(1)
      expect(screen.queryAllByTitle('Tri-band')).toHaveLength(0)

      await act(async () => {
        hooks.current.setCurrentApBandModeData({
          useVenueSettings: false, bandMode: BandModeEnum.TRIPLE })
      })

      rerender(<MockedComponent />)

      expect(await screen.findByRole('button', { name: 'Same as Venue' })).toBeInTheDocument()

      expect(await screen.findByRole('combobox')).not.toBeDisabled()

      expect(await screen.findAllByTitle('Tri-band')).toHaveLength(1)
      expect(screen.queryAllByTitle('Dual-band')).toHaveLength(0)


      const selector = await screen.findByRole('combobox')

      await userEvent.click(selector)

      expect(await screen.findByRole('option', { name: 'Dual-band' })).toBeInTheDocument()

      expect(await screen.findAllByTitle('Dual-band')).toHaveLength(1)
      expect(await screen.findAllByTitle('Tri-band')).toHaveLength(2)

      await userEvent.click(screen.getByTitle('Dual-band'))

      rerender(<MockedComponent />)

      expect(await screen.findByRole('option',
        { name: 'Dual-band', selected: true })).toBeInTheDocument()

      expect(hooks.current.currentApBandModeData.bandMode).toEqual(BandModeEnum.DUAL)

      await userEvent.click(selector)

      expect(await screen.findByRole('option', { name: 'Tri-band' })).toBeInTheDocument()

      expect(await screen.findAllByTitle('Tri-band')).toHaveLength(1)
      expect(await screen.findAllByTitle('Dual-band')).toHaveLength(2)

      await userEvent.click(screen.getByTitle('Tri-band'))

      rerender(<MockedComponent />)

      expect(await screen.findByRole('option',
        { name: 'Tri-band', selected: true })).toBeInTheDocument()

      expect(hooks.current.currentApBandModeData.bandMode).toEqual(BandModeEnum.TRIPLE)
    })
  })
})
