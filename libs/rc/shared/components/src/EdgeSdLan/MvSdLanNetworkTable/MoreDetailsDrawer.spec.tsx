import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { MoreDetailsDrawer } from '.'

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('EdgeMvSdLanActivatedNetworksTable MoreDetailsDrawer', () => {
  it('should render correctly', async () => {
    const mockedSetVisible = jest.fn()
    render(<MoreDetailsDrawer
      visible={true}
      setVisible={mockedSetVisible}
    />)

    await screen.findByText('Forward Guest Traffic to DMZ')
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('EdgeSdLanForwardGuestTraffic')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockedSetVisible).toBeCalledWith(false)
  })
})