import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RadiusAttributeGroupUrlsInfo
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { mockedTenantId } from '../../../../Services/MdnsProxy/MdnsProxyForm/__tests__/fixtures'

import {
  attributeGroup,
  attributeGroupReturnByQuery,
  attributeList,
  groupList,
  vendorList
} from './__tests__/fixtures'
import RadiusAttributeGroupForm from './RadiusAttributeGroupForm'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

describe('RadiusAttributeGroupForm', () => {
  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.CREATE })
  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.EDIT })

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url,
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeVendors.url,
        (req, res, ctx) => res(ctx.json(vendorList))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributesWithQuery.url,
        (req, res, ctx) => res(ctx.json(attributeList))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.createAttributeGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery.url,
        (req, res, ctx) => res(ctx.json(attributeGroupReturnByQuery))
      )
    )
  })

  it('should create group successfully', async () => {
    mockServer.use(
      rest.post(
        RadiusAttributeGroupUrlsInfo.createAttributeGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider>
        <RadiusAttributeGroupForm/>
      </Provider>,
      {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )
    await userEvent.type(await screen.findByRole('textbox', { name: 'Policy Name' }), 'testGroup')

    await userEvent.click(screen.getByText('Add'))
    await screen.findByText('Add RADIUS Attribute')

    const inputs = await screen.findAllByRole('textbox')
    const attributeValue = inputs[2]
    await userEvent.type(attributeValue, 'testValue')

    const comboBoxes = await screen.findAllByRole('combobox')
    await userEvent.click(comboBoxes[0])

    const treeNodes = await screen.findAllByRole('img')
    await userEvent.click(treeNodes[1])

    await waitForElementToBeRemoved(await screen.findByRole('img', { name: 'loading' }))

    await userEvent.click(await screen.findByText('Foundry-Privilege-Level'))

    const buttons = screen.getAllByText('Add')
    await userEvent.click(buttons[1])

    await screen.findByRole('row', { name: /Foundry-Privilege-Level/ })

    await userEvent.click(screen.getByText('Apply'))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })

  it('should edit group successfully', async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroup.url,
        (req, res, ctx) => res(ctx.json(attributeGroup))
      ),
      rest.patch(
        RadiusAttributeGroupUrlsInfo.updateAttributeGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider>
        <RadiusAttributeGroupForm editMode={true}/>
      </Provider>,
      {
        route: { params: { tenantId: 'tenant-id', policyId: '373377b0cb6e46ea8982b1c80aabe1fa1' },
          path: editPath }
      }
    )

    await screen.findByRole('heading', { level: 1, name: 'Configure ' + attributeGroup.name })

    await waitFor(async () => {
      expect(screen.getByLabelText(/policy name/i)).toHaveValue(attributeGroup.name)
    })

    const row = await screen.findByRole('row', { name: /Annex-CLI-Filter/ })
    fireEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/i }))
    await screen.findByText('Edit RADIUS Attribute')

    const inputs = await screen.findAllByRole('textbox')
    const attributeValue = inputs[2]
    await userEvent.type(attributeValue, 'testValue')

    await userEvent.click(await screen.findByText('Done'))

    const row1 = await screen.findByRole('row', { name: /Annex-CLI-Command/ })
    fireEvent.click(within(row1).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/i }))
    // fireEvent.click(await screen.findByText('Delete Attribute'))

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })

  it('should navigate to the Select service page when clicking Cancel button', async () => {
    const { result: selectPath } = renderHook(() => {
      // eslint-disable-next-line max-len
      return useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST }))
    })

    render(
      <Provider>
        <RadiusAttributeGroupForm />
      </Provider>, {
        route: { params: { tenantId: 'tenant-id', policyId: '373377b0cb6e46ea8982b1c80aabe1fa1' },
          path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith(selectPath.current)
  })
})
