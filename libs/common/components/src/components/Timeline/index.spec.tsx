import { fireEvent, render, screen } from '@testing-library/react'
import { IntlProvider }              from 'react-intl'

import { sample, sampleFail } from './stories'

import { Timeline } from '.'

describe('Timeline', () => {
  it('should render', async () => {
    const { asFragment } = render(<IntlProvider locale='en'>
      <Timeline items={sample}/>
    </IntlProvider>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle when expand', async () => {
    render(<IntlProvider locale='en'><Timeline items={sample}/></IntlProvider>)
    fireEvent.click((await screen.findAllByTestId('PlusSquareSolid'))[0])
    await screen.findByTestId('MinusSquareSolid')
    await screen.findAllByText('More fail content')
  })
  it('should remove startTime for in progress activities if not in current stage', async () => {
    render(<IntlProvider locale='en'><Timeline items={sampleFail}/></IntlProvider>)
    const firstStartTime = screen.getByText(/12\/20\/2022 08:02:00/i)
    const secondStartTime = screen.queryAllByText(/12\/20\/2022 08:03:00/i)
    expect(firstStartTime).toBeVisible()
    expect(secondStartTime).toEqual([])
  })
})
