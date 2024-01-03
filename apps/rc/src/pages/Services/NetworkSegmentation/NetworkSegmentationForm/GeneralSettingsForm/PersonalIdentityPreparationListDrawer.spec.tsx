import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'


import { PersonalIdentityPreparationListDrawer } from './PersonalIdentityPreparationListDrawer'


jest.mock('./PersonalIdentityDiagram', () => ({
  PersonalIdentityDiagram: () => <div data-testid='PersonalIdentityDiagram' />
}))

it('Should render PersonalIdentityPreparationListDrawer successfully', async () => {
  render(
    <Provider>
      <PersonalIdentityPreparationListDrawer open={true}>
      </PersonalIdentityPreparationListDrawer>
    </Provider>)

  expect(await screen.findByText('Get prepared for Personal Identity Network:')).toBeVisible()
  expect(await screen.findByTestId('PersonalIdentityDiagram')).toBeVisible()
})