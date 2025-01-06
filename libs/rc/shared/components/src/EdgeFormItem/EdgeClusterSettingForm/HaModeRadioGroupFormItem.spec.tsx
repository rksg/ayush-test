/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { StepsForm }                                                from '@acx-ui/components'
import { ClusterHighAvailabilityModeEnum, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { render, screen, renderHook }                               from '@acx-ui/test-utils'

import { HaModeRadioGroupFormItem } from './HaModeRadioGroupFormItem'

jest.mock('../../ApCompatibility/ApCompatibilityToolTip', () => ({
  ApCompatibilityToolTip: (props: { onClick: () => void }) =>
    <div data-testid='ApCompatibilityToolTip'>
      <button onClick={props.onClick}>See compatibility</button>
    </div>
}))

const MockComponent = (props: HaModeRadioGroupFormItemProps & { formRef: FormInstance }) => {
  const { formRef, ...restProps } = props
  return <StepsForm form={formRef}>
    <StepsForm.StepForm>
      <HaModeRadioGroupFormItem
        {...restProps}
      />
    </StepsForm.StepForm>
  </StepsForm>
}

describe('HaModeRadioGroupFormItem', () => {

  it('should render initial value - Active-Standby correctly', async () => {
    render(<MockComponent
      setEdgeCompatibilityModalFeature={jest.fn()}
      initialValue={ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY}
      editMode={false}
      disabled={false}
    />)
    expect(screen.getByRole('radio', { name: /Active-Standby/ })).toBeChecked()
    expect(screen.queryByRole('radio', { name: /Active-Active/ })).not.toBeChecked()
  })

  it('should render initial value - Active-Active correctly', async () => {
    render(<MockComponent
      setEdgeCompatibilityModalFeature={jest.fn()}
      initialValue={ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE}
      editMode={false}
      disabled={false}
    />)
    expect(screen.getByRole('radio', { name: /Active-Active/ })).toBeChecked()
    expect(screen.queryByRole('radio', { name: /Active-Standby/ })).not.toBeChecked()
  })

  it('should render edit mode - Active-Standby correctly', async () => {
    render(<MockComponent
      setEdgeCompatibilityModalFeature={jest.fn()}
      initialValue={ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY}
      editMode={true}
      disabled={false}
    />)

    expect(screen.queryByRole('radio')).toBeNull()
    expect(screen.getByText(/Active-Standby/)).toBeInTheDocument()
    expect(screen.queryByText(/Active-Active/)).toBeNull()
  })

  it('should render edit mode - Active-Active correctly', async () => {
    render(<MockComponent
      setEdgeCompatibilityModalFeature={jest.fn()}
      initialValue={ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE}
      editMode={true}
      disabled={false}
    />)

    expect(screen.queryByRole('radio')).toBeNull()
    expect(await screen.findByText(/Active-Active/)).toBeInTheDocument()
    expect(screen.queryByText(/Active-Standby/)).toBeNull()
  })

  it('should render editMode, disabled default in false correctly', async () => {
    render(<MockComponent
      setEdgeCompatibilityModalFeature={jest.fn()}
    />)

    expect(await screen.findByRole('radio', { name: /Active-Standby/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Active-Active/ })).toBeInTheDocument()
    const radios = screen.getAllByRole('radio')
    radios.forEach(radio => {
      expect(radio).not.toBeDisabled()
      expect(radio).not.toBeChecked()
    })
  })

  it('should show selected value', async () => {
    const { result: { current: [formRef] } } = renderHook(() => Form.useForm())

    render(<MockComponent
      formRef={formRef}
      setEdgeCompatibilityModalFeature={jest.fn()}
      editMode={false}
      disabled={false}
    />)

    const activeActiveRadio = screen.getByRole('radio', { name: /Active-Active/ })
    await userEvent.click(activeActiveRadio)
    expect(activeActiveRadio).toBeChecked()
    expect(formRef.getFieldValue('highAvailabilityMode')).toEqual(ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE)
    const activeStandbyRadio = screen.getByRole('radio', { name: /Active-Standby/ })
    expect(activeStandbyRadio).not.toBeChecked()
  })

  it('should show compatibility modal', async () => {
    const mockSetEdgeCompatibilityModalFeature = jest.fn()

    render(<MockComponent
      setEdgeCompatibilityModalFeature={mockSetEdgeCompatibilityModalFeature}
    />)

    expect(await screen.findByRole('radio', { name: /Active-Active/ })).toBeInTheDocument()
    const seeCompatibilityButton = screen.getByRole('button', { name: /See compatibility/ })
    await userEvent.click(seeCompatibilityButton)
    expect(mockSetEdgeCompatibilityModalFeature).toBeCalledWith(IncompatibilityFeatures.HA_AA)
  })
})