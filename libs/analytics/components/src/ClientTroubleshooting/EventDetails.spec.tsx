import { render, fireEvent, screen } from '@acx-ui/test-utils'

import { Details } from './EventDetails'

describe('EventDetails', () => {

  const fields = [
    { label: 'label1', value: 'value1' },
    { label: 'label2', value: 'value2' }
  ]


  const handleClose = jest.fn()

  it('renders Details correctly', () => {
    const { asFragment } = render(<Details fields={fields} openHandler={handleClose}/>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders closes Details correctly', async () => {
    render(<Details fields={fields} openHandler={handleClose}/>)
    fireEvent.click(await screen.findByTestId('CloseSymbol'))
    expect(handleClose).toBeCalledTimes(1)
  })
})