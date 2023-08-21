import { cleanup } from '@testing-library/react'
import { Form }    from 'antd'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ClientAdmissionControlForm, ClientAdmissionControlTypeEnum } from './ClientAdmissionControlForm'

describe('ClientAdmissionControlForm component', () => {
  afterEach(() => cleanup())

  const defaultProps = {
    type: ClientAdmissionControlTypeEnum.CAC_24G,
    readOnly: false,
    isEnabled: true,
    isMutuallyExclusive: false,
    enabledFieldName: 'enabledField',
    minClientCountFieldName: 'minClientCountField',
    maxRadioLoadFieldName: 'maxRadioLoadField',
    minClientThroughputFieldName: 'minClientThroughputField',
    onFormDataChanged: jest.fn()
  }

  it('should render correctly', async () => {
    const type = defaultProps.type
    render(<Provider>
      <Form>
        <ClientAdmissionControlForm
          key={type}
          {...defaultProps}
        />
      </Form>
    </Provider>)

    const enable24gBtn = screen.getByTestId('client-admission-control-enable-'+type)
    expect(enable24gBtn).toBeVisible()
    expect(screen.queryByTestId('client-admission-control-min-client-count-'+type)).toBeVisible()
    expect(screen.queryByTestId('client-admission-control-max-client-load-'+type)).toBeVisible()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-'+type))
      .toBeVisible()
  })

  it('should hide switch button when readOnly is true', async () => {
    const props = { ...defaultProps, readOnly: true }
    const type = defaultProps.type
    render(<Provider>
      <Form>
        <ClientAdmissionControlForm
          key={type}
          {...props}
        />
      </Form>
    </Provider>)

    expect(screen
      .queryByTestId('client-admission-control-enable-read-only-'+type))
      .toBeVisible()
    expect(screen.queryByTestId('client-admission-control-enable-'+type))
      .not.toBeInTheDocument()
  })

  it('should grayed out switch button when isMutuallyExclusive is true', async () => {
    const props = { ...defaultProps, isMutuallyExclusive: true }
    const type = props.type
    render(<Provider>
      <Form>
        <ClientAdmissionControlForm
          key={type}
          {...props}
        />
      </Form>
    </Provider>)

    expect(screen.queryByTestId('client-admission-control-enable-read-only-'+type))
      .not.toBeInTheDocument()
    const enableBtn = await screen.findByTestId('client-admission-control-enable-'+type)
    expect(enableBtn).toBeDisabled()
  })
})