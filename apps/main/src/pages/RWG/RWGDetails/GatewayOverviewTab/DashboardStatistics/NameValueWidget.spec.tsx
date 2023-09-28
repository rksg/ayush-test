import '@testing-library/jest-dom'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import NameValueWidget from './NameValueWidget'

describe('RWG NameValueWidget', () => {

  it('test NameValueWidget', async () => {

    await render(<Provider><NameValueWidget
      name='CPU'
      value={12}
      unit='MB' /> </Provider>)

    expect(await screen.findByText('CPU')).toBeInTheDocument()
    expect(await screen.findByText(12)).toBeInTheDocument()
    expect(await screen.findByText('MB')).toBeInTheDocument()

  })

})
