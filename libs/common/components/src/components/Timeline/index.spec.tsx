import { fireEvent, render, screen } from '@testing-library/react'
import { IntlProvider }              from 'react-intl'

import { sample } from './stories'

import { Timeline } from '.'

describe('Timeline', () => {
  it('should render', async () => {
    const { asFragment } = render(<IntlProvider locale='en'>
      <Timeline items={sample} status={'INPROGRESS'}/>
    </IntlProvider>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle when expand', async () => {
    render(<IntlProvider locale='en'><Timeline items={sample} status={'FAIL'}/></IntlProvider>)
    fireEvent.click((await screen.findAllByTestId('PlusSquareSolid'))[0])
    await screen.findByTestId('MinusSquareSolid')
    await screen.findAllByText('More fail content')
    const firstStartTime = screen.getByText(/12\/20\/2022 08:02:00/i)
    const secondStartTime = screen.queryAllByText(/12\/20\/2022 08:03:00/i)
    expect(firstStartTime).toBeVisible()
    expect(secondStartTime).toEqual([])
  })
})
