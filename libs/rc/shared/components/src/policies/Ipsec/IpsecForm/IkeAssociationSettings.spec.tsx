import { render, screen, fireEvent } from '@testing-library/react'
import { Form }                      from 'antd'
import { IntlProvider }              from 'react-intl'

import { IpSecEncryptionAlgorithmEnum, IpSecProposalTypeEnum } from '@acx-ui/rc/utils'

import IkeAssociationSettings from './IkeAssociationSettings'

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) => {
    delete otherProps.dropdownClassName
    return ( <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>)
  }


  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe('IkeAssociationSettings', () => {
  const renderComponent = (initialValues = {
    ikeSecurityAssociation: {
      ikeProposalType: IpSecProposalTypeEnum.DEFAULT
    }
  }) => {
    return render(
      <IntlProvider locale='en'>
        <Form initialValues={initialValues}>
          <IkeAssociationSettings />
        </Form>
      </IntlProvider>
    )
  }

  it('displays Default form fields', () => {
    renderComponent()
    expect(screen.getByText('Internet Key Exchange (IKE) Proposal')).toBeInTheDocument()
    const typeSelect = screen.getAllByRole('combobox')[0]
    expect(typeSelect).toHaveValue(IpSecProposalTypeEnum.DEFAULT)
  })

  it('calls onProposalTypeChange when proposal type is changed', () => {
    renderComponent()
    expect(screen.getByText('Internet Key Exchange (IKE) Proposal')).toBeInTheDocument()
    const typeSelect = screen.getAllByRole('combobox')[0]
    expect(typeSelect).toHaveValue(IpSecProposalTypeEnum.DEFAULT)

    fireEvent.change(typeSelect, { target: { value: IpSecProposalTypeEnum.SPECIFIC } })
    expect(typeSelect).toHaveValue(IpSecProposalTypeEnum.SPECIFIC)
    expect(screen.getByText('Encryption Mode')).toBeInTheDocument()
    const encryptionSelect = screen.getAllByRole('combobox', { name: /Encryption/i })[0]
    expect(encryptionSelect).toHaveValue(IpSecEncryptionAlgorithmEnum.AES128)
  })

  it('calls add another proposal and maximum number of proposals is reached', () => {
    renderComponent()
    expect(screen.getByText('Internet Key Exchange (IKE) Proposal')).toBeInTheDocument()
    const typeSelect = screen.getAllByRole('combobox')[0]
    expect(typeSelect).toHaveValue(IpSecProposalTypeEnum.DEFAULT)

    fireEvent.change(typeSelect, { target: { value: IpSecProposalTypeEnum.SPECIFIC } })
    expect(typeSelect).toHaveValue(IpSecProposalTypeEnum.SPECIFIC)
    expect(screen.getByText('Encryption Mode')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox', { name: /Encryption/i }).length).toBeLessThanOrEqual(1)

    const addProposalBtn = screen.getByRole('button', { name: 'Add another proposal' })
    fireEvent.click(addProposalBtn)
    expect(screen.getAllByRole('combobox', { name: /Encryption/i }).length).toBeGreaterThan(1)

    expect(screen.queryByText('Add another proposal')).not.toBeInTheDocument()
  })
})