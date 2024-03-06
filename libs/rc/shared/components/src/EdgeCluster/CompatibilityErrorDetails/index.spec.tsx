import userEvent      from '@testing-library/user-event'
import { Typography } from 'antd'

import {
  render,
  screen
} from '@acx-ui/test-utils'

import { errorDetails } from '../__tests__/fixtures'

import { InterfaceCompatibilityError, SingleNodeDetailsField } from './types'

import { CompatibilityErrorDetails } from './'

const mockedSetVisible = jest.fn()
const mockedRenderFn = jest.fn().mockReturnValue(null)
const errorDetailFields: SingleNodeDetailsField<InterfaceCompatibilityError>[] = [{
  key: 'lags',
  title: 'Number of LAGs',
  render: (data) =>
    <Typography.Text type='danger' children={data.interfaces}/>
}, {
  key: 'portTypes',
  title: 'Port Types',
  render: () => {
    return mockedRenderFn()
  }
}, {
  key: 'other',
  title: 'Other Field',
  render: (data) =>
    <Typography.Text children={data.corePorts}/>
}]

describe('EdgeCluster CompatibilityErrorDetails', () => {
  beforeEach(() => {
    mockedRenderFn.mockReset()
  })

  it('should correctly display', async () => {
    render(
      <CompatibilityErrorDetails
        visible={true}
        setVisible={mockedSetVisible}
        fields={errorDetailFields}
        data={errorDetails}
      />)

    errorDetails.forEach(item => {
      screen.getByText(item.nodeName)
    })

    expect(mockedRenderFn).toBeCalledTimes(errorDetails.length)
    const lags = screen.getAllByText('Number of LAGs')
    expect(lags.length).toBe(2)
    lags.forEach(ele => {
      expect(ele).toBeVisible()
    })
    expect(screen.getAllByText('Port Types').length).toBe(2)
    // should render custom field
    expect(screen.getAllByText('Other Field').length).toBe(2)
  })

  it('should display nothing when data is empty array', async () => {
    render(
      <CompatibilityErrorDetails
        visible={true}
        setVisible={mockedSetVisible}
        fields={errorDetailFields}
        data={[]}
      />)

    expect(mockedRenderFn).toBeCalledTimes(0)
    expect(screen.queryAllByText('Number of LAGs').length).toBe(0)
  })

  it('should correctly close', async () => {
    render(
      <CompatibilityErrorDetails
        visible={true}
        setVisible={mockedSetVisible}
        fields={errorDetailFields}
        data={errorDetails}
      />)

    errorDetails.forEach(item => {
      screen.getByText(item.nodeName)
    })
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedSetVisible).toBeCalledWith(false)
  })
})