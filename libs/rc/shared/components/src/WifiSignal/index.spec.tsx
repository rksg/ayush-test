import '@testing-library/jest-dom'
import { render }       from '@testing-library/react'
import { IntlProvider } from 'react-intl'

import { WifiSignal } from '.'

describe('WifiSignal', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <IntlProvider locale='en'>
        <WifiSignal snr={49} text='49 dB' />
        <WifiSignal snr={35} text='35 dB' />
        <WifiSignal snr={20} text='20 dB' />
        <WifiSignal snr={14} text='14 dB' showText={false} />
        <WifiSignal snr={2} text='' />
      </IntlProvider>)
    expect(asFragment()).toMatchSnapshot()
  })
})