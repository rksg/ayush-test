import userEvent      from '@testing-library/user-event'
import { Typography } from 'antd'

import {
  render,
  screen
} from '@acx-ui/test-utils'

import { errorDetails }                                                                from '../__tests__/fixtures'
import { CompatibilityNodeError, InterfaceCompatibilityError, SingleNodeDetailsField } from '../CompatibilityErrorDetails/types'

import { CompatibilityStatusBar, CompatibilityStatusEnum } from './'

const errorDetailFields = [{
  key: 'ports',
  title: 'Number of Ports',
  render: (data: InterfaceCompatibilityError) =>
    <Typography.Text type='danger' children={data.interfaces}/>
}, {
  key: 'portTypes',
  title: 'Port Types',
  render: () => {
    return 1
  }
}, {
  key: 'other',
  title: 'Other Field',
  render: (data: InterfaceCompatibilityError) =>
    <Typography.Text children={data.corePorts}/>
}] as SingleNodeDetailsField[]


jest.mock('../CompatibilityErrorDetails', () => ({
  ...jest.requireActual('../CompatibilityErrorDetails'),
  CompatibilityErrorDetails: (props:
    { visible: boolean, fields: SingleNodeDetailsField[], data: CompatibilityNodeError[] }) =>
    props.visible && <div data-testid='rc-CompatibilityErrorDetails'>
      {'Fields:' + JSON.stringify(props.fields)}
      {'Data:' + JSON.stringify(props.data)}
    </div>
}))

describe('EdgeCluster CompatibilityStatusBar', () => {

  it('should display pass style', async () => {
    render(
      <CompatibilityStatusBar
        type={CompatibilityStatusEnum.PASS}
        fields={errorDetailFields}
      />)

    expect(screen.queryByText('Mismatch')).toBeNull()
    expect(screen.queryByRole('button', { name: 'See details' })).toBeNull()
    expect(screen.queryByText('Pass')).toBeValid()
    expect(screen.queryByTestId('CheckMarkCircleSolid')).toBeValid()
  })

  it('should be ok with undefined errors', async () => {
    render(
      <CompatibilityStatusBar
        type={CompatibilityStatusEnum.FAIL}
        fields={errorDetailFields}
      />)

    expect(screen.queryByTestId('FailedSolid')).toBeValid()
    const detailbtn = screen.queryByRole('button', { name: 'See details' })
    expect(detailbtn).toBeValid()
    await userEvent.click(detailbtn!)
    const detailDiv = screen.queryByTestId('rc-CompatibilityErrorDetails')
    expect(detailDiv).toHaveTextContent(/Data:\[\]/)
  })

  it('should display error style', async () => {
    render(
      <CompatibilityStatusBar
        type={CompatibilityStatusEnum.FAIL}
        fields={errorDetailFields}
        errors={errorDetails}
      />)

    expect(screen.queryByText('Pass')).toBeNull()
    expect(screen.queryByText('Mismatch')).toBeValid()
    expect(screen.queryByTestId('FailedSolid')).toBeValid()
    const detailbtn = screen.queryByRole('button', { name: 'See details' })
    expect(detailbtn).toBeValid()
    await userEvent.click(detailbtn!)
    const detailDiv = screen.queryByTestId('rc-CompatibilityErrorDetails')
    expect(detailDiv).toBeVisible()
  })

  it('should handle empty fields', async () => {
    render(
      <CompatibilityStatusBar
        type={CompatibilityStatusEnum.FAIL}
        errors={errorDetails}
      />)

    expect(screen.queryByText('Mismatch')).toBeValid()
    const detailbtn = screen.queryByRole('button', { name: 'See details' })
    await userEvent.click(detailbtn!)
    const detailDiv = screen.queryByTestId('rc-CompatibilityErrorDetails')
    expect(detailDiv).toHaveTextContent(/Fields:\[\]/)
  })
})