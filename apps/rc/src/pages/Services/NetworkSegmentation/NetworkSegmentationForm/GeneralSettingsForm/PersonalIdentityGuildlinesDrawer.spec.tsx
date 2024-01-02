import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'


import { PersonalIdentityGuildlinesDrawer } from './PersonalIdentityGuildlinesDrawer'


jest.mock('./PersonalIdentityDiagram', () => ({
  PersonalIdentityDiagram: () => <div data-testid='PersonalIdentityDiagram' />
}))

it('Should render PersonalIdentityGuildlinesDrawer successfully', async () => {
  render(
    <Provider>
      <PersonalIdentityGuildlinesDrawer open={true}>
      </PersonalIdentityGuildlinesDrawer>
    </Provider>)

  expect(await screen.findByText('Get prepared for Personal Identity Network:')).toBeVisible()
  expect(await screen.findByTestId('PersonalIdentityDiagram')).toBeVisible()
})