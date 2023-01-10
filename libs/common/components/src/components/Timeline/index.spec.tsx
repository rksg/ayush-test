import { fireEvent, render, screen } from '@testing-library/react'
import { IntlProvider }              from 'react-intl'

import { sample } from './stories'

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
    await screen.findAllByText('More content')
  })
})