import { useEffect, useRef, useState } from 'react'

import userEvent from '@testing-library/user-event'

import {
  serviceGuardApi as api,
  serviceGuardApiURL as apiUrl,
  Provider,
  store
} from '@acx-ui/store'
import { render, mockGraphqlQuery, screen, waitFor } from '@acx-ui/test-utils'

import * as fixtures      from '../__tests__/fixtures'
import { messageMapping } from '../contents'

import {
  ServiceGuardSpecGuard,
  ServiceGuardTestGuard,
  showAlertAndNavigateAway
} from '.'

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigateToPath: () => mockedNavigate
}))

beforeEach(() => {
  store.dispatch(api.util.resetApiState())
  mockedNavigate.mockClear()
})

describe('ServiceGuardSpecGuard', () => {
  it('renders empty if param not having specId', async () => {
    const { container } = render(<ServiceGuardSpecGuard
      children={<div data-testid='contents' />}
    />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })

    // eslint-disable-next-line testing-library/no-node-access
    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it('renders children if specId exists and record exists', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardSpec', { data: fixtures.fetchServiceGuardSpec })

    render(<ServiceGuardSpecGuard
      children={<div data-testid='contents' />}
    />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', specId: 'spec-id' } }
    })

    expect(await screen.findByTestId('contents')).toBeVisible()
  })

  it('navigate to listing & show error toast if record not exists', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardSpec', { data: null })

    render(<ServiceGuardSpecGuard
      children={<div data-testid='contents' />}
    />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', specId: 'spec-id' } }
    })

    expect(await screen.findByRole('generic', {
      name: (_, el) => el.classList.contains('ant-message')
    })).toBeVisible()

    await waitFor(() => expect(mockedNavigate).toBeCalledTimes(1))
  })
})

describe('ServiceGuardTestGuard', () => {
  it('renders empty if param not having testId', async () => {
    const { container } = render(<ServiceGuardTestGuard
      children={<div data-testid='contents' />}
    />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })

    // eslint-disable-next-line testing-library/no-node-access
    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it('renders children if testId exists and record exists', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardTest', { data: fixtures.fetchServiceGuardTest })

    render(<ServiceGuardTestGuard
      children={<div data-testid='contents' />}
    />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: 'test-id' } }
    })

    expect(await screen.findByTestId('contents')).toBeVisible()
  })

  it('navigate to listing & show error toast if record not exists', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
    render(<ServiceGuardTestGuard
      children={<div data-testid='contents' />}
    />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: 'test-id' } }
    })

    expect(await screen.findByRole('generic', {
      name: (_, el) => el.classList.contains('ant-message')
    })).toBeVisible()

    await waitFor(() => expect(mockedNavigate).toBeCalledTimes(1))
  })
})

describe('showAlertAndNavigateAway', () => {
  it('ensure showing toast once only', async () => {
    const mock = jest.fn()
    const Component = () => {
      const showed = useRef(false)
      const [flag, setFlag] = useState(false)
      const [done, setDone] = useState(false)

      useEffect(() => {
        showAlertAndNavigateAway(mock, showed, messageMapping.SPEC_NOT_FOUND)
        if (showed.current && flag) setDone(true)
      }, [flag])

      return <>
        {done ? <h1>OK</h1> : null}
        <button onClick={() => setFlag(true)}>Trigger</button>
      </>
    }

    render(<Component />)

    await waitFor(() => expect(mock).toBeCalled())

    await userEvent.click(await screen.findByRole('button', { name: 'Trigger' }))

    expect(await screen.findByRole('heading', { name: 'OK' })).toBeVisible()
    expect(mock).toBeCalledTimes(1)
  })
})
