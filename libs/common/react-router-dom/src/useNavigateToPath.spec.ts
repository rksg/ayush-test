import { useNavigateToPath } from './useNavigateToPath'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', ()=> ({
  useNavigate: () => mockNavigate
}))

jest.mock('./useTenantLink', ()=> ({
  useTenantLink: () => ({ pathname: '/some/path/' })
}))

describe('useNavigateToPath', () => {
  it('should navigate to the given path', async () => {
    const handler = useNavigateToPath('/some/path/')
    handler()
    expect(mockNavigate).toBeCalledWith({ pathname: '/some/path/' })
  })
})
