import { useEffect } from 'react'

import userEvent       from '@testing-library/user-event'
import { Form, Input } from 'antd'

import { getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                           from '@acx-ui/store'
import { render, screen, waitFor }                            from '@acx-ui/test-utils'

import { EdgeSdLanForm, EdgeSdLanFormProps } from '../../Form'
import { ApplyTo }                           from '../../shared/type'

import { AddEdgeSdLan } from '.'

const MockMspEdgeSdLanFormContainer = (props: EdgeSdLanFormProps) => {
  const { form, ...rest } = props
  useEffect(() => {
    form.setFieldsValue({ applyTo: [ApplyTo.MY_ACCOUNT, ApplyTo.MY_CUSTOMERS] })
  }, [form])
  return <EdgeSdLanForm form={form} {...rest}/>
}

jest.mock('../Form', () => ({
  MspEdgeSdLanFormContainer: (props: EdgeSdLanFormProps) =>
    <MockMspEdgeSdLanFormContainer {...props}/>
}))

const MockGeneralForm = () => <Form.Item
  name='applyTo'
  children={<Input />}
/>
jest.mock('../Form/GeneralForm', () => ({
  ...jest.requireActual('../Form/GeneralForm'),
  GeneralForm: () => <div data-testid='general-form'>
    <MockGeneralForm />
  </div>
}))

jest.mock('../Form/NetworkSelectionForm', () => ({
  ...jest.requireActual('../Form/NetworkSelectionForm'),
  NetworkSelectionForm: () => <div data-testid='network-selection-form'>NetworkSelectionForm</div>
}))

jest.mock('../Form/CustomerSelectionForm', () => ({
  ...jest.requireActual('../Form/CustomerSelectionForm'),
  // eslint-disable-next-line max-len
  CustomerSelectionForm: () => <div data-testid='customer-selection-form'>CustomerSelectionForm</div>
}))

jest.mock('../Form/SummaryForm', () => ({
  ...jest.requireActual('../Form/SummaryForm'),
  SummaryForm: () => <div data-testid='summary-form'>SummaryForm</div>
}))

jest.mock('@acx-ui/edge/components', () => ({
  ...jest.requireActual('@acx-ui/edge/components'),
  useEdgeSdLanActions: () => ({
    createEdgeSdLan: jest.fn().mockImplementation(({ callback }) => {
      // Simulate successful API call
      callback([{ success: true }])
      return Promise.resolve()
    })
  })
}))

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AddEdgeSdLan - MSP', () => {
  const params = { tenantId: 'tenant-id' }

  it('should through all steps and navigate to the correct page', async () => {
    render(<Provider>
      <AddEdgeSdLan />
    </Provider>, { route: { path: '/:tenantId/t/services', params } })
    expect(screen.getByTestId('general-form')).toBeVisible()
    await userEvent.click(screen.getByText('Next'))
    expect(await screen.findByTestId('network-selection-form')).toBeVisible()
    await userEvent.click(screen.getByText('Next'))
    expect(await screen.findByTestId('customer-selection-form')).toBeVisible()
    await userEvent.click(screen.getByText('Next'))
    expect(await screen.findByTestId('summary-form')).toBeVisible()
    await userEvent.click(screen.getByText('Add'))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/` + getServiceRoutePath({
          type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.LIST
        }),
        hash: '',
        search: ''
      },
      { replace: true }
      )
    })
  })
})