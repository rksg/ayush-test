import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { IntlProvider }   from 'react-intl'

import { BandModeEnum } from '@acx-ui/rc/utils'

import { BandManagementDrawer } from './BandManagementDrawer'


const renderWithIntl = (ui: React.ReactElement) =>
  render(
    <IntlProvider locale='en' messages={{}}>
      {ui}
    </IntlProvider>
  )

describe('BandManagementDrawer', () => {
  const triBandApModels = ['ModelA', 'ModelB']
  const dual5gApModels = ['ModelA']
  const bandModeCaps = {
    ModelA: [BandModeEnum.DUAL, BandModeEnum.TRIPLE],
    ModelB: [BandModeEnum.TRIPLE]
  }
  const tableDataModels = ['ModelB']
  const onAddOrEdit = jest.fn()
  const setVisible = jest.fn()

  it('renders drawer and form fields', () => {
    renderWithIntl(
      <BandManagementDrawer
        visible={true}
        setVisible={setVisible}
        onAddOrEdit={onAddOrEdit}
        initialData={undefined}
        tableDataModels={tableDataModels}
        triBandApModels={triBandApModels}
        dual5gApModels={dual5gApModels}
        bandModeCaps={bandModeCaps}
      />
    )
    expect(screen.getByText('Wi-Fi Band Management')).toBeInTheDocument()
    expect(screen.getByLabelText('Model')).toBeInTheDocument()
  })

  it('closes on cancel', async () => {
    renderWithIntl(
      <BandManagementDrawer
        visible={true}
        setVisible={setVisible}
        onAddOrEdit={onAddOrEdit}
        initialData={undefined}
        tableDataModels={[]}
        triBandApModels={triBandApModels}
        dual5gApModels={dual5gApModels}
        bandModeCaps={bandModeCaps}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })
})