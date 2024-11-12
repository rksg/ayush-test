import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'

import { mockVenueData }    from './__tests__/fixtures'
import { AddClusterDrawer } from './AddClusterDrawer'

const mockedSetVisible = jest.fn()
type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    loading, children, onChange, options, dropdownClassName, ...props
  }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

describe('AddClusterDrawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdgeCluster.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('Should render correctly', async () => {
    render(
      <Provider>
        <Form>
          <AddClusterDrawer
            visible={true}
            setVisible={mockedSetVisible}
          />
        </Form>
      </Provider>
    )
    expect(screen.getByText('Add Cluster')).toBeVisible()
  })

  it('Should close drawer while clicking cancel button', async () => {
    render(
      <Provider>
        <Form>
          <AddClusterDrawer
            visible={true}
            setVisible={mockedSetVisible}
          />
        </Form>
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedSetVisible).toBeCalledWith(false)
  })

  it('Should add cluster successfully', async () => {
    render(
      <Provider>
        <Form>
          <AddClusterDrawer
            venueId='mock_venue_1'
            visible={true}
            setVisible={mockedSetVisible}
          />
        </Form>
      </Provider>
    )
    const clusterName = await screen.findByRole('textbox', { name: 'Cluster Name' })
    await userEvent.type(clusterName, 'Test Cluseter')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(mockedSetVisible).toBeCalledWith(false)
  })
})