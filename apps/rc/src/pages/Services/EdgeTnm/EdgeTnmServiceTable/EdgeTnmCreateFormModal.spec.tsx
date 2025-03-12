import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CommonUrlsInfo,
  EdgeGeneralFixtures,
  EdgeTnmServiceUrls, EdgeUrlsInfo, VenueFixtures
} from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { EdgeTnmCreateFormModal } from './EdgeTnmCreateFormModal'

const mockPath = '/:tenantId/services/edgeTnmServices'

const { mockVenueOptions } = VenueFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={''}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const mockedAddReq = jest.fn()

describe('EdgeTnmCreateFormModal', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockedAddReq.mockReset()

    mockServer.use(
      rest.put(
        EdgeTnmServiceUrls.activateEdgeTnmServiceAppCluster.url,
        (req, res, ctx) => {
          mockedAddReq(req.params)
          return res(ctx.status(202))
        }),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(mockVenueOptions))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
  })

  it('should create successfully', async () => {
    render(<Provider>
      <EdgeTnmCreateFormModal
        visible
        setVisible={jest.fn()}
      />
    </Provider>, {
      route: { params, path: mockPath }
    })


    const dropdowns = screen.getAllByRole('combobox')
    const targetVenue = await screen.findByRole('option', { name: mockVenueOptions.data[0].name })
    await userEvent.selectOptions(dropdowns[0], targetVenue)

    // eslint-disable-next-line max-len
    const targetCluster = await screen.findByRole('option', { name: mockEdgeClusterList.data[0].name })
    await userEvent.selectOptions(dropdowns[1], targetCluster)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedAddReq).toBeCalledWith({
      venueId: mockVenueOptions.data[0].id,
      edgeClusterId: mockEdgeClusterList.data[0].clusterId
    }))
  })
})