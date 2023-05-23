import userEvent from '@testing-library/user-event'

import {
  videoCallQoeApi as api,
  store
} from '@acx-ui/store'
import { screen } from '@acx-ui/test-utils'

import { renderForm } from '../../../ServiceGuard/__tests__/fixtures'

import { TestLink } from './TestLink'

const { click } = userEvent
Object.assign(navigator, {
  clipboard: {
    writeText: () => { }
  }
})
const link = 'https://zoom.us/121345'

describe('TestLink', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render the link', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')
    renderForm(<TestLink link={link} />)
    expect(await screen.findByRole('link')).toHaveTextContent(link)
  })

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should copy the link', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')
    renderForm(<TestLink link={link} />)

    expect(screen.getByRole('button',{
      name: /copy link/i
    })).toHaveTextContent('Copy Link')

    await click(screen.getByRole('button',{
      name: /copy link/i
    }))

    expect(screen.getByRole('button',{
      name: /Copied/i
    })).toHaveTextContent('Copied')
  })
})