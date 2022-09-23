import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import userEvent               from '@testing-library/user-event'
import { MemoryRouter }        from 'react-router-dom'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { AnchorLayout } from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const items = [{
  title: 'Anchor 1',
  content: 'Content 1'
}, {
  title: 'Anchor 2',
  content: 'Content 2'
}, {
  title: 'Anchor 3',
  content: 'Content 3'
}]

describe('Anchor', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <BrowserRouter><AnchorLayout items={items} /></BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(screen.getByText('Anchor 2'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/',
      hash: 'Anchor-2'
    })
  })

  it('should scroll to anchor correctly', async () => {
    jest.useFakeTimers()
    render(
      <MemoryRouter initialEntries={[{
        pathname: '/',
        hash: 'Anchor-3'
      }]}>
        <AnchorLayout items={items} />
      </MemoryRouter>
    )
    act(() => {
      jest.runAllTimers() // trigger setTimeout
    })
    expect(await screen.findByText('Content 3')).toBeVisible()
  })
})

