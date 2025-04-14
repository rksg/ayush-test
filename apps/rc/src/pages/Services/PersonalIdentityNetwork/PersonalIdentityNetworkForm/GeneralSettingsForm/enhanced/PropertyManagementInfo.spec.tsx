import userEvent              from '@testing-library/user-event'
import { Form, FormInstance } from 'antd'
import { cloneDeep }          from 'lodash'

import { StepsForm }             from '@acx-ui/components'
import { Features }              from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { Provider }              from '@acx-ui/store'
import {
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { mockContextData }                                                            from '../../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext, PersonalIdentityNetworkFormContextType } from '../../PersonalIdentityNetworkFormContext'

import { PropertyManagementInfo } from './PropertyManagementInfo'

jest.mock('./PropertyManagementDrawer', () => ({
  PropertyManagementDrawer: (props: { visible: boolean }) =>
    <div data-testid='PropertyManagementDrawer'>{''+props.visible}</div>
}))

jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

// eslint-disable-next-line max-len
const MockComponent = (props: { venueId: string, editMode?: boolean, ctxData?: PersonalIdentityNetworkFormContextType, formRef?: FormInstance }) => {
  return <Provider>
    <PersonalIdentityNetworkFormContext.Provider
      value={props.ctxData ?? mockContextData}
    >
      <StepsForm form={props.formRef}>
        <StepsForm.StepForm>
          <PropertyManagementInfo venueId={props.venueId} editMode={props.editMode} />
        </StepsForm.StepForm>
      </StepsForm>
    </PersonalIdentityNetworkFormContext.Provider>
  </Provider>
}

describe('PropertyManagementInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders property management info when property config is enabled', () => {
    const venueId = 'venue-id'

    render(<MockComponent
      venueId={venueId}
      editMode={false}
    />)

    expect(screen.getByText('Property management:')).toBeInTheDocument()
    expect(screen.getByText('On')).toBeInTheDocument()

    expect(screen.getByText('Identity Group:')).toBeInTheDocument()
    expect(screen.getByText('TestPersona')).toBeInTheDocument()

    expect(screen.getByText('DPSK Service:')).toBeInTheDocument()
    expect(screen.getByText('TestDpsk')).toBeInTheDocument()
  })

  it('renders property management info when property config is disabled', () => {
    const venueId = 'venue-id'
    const mockData = cloneDeep(mockContextData)
    mockData.personaGroupId = ''

    render(<MockComponent
      venueId={venueId}
      editMode={false}
      ctxData={mockData}
    />)

    expect(screen.getByText('Property management:')).toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()

    expect(screen.queryByText('Identity Group:')).not.toBeInTheDocument()
    expect(screen.queryByText('DPSK')).not.toBeInTheDocument()
  })

  it('renders property management OFF when getting property config is failed', async () => {
    const venueId = 'venue-id'
    const { result: { current: [form] } } = renderHook(() => Form.useForm())
    jest.spyOn(form, 'setFieldValue').mockImplementation(jest.fn())

    render(<MockComponent
      venueId={venueId}
      editMode={false}
      ctxData={{
        ...mockContextData,
        isGetPropertyConfigError: true
      }}
      formRef={form}
    />)

    expect(screen.getByText('Property management:')).toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()

    expect(screen.queryByText('Identity Group:')).toBeNull()
    expect(screen.queryByText('DPSK')).toBeNull()

    expect(form.setFieldValue).toBeCalledWith('personaGroupId', undefined)
  })

  it('should be able to activate when getting property config is failed', async () => {
    const venueId = 'venue-id'

    render(<MockComponent
      venueId={venueId}
      editMode={false}
      ctxData={{
        ...mockContextData,
        isGetPropertyConfigError: true
      }}
    />)

    expect(screen.getByText('Property management:')).toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()

    const activateBtn = screen.getByRole('button', { name: 'Activate Property Management' })
    await userEvent.click(activateBtn)
    expect(screen.getByTestId('PropertyManagementDrawer')).toHaveTextContent('true')
  })

  describe('test L2GRE case', () => {
    beforeEach(() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation((ff) => ff === Features.EDGE_L2OGRE_TOGGLE)
    })
    afterEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReset()
    })

    it('should render venue name correctly', async () => {
      const venueId = 'venue-id'

      render(<MockComponent
        venueId={venueId}
        editMode={false}
      />)

      expect(screen.getByText('Venue:')).toBeInTheDocument()

      expect(screen.getByText('Property management:')).toBeInTheDocument()
      expect(screen.getByText('On')).toBeInTheDocument()

      expect(screen.getByText('Identity Group:')).toBeInTheDocument()
      expect(screen.getByText('TestPersona')).toBeInTheDocument()

      expect(screen.getByText('DPSK Service:')).toBeInTheDocument()
      expect(screen.getByText('TestDpsk')).toBeInTheDocument()
    })
  })
})