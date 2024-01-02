import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'


import { PersonalIdentityDrawer } from './PersonalIdentityDrawer'


jest.mock('./PersonalIdentityDiagram', () => ({
  PersonalIdentityDiagram: () => <div data-testid='PersonalIdentityDiagram' />
}))

it('Should render PersonalIdentityDrawer successfully', async () => {
  render(
    <Provider>
      <PersonalIdentityDrawer open={true}>
      </PersonalIdentityDrawer>
    </Provider>)

  expect(await screen.findByText('Get prepared for Network Segmentation:')).toBeVisible()
  expect(await screen.findByTestId('PersonalIdentityDiagram')).toBeVisible()
})