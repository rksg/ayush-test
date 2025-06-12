import { rest } from 'msw'

import { ConfigTemplateContext, IdentityTemplateUrlsInfo, PersonaGroup, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                   from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                            from '@acx-ui/test-utils'
import { RequestPayload }                                                             from '@acx-ui/types'

import { usePersonaGroupAction } from './usePersonaGroupActions'

const spyUpdatePersonaGroup = jest.fn()
const spyUpdatePersonaGroupTemplate = jest.fn()
const spyCreatePersonaGroup = jest.fn()
const spyAssociateDpsk = jest.fn()
const spyAssociateMacRegistration = jest.fn()
const spyAssociatePolicySet = jest.fn()
const spyDissociatePolicySet = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddPersonaGroupMutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)

        setTimeout(() => {
          (req.onSuccess as Function)({ id: 'mocked_id' })
        }, 10)})
      }
    }]
  }
}))

describe('usePersonaGroupActions', () => {
  const groupId = '1da33e1f-bd7c-4b4e-9ff7-dcb4efbcec78'

  beforeEach(async () => {
    spyUpdatePersonaGroup.mockClear()
    spyUpdatePersonaGroupTemplate.mockClear()
    spyCreatePersonaGroup.mockClear()
    spyAssociateDpsk.mockClear()
    spyAssociateMacRegistration.mockClear()
    spyAssociatePolicySet.mockClear()
    spyDissociatePolicySet.mockClear()

    mockServer.use(
      rest.post(
        IdentityTemplateUrlsInfo.addIdentityGroupTemplate.url,
        (_, res, ctx) => {
          spyCreatePersonaGroup()
          return res(ctx.json({}))
        }
      ),
      rest.patch(
        IdentityTemplateUrlsInfo.updateIdentityGroupTemplate.url,
        (_, res, ctx) => {
          spyUpdatePersonaGroupTemplate()
          return res(ctx.json({}))
        }
      ),
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
      ),
      rest.put(
        PersonaUrls.associatePolicySet.url,
        (req, res, ctx) => {
          spyAssociatePolicySet()
          return res(ctx.json({}))
        }
      ),
      rest.delete(
        PersonaUrls.dissociatePolicySet.url,
        (_, res, ctx) => {
          spyDissociatePolicySet()
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

    const groupData: PersonaGroup = {
      id: '86a51b7d-1e15-4ad0-8d4a-504e08b845a2',
      name: 'groupName',
      description: 'value',
      dpskPoolId: 'bc85fdf3f4cd4869ba81f3c2e09bb8c3',
      macRegistrationPoolId: '9a385473-0c2d-4cb1-9e44-80058d65856a'
    }
    const changedData: PersonaGroup = {
      ...groupData,
      description: 'newValue',
      dpskPoolId: '97b86a354dba43f4892d449b8be62ea0',
      macRegistrationPoolId: '8cd4f603-0248-45cd-a930-d77683eccdf4'
    }

    await updatePersonaGroupMutation(groupId, groupData, changedData)

    expect(spyUpdatePersonaGroup).toBeCalled()
    expect(spyAssociateDpsk).toBeCalled()
    expect(spyAssociateMacRegistration).toBeCalled()
  })

  it('Should not trigger update api with empty changes', async () => {
    const { result } = renderHook(() => usePersonaGroupAction(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { updatePersonaGroupMutation } = result.current

    const groupData: PersonaGroup = {
      id: '86a51b7d-1e15-4ad0-8d4a-504e08b845a2',
      name: 'groupName',
      description: 'value'
    }

    await updatePersonaGroupMutation(groupId, groupData, groupData)

    expect(spyUpdatePersonaGroup).not.toHaveBeenCalled()
    expect(spyAssociateDpsk).not.toHaveBeenCalled()
    expect(spyAssociateMacRegistration).not.toHaveBeenCalled()
  })

  it('Should create persona group with policySet via multiple steps', async () => {
    const { result } = renderHook(() => usePersonaGroupAction(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { createPersonaGroupMutation } = result.current

    await createPersonaGroupMutation({
      id: groupId,
      name: 'PersonaGroup',
      policySetId: 'bc85fdf3f4cd4869ba81f3c2e09bb8c3'
    })

    await waitFor(() => expect(spyAssociatePolicySet).toBeCalled())
  })

  it('Should update persona group with policySet via multiple steps', async () => {
    const { result } = renderHook(() => usePersonaGroupAction(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { updatePersonaGroupMutation } = result.current

    const groupData: PersonaGroup = {
      id: '86a51b7d-1e15-4ad0-8d4a-504e08b845a2',
      name: 'groupName',
      description: 'value',
      dpskPoolId: 'bc85fdf3f4cd4869ba81f3c2e09bb8c3',
      macRegistrationPoolId: '9a385473-0c2d-4cb1-9e44-80058d65856a'
    }
    const changedData: PersonaGroup = {
      ...groupData,
      description: 'newValue',
      policySetId: 'abb1a52d-fd77-434c-8895-36ee9a432ad1'
    }

    await updatePersonaGroupMutation(groupId, groupData, changedData)

    expect(spyUpdatePersonaGroup).toBeCalled()
    expect(spyAssociatePolicySet).toBeCalled()
  })

  it('Should dissociate policy set via multiple steps', async () => {
    const { result } = renderHook(() => usePersonaGroupAction(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { updatePersonaGroupMutation } = result.current

    const groupData: PersonaGroup = {
      id: '86a51b7d-1e15-4ad0-8d4a-504e08b845a2',
      name: 'groupName',
      description: 'value',
      policySetId: 'abb1a52d-fd77-434c-8895-36ee9a432ad1'
    }
    const changedData: PersonaGroup = {
      ...groupData,
      policySetId: undefined
    }

    await updatePersonaGroupMutation(groupId, groupData, changedData)

    expect(spyDissociatePolicySet).toBeCalled()
  })

  it('Should create group template correctly', async () => {
    const mockCallback = jest.fn()
    const { result } = renderHook(() => usePersonaGroupAction(), {
      wrapper: ({ children }) =>
        <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <Provider children={children} />
        </ConfigTemplateContext.Provider>
    })
    const { createPersonaGroupMutation } = result.current

    await createPersonaGroupMutation({
      id: groupId,
      name: 'PersonaGroup'
    }, mockCallback)

    await waitFor(() => expect(spyCreatePersonaGroup).toBeCalled())
    expect(mockCallback).toBeCalled()
  })

  it('Should not dissociate policy set via multiple steps in Config template view', async () => {
    const { result } = renderHook(() => usePersonaGroupAction(), {
      wrapper: ({ children }) =>
        <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <Provider children={children} />
        </ConfigTemplateContext.Provider>
    })
    const { updatePersonaGroupMutation } = result.current

    const groupData: PersonaGroup = {
      id: '86a51b7d-1e15-4ad0-8d4a-504e08b845a2',
      name: 'groupName',
      description: 'value'
    }
    const changedData: PersonaGroup = {
      ...groupData,
      description: 'new description',
      policySetId: 'abb1a52d-fd77-434c-8895-36ee9a432ad1'
    }

    await updatePersonaGroupMutation(groupId, groupData, changedData)

    await waitFor(() => expect(spyUpdatePersonaGroupTemplate).toBeCalledTimes(1))
    // policy set has not supported config template, so ignore the changes
    expect(spyDissociatePolicySet).not.toBeCalled()
  })
})
