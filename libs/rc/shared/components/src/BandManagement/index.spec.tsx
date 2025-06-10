import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { IntlProvider }   from 'react-intl'

import { BandModeEnum, ApModelBandModeSettings } from '@acx-ui/rc/utils'

import { BandManagement } from '.'



const renderWithIntl = (ui: React.ReactElement) =>
  render(
    <IntlProvider locale='en' messages={{}}>
      {ui}
    </IntlProvider>
  )

describe('BandManagement', () => {
  const triBandApModels = ['ModelA', 'ModelB']
  const dual5gApModels = ['ModelA']
  const bandModeCaps = {
    ModelA: [BandModeEnum.DUAL, BandModeEnum.TRIPLE],
    ModelB: [BandModeEnum.TRIPLE]
  }
  const existingTriBandApModels = ['ModelB']
  const currentBandModeData: ApModelBandModeSettings[] = [
    { model: 'ModelB', bandMode: BandModeEnum.TRIPLE }
  ]
  const setCurrentBandModeData = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders table and add button', () => {
    renderWithIntl(
      <BandManagement
        triBandApModels={triBandApModels}
        dual5gApModels={dual5gApModels}
        bandModeCaps={bandModeCaps}
        existingTriBandApModels={existingTriBandApModels}
        currentBandModeData={currentBandModeData}
        setCurrentBandModeData={setCurrentBandModeData}
      />
    )
    expect(screen.getByText('Wi-Fi 6/7 band management:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add model/i })).toBeInTheDocument()
    expect(screen.getByText('ModelB')).toBeInTheDocument()
  })


  it('removes model from table when delete is clicked', async () => {
    renderWithIntl(
      <BandManagement
        triBandApModels={triBandApModels}
        dual5gApModels={dual5gApModels}
        bandModeCaps={bandModeCaps}
        existingTriBandApModels={[]} // allow delete
        currentBandModeData={currentBandModeData}
        setCurrentBandModeData={setCurrentBandModeData}
      />
    )

    const deleteBtn = screen.getByRole('deleteBtn')
    expect(deleteBtn).not.toBeDisabled()
    await userEvent.click(deleteBtn)
    expect(setCurrentBandModeData).toHaveBeenCalled()
  })
})