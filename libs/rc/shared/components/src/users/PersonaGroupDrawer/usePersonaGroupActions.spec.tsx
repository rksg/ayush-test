import { rest } from 'msw'

import { PersonaUrls }                     from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'
import { RequestPayload }                  from '@acx-ui/types'

import { usePersonaGroupAction } from './usePersonaGroupActions'

const spyUpdatePersonaGroup = jest.fn()
const spyCreatePersonaGroup = jest.fn()
const spyAssociateDpsk = jest.fn()
const spyAssociateMacRegistration = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddPersonaGroupMutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)

        setTimeout(() => {
          (req.callback as Function)({ id: 'mocked_id' })
        }, 100)})
      }
    }]
  }
}))

describe('usePersonaGroupActions', () => {
  const groupId = '1da33e1f-bd7c-4b4e-9ff7-dcb4efbcec78'

  beforeEach(async () => {
    spyUpdatePersonaGroup.mockClear()
    spyCreatePersonaGroup.mockClear()
    spyAssociateDpsk.mockClear()
    spyAssociateMacRegistration.mockClear()

    mockServer.use(
      rest.patch(
        PersonaUrls.updatePersonaGroup.url,
        (req, res, ctx) => {
          spyUpdatePersonaGroup()
          return res(ctx.json({}))
        }
      ),
      rest.put(
        PersonaUrls.associateDpskPool.url,
        (req, res, ctx) => {
          spyAssociateDpsk()
          return res(ctx.json({}))
        }
      ),
      rest.put(
        PersonaUrls.associateMacRegistration.url,
        (req, res, ctx) => {
          spyAssociateMacRegistration()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('Should create persona group with dpsk and macRegistration via multiple steps', async () => {
    const { result } = renderHook(() => usePersonaGroupAction(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { createPersonaGroupMutation } = result.current

    await createPersonaGroupMutation({
      id: groupId,
      name: 'PersonaGroup',
      dpskPoolId: 'bc85fdf3f4cd4869ba81f3c2e09bb8c3',
      macRegistrationPoolId: '9a385473-0c2d-4cb1-9e44-80058d65856a'
    })

    await waitFor(() => expect(spyAssociateDpsk).toBeCalled())
    await waitFor(() => expect(spyAssociateMacRegistration).toBeCalled())
  })

  it('Should update persona group, dpsk, macRegistration via multiple steps', async () => {
    const { result } = renderHook(() => usePersonaGroupAction(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { updatePersonaGroupMutation } = result.current

    await updatePersonaGroupMutation(groupId, {
      description: 'changeValue',
      dpskPoolId: 'bc85fdf3f4cd4869ba81f3c2e09bb8c3',
      macRegistrationPoolId: '9a385473-0c2d-4cb1-9e44-80058d65856a'
    })

    expect(spyUpdatePersonaGroup).toBeCalled()
    expect(spyAssociateDpsk).toBeCalled()
    expect(spyAssociateMacRegistration).toBeCalled()
  })

  it('Should not trigger update api with empty changes', async () => {
    const { result } = renderHook(() => usePersonaGroupAction(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { updatePersonaGroupMutation } = result.current

    await updatePersonaGroupMutation(groupId, {})

    expect(spyUpdatePersonaGroup).not.toHaveBeenCalled()
    expect(spyAssociateDpsk).not.toHaveBeenCalled()
    expect(spyAssociateMacRegistration).not.toHaveBeenCalled()
  })
})
