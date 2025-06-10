import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import {
  ApBandModeSettingsV1Dot1,
  ApModel,
  BandModeEnum
} from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { act, render, renderHook, screen } from '@acx-ui/test-utils'

import { ApDataContext } from '../..'
import {
  triBandApCap
} from '../../../../__tests__/fixtures'

import { ApBandManagementV1Dot1 } from './ApBandManagementV1Dot1'

const r760Cap = triBandApCap.apModels.find(cap => cap.model === 'R760') as ApModel
const t760Cap = triBandApCap.apModels.find(cap => cap.model === 'T670') as ApModel

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

  describe('ApBandManagement with T760 AP', () => {
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
        <ApDataContext.Provider value={{ apCapabilities: t760Cap }}>
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

  describe('ApBandManagement with AP and no capability data', () => {
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
        <ApDataContext.Provider value={{}}>
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
      rerender(<MockedComponent />)
    })
  })

  describe('ApBandManagement with R760 AP with AP Group', () => {
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
            apGroupBandMode={BandModeEnum.TRIPLE}
            currentApBandModeData={hooks.current.currentApBandModeData}
            setCurrentApBandModeData={hooks.current.setCurrentApBandModeData}
            apGroupData='apgroup'
          />
        </ApDataContext.Provider>
      </Provider>)

      const { rerender } = render(
        <MockedComponent />, { route: { params: { tenantId: 'tenantId' } } }
      )

      expect(await screen.findByText(/Use inherited settings from/)).toBeInTheDocument()
      expect(screen.getByText('Tri-band')).toBeInTheDocument()
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

    it('should render correctly and trigger band mode change', async () => {
      const { result: hooks } = renderHook(() => {
        const [currentApBandModeData, setCurrentApBandModeData] = useState({
          useVenueOrApGroupSettings: true,
          bandMode: BandModeEnum.TRIPLE
        } as ApBandModeSettingsV1Dot1)

        return { currentApBandModeData, setCurrentApBandModeData }
      })

      const MockedComponent = () => (
        <Provider>
          <ApDataContext.Provider value={{ apCapabilities: r760Cap }}>
            <ApBandManagementV1Dot1
              venueBandMode={BandModeEnum.DUAL}
              apGroupBandMode={BandModeEnum.DUAL}
              currentApBandModeData={hooks.current.currentApBandModeData}
              setCurrentApBandModeData={hooks.current.setCurrentApBandModeData}
              apGroupData=''
            />
          </ApDataContext.Provider>
        </Provider>
      )

      const { rerender } = render(
        <MockedComponent />,
        { route: { params: { tenantId: 'tenantId' } } }
      )

      expect(await screen.findByText(/Use inherited settings from/)).toBeInTheDocument()
      expect(screen.getByText('Dual-band')).toBeInTheDocument()
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

      await userEvent.click(screen.getByLabelText('Customize settings'))
      rerender(<MockedComponent />)

      expect(await screen.findByRole('combobox')).not.toBeDisabled()

      expect(await screen.findAllByTitle('Tri-band')).toHaveLength(1)
      expect(screen.queryAllByTitle('Dual-band')).toHaveLength(0)

      expect(hooks.current.currentApBandModeData.useVenueOrApGroupSettings).toEqual(false)

      rerender(<MockedComponent />)

      await act(async () => {
        hooks.current.setCurrentApBandModeData({
          useVenueOrApGroupSettings: false, bandMode: BandModeEnum.TRIPLE })
      })

      rerender(<MockedComponent />)

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
