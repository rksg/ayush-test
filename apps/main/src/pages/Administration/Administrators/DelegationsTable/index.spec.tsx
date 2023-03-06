/* eslint-disable max-len */

import { UserProfile } from '@acx-ui/user'
import { Provider }    from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { fakeUserProfile } from '../__tests__/fixtures'

import AdminDelegationsTable from './index'

jest.mock('./AdministrationDelegationsTable', () => ({
  ...jest.requireActual('./AdministrationDelegationsTable'),
  AdministrationDelegationsTable: () => {
    return <div data-testid='mocked-AdministrationDelegationsTable'></div>
  }
}))
jest.mock('./MSPAdministratorsTable', () => ({
  ...jest.requireActual('./MSPAdministratorsTable'),
  MSPAdministratorsTable: () => {
    return <div data-testid='mocked-MSPAdministratorsTable'></div>
  }
}))
describe('Administrators delegation tablef', () => {

  it('should user is not MSP EC correctly render', async () => {
    render(
      <Provider>
        <AdminDelegationsTable
          isMspEc={false}
          userProfileData={fakeUserProfile as UserProfile}
        />
      </Provider>)

    await screen.findByTestId('mocked-AdministrationDelegationsTable')
  })

  it('should user is MSP EC correctly render', async () => {
    render(
      <Provider>
        <AdminDelegationsTable
          isMspEc={true}
          userProfileData={fakeUserProfile as UserProfile}
        />
      </Provider>)

    await screen.findByTestId('mocked-MSPAdministratorsTable')
  })
})
