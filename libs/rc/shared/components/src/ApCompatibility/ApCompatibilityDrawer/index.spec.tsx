import { render, screen } from '@testing-library/react'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }               from '@acx-ui/store'

import { ApCompatibilityType } from '../constants'

import { ApCompatibilityDrawer } from '.'

const mockedCloseDrawer = jest.fn()

jest.mock('./ApModelCompatibilityDrawer', () => ({
  ApModelCompatibilityDrawer: () => <div data-testid='new-drawer' />
}))

jest.mock('./OldApCompatibilityDrawer', () => ({
  OldApCompatibilityDrawer: () => <div data-testid='old-drawer' />
}))

describe('ApCompatibilityDrawer', () => {

  it('should render the OldApCompatibilityDrawer correctly', async () => {
    render(
      <Provider>
        <ApCompatibilityDrawer
          visible={true}
          type={ApCompatibilityType.VENUE}
          onClose={mockedCloseDrawer}
        />
      </Provider>
    )

    expect(await screen.findByTestId('old-drawer')).toBeInTheDocument()
  })

  it('should render the ApModelCompatibilityDrawer correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_COMPATIBILITY_BY_MODEL)
    render(
      <Provider>
        <ApCompatibilityDrawer
          visible={true}
          type={ApCompatibilityType.VENUE}
          onClose={mockedCloseDrawer}
        />
      </Provider>
    )

    expect(await screen.findByTestId('new-drawer')).toBeInTheDocument()
  })

})