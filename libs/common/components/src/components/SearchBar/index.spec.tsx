import { screen, render, fireEvent } from '@acx-ui/test-utils'

import { SearchBar } from '.'

jest.mock('@acx-ui/icons', ()=> ({
  SearchOutlined: () => <div data-testid='search-icon'/>
}), { virtual: true })

describe('SearchBar', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<SearchBar onChange={jest.fn()}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should trigger corresponding functions when onChange', async () => {
    const onChange = jest.fn()
    const expectedValue = 'new value'
    render(<SearchBar onChange={onChange}/>)
    const component = await screen.findByPlaceholderText('Search for...')
    fireEvent.change(component, { target: { value: expectedValue } })
    expect(onChange).toBeCalledTimes(1)
    expect(onChange).toBeCalledWith(expectedValue)
  })
})
