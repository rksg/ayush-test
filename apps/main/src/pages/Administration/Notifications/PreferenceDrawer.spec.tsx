/* eslint-disable max-len */
import React from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo } from '@acx-ui/msp/utils'
import { Provider }    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { PreferenceDrawer } from './PreferenceDrawer'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
}
const mockedSetVisible = jest.fn()
const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))

describe('Preference drawer creation mode', () => {
  beforeEach(async () => {
    jest.spyOn(services, 'useUpdateMspAggregationsMutation')
    mockServer.use(
      rest.put(
        MspUrlsInfo.updateMspAggregations.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
  })
  it('should render correctly for aggregations false', async () => {
    const aggregations = {
      aggregation: false,
      ecExclusionEnabled: true
    }
    services.useGetMspAggregationsQuery = jest.fn().mockImplementation(() => {
      return { data: aggregations }
    })
    render(
      <Provider>
        <PreferenceDrawer
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Notification Preference')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible()

    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.queryByRole('switch')).toBeNull()
  })
  it('should render correctly for aggregations true', async () => {
    const aggregations = {
      aggregation: true,
      ecExclusionEnabled: true
    }
    services.useGetMspAggregationsQuery = jest.fn().mockImplementation(() => {
      return { data: aggregations }
    })
    render(
      <Provider>
        <PreferenceDrawer
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Notification Preference')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible()

    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByRole('switch')).toBeChecked()
  })
  it('should render correctly for exclusion disabled', async () => {
    const aggregations = {
      aggregation: true,
      ecExclusionEnabled: false
    }
    services.useGetMspAggregationsQuery = jest.fn().mockImplementation(() => {
      return { data: aggregations }
    })
    render(
      <Provider>
        <PreferenceDrawer
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Notification Preference')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible()

    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByRole('switch')).not.toBeChecked()
  })
  it('cancel should close window', async () => {
    const aggregations = {
      aggregation: true,
      ecExclusionEnabled: true
    }
    services.useGetMspAggregationsQuery = jest.fn().mockImplementation(() => {
      return { data: aggregations }
    })
    render(
      <Provider>
        <PreferenceDrawer
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Notification Preference')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
  it('should save correctly', async () => {
    const aggregations = {
      aggregation: true,
      ecExclusionEnabled: true
    }
    services.useGetMspAggregationsQuery = jest.fn().mockImplementation(() => {
      return { data: aggregations }
    })
    render(
      <Provider>
        <PreferenceDrawer
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByRole('checkbox')).toBeVisible()
    expect(screen.getByRole('switch')).toBeVisible()

    await userEvent.click(screen.getByRole('switch'))
    await userEvent.click(screen.getByRole('checkbox'))

    expect(screen.queryByRole('switch')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useUpdateMspAggregationsMutation).toHaveLastReturnedWith(value)
    })
    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
})