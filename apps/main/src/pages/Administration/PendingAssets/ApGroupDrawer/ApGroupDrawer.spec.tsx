import React from 'react'

import { rest } from 'msw'

import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

// Mock the services
jest.mock('@acx-ui/rc/services', () => {
  let currentVenueId = undefined
  return {
    useAddApGroupMutation: () => [
      jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve({}) }),
      { isLoading: false }
    ],
    useVenuesListQuery: () => ({
      data: {
        data: [
          { id: 'venue1', name: 'Venue 1' },
          { id: 'venue2', name: 'Venue 2' }
        ]
      },
      isLoading: false
    }),
    useNewApListQuery: (params) => {
      const venueId = params?.payload?.filters?.venueId?.[0] || params?.venueId

      if (!venueId) {
        return { data: { data: [] }, isLoading: false }
      }

      currentVenueId = venueId

      if (currentVenueId === 'venue1') {
        return {
          data: {
            data: [
              { serialNumber: 'AP001', name: 'AP 1', apGroupName: null, tags: [] },
              { serialNumber: 'AP002', name: 'AP 2', apGroupName: 'Group A', tags: [] },
              { serialNumber: 'AP003', name: 'AP 3', apGroupName: null, tags: [] }
            ]
          },
          isLoading: false
        }
      } else if (currentVenueId === 'venue2') {
        return {
          data: {
            data: [
              { serialNumber: 'AP004', name: 'AP 4', apGroupName: null, tags: [] },
              { serialNumber: 'AP005', name: 'AP 5', apGroupName: null, tags: [] }
            ]
          },
          isLoading: false
        }
      }

      return { data: { data: [] }, isLoading: false }
    }
  }
})

// Mock antd components
jest.mock('antd', () => {
  const React = require('react')
  const antd = jest.requireActual('antd')
  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn()
    },
    Form: Object.assign(
      ({ children }) => <form>{children}</form>,
      {
        useForm: () => [{
          resetFields: jest.fn(),
          validateFields: jest.fn().mockResolvedValue({
            name: 'Test Group',
            venueId: 'venue1'
          }),
          setFieldsValue: jest.fn(),
          getFieldValue: jest.fn()
        }],
        useWatch: () => 'venue1',
        Item: ({ children, label, name }) => {
          const React = require('react')
          const id = name || 'default-id'

          return (
            <div>
              {label && <label htmlFor={id}>{label}</label>}
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, { id, name: id })
                }
                return child
              })}
            </div>
          )
        }
      }
    ),
    Input: (props) => {
      const id = props.id || props.name || 'name'
      return <input {...props} id={id} name={id} />
    },
    Select: (props) => {
      const id = props.id || props.name || 'venueId'
      const { options, children, placeholder, loading, ...rest } = props
      return (
        <select id={id} name={id} {...rest}>
          <option value=''>{placeholder}</option>
          {options
            ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
            : children}
        </select>
      )
    }
  }
})

// Mock the components
jest.mock('@acx-ui/components', () => {
  const React = require('react')

  const DrawerComponent = ({ children, title, visible, onClose, footer }) => (
    visible ? (
      <div role='dialog'>
        <div>
          <button onClick={onClose}>Close</button>
          <div>{title}</div>
        </div>
        <div>{children}</div>
        {footer}
      </div>
    ) : null
  )

  DrawerComponent.FormFooter = ({ buttonLabel, onCancel, onSave }) => (
    <div>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onSave}>{buttonLabel.save}</button>
    </div>
  )

  return {
    Drawer: DrawerComponent,
    Loader: ({ children }) => <div>{children}</div>,
    Transfer: ({ dataSource, targetKeys, onChange, render, showSearch, titles }) => {
      const [selectedKeys, setSelectedKeys] = React.useState(targetKeys || [])

      React.useEffect(() => {
        setSelectedKeys(targetKeys || [])
      }, [targetKeys])

      const handleAdd = (key) => {
        if (!selectedKeys.includes(key)) {
          const newKeys = [...selectedKeys, key]
          setSelectedKeys(newKeys)
          onChange?.(newKeys)
        }
      }

      const handleRemove = (key) => {
        if (selectedKeys.includes(key)) {
          const newKeys = selectedKeys.filter(k => k !== key)
          setSelectedKeys(newKeys)
          onChange?.(newKeys)
        }
      }

      const availableItems = dataSource.filter(item => !selectedKeys.includes(item.key))
      const selectedItems = dataSource.filter(item => selectedKeys.includes(item.key))

      if (dataSource.length === 0) {
        return null
      }

      return (
        <div>
          <div>
            <h4>{titles[0]}</h4>
            {showSearch && <input placeholder='Search...' />}
            <div>
              {availableItems.map((item) => (
                <div key={item.key} onClick={() => handleAdd(item.key)}>
                  {render(item)}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4>{titles[1]}</h4>
            <div>
              {selectedItems.map((item) => (
                <div key={item.key} onClick={() => handleRemove(item.key)}>
                  {render(item)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  }
})

const { ApGroupDrawer } = require('./ApGroupDrawer')

const renderApGroupDrawer = (props = {}) => {
  return render(
    <ApGroupDrawer
      open={true}
      onClose={jest.fn()}
      onSuccess={jest.fn()}
      {...props}
    />
  )
}

describe('ApGroupDrawer', () => {
  beforeEach(() => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.post('/venues/switches/clients/query', (req, res, ctx) => {
        return res(ctx.json({ data: [] }))
      })
    )
  })

  it('should render correctly', async () => {
    renderApGroupDrawer()

    await waitFor(() => {
      expect(screen.getByText('Add AP Group')).toBeInTheDocument()
    })
    expect(screen.getByText('Group Details')).toBeInTheDocument()
    expect(screen.getByText('Group Member')).toBeInTheDocument()
    expect(screen.getByLabelText('Group Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Venue')).toBeInTheDocument()
  })

  it('should show available APs when venue is selected', async () => {
    renderApGroupDrawer()

    // Select venue
    const venueSelect = screen.getByLabelText('Venue')
    fireEvent.change(venueSelect, { target: { value: 'venue1' } })

    // Should show APs
    await waitFor(() => {
      expect(screen.getByText('Available APs')).toBeInTheDocument()
    })
    expect(screen.getByText('Selected APs')).toBeInTheDocument()
  })

  it('should show search functionality in available APs list', async () => {
    renderApGroupDrawer()

    // Select venue
    const venueSelect = screen.getByLabelText('Venue')
    fireEvent.change(venueSelect, { target: { value: 'venue1' } })

    // Should show search input
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })
  })

  it('should handle cancel action', async () => {
    const mockOnClose = jest.fn()
    renderApGroupDrawer({ onClose: mockOnClose })

    // Click cancel
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should show AP group information in transfer list', async () => {
    renderApGroupDrawer()

    // Select venue
    const venueSelect = screen.getByLabelText('Venue')
    fireEvent.change(venueSelect, { target: { value: 'venue1' } })

    // Wait for APs to load
    await waitFor(() => {
      expect(screen.getByText('AP 2')).toBeInTheDocument()
    }, { timeout: 5000 })

    // Should show AP with group information
    expect(screen.getByText('Group: Group A')).toBeInTheDocument()
  })
})