import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { LbsServerConnectionProtocolInfo } from './LbsServerConnectionProtocolInfo'

describe('LbsServerConnectionProtocolInfo', () => {

  it('should render info message correct', async () => {
    render(<LbsServerConnectionProtocolInfo />)

    expect(
      await screen.findAllByText('TLS 1.2')).toHaveLength(1)
    const tip = screen.getByTestId('QuestionMarkCircleOutlined')
    fireEvent.mouseOver(tip)
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent(
        // eslint-disable-next-line max-len
        'This server uses Transport Layer Security (TLS) version 1.2 to ensure secure and encrypted communication.')
  })
})