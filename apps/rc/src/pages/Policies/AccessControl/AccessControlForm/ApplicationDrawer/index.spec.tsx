import '@testing-library/jest-dom'

import React from 'react'

import { fireEvent }         from '@testing-library/react'
import userEvent             from '@testing-library/user-event'
import { Form }              from 'antd'
import { SliderSingleProps } from 'antd/lib/slider'
import { rest }              from 'msw'

import { AccessControlUrls }          from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import ApplicationDrawer from './index'

const queryApplication = {
  data: [
    {
      id: 'edac8b0c22e140cd95e63a9e81421576',
      name: 'app1',
      rulesCount: 2,
      networksCount: 0
    },
    {
      id: 'e51edc33a9764b1284c0fd201806e4d4',
      name: 'app2',
      description: 'sdfasdf',
      rulesCount: 1,
      networksCount: 0
    },
    {
      id: '02f18ac24a504cd88ed6a94025b64d44',
      name: 'app3',
      rulesCount: 1,
      networksCount: 0
    },
    {
      id: '9ad95d4741b44fbfbab55914c104eea4',
      name: 'app4',
      rulesCount: 1,
      networksCount: 0
    },
    {
      id: '8403ff88c526465b8070f50ca4547281',
      name: 'app5',
      rulesCount: 1,
      networksCount: 0
    },
    {
      id: 'e1ba3e5ca73b4bbf8c53bb5feff31f9b',
      name: 'app6-activityMsg',
      rulesCount: 1,
      networksCount: 0
    }
  ],
  fields: [
    'check-all',
    'name',
    'description',
    'rulesCount',
    'networksCount',
    'id'
  ],
  totalCount: 6,
  totalPages: 1,
  page: 1
}

const queryApplicationUpdate = {
  ...queryApplication,
  data: [
    ...queryApplication.data,
    {
      id: '6ab1a781711e492eb05a70f9f9ba253a',
      name: 'app1-test',
      rulesCount: 1,
      networksCount: 0
    }
  ],
  totalCount: 7
}

const applicationDetail = {
  tenantId: '6de6a5239a1441cfb9c7fde93aa613fe',
  name: 'app1',
  rules: [
    {
      name: 'appRule2',
      ruleType: 'USER_DEFINED',
      accessControl: 'DENY',
      priority: 2,
      applicationName: 'userDefinedAppName',
      applicationId: 1,
      portMapping: 'IP_WITH_PORT',
      destinationIp: '1.1.1.1',
      netmask: '255.255.255.0',
      destinationPort: 20,
      protocol: 'TCP',
      id: 'd0c06ec39bac4515b150ca4dac7e9b30'
    },
    {
      name: 'appRule1',
      ruleType: 'SIGNATURE',
      accessControl: 'DENY',
      priority: 1,
      category: 'Audio/Video',
      categoryId: 3,
      applicationName: '050 plus',
      applicationId: 1123,
      id: 'bcbcb881099946f5aad7841e2ca0d73f'
    }
  ],
  id: 'edac8b0c22e140cd95e63a9e81421576'
}

const applicationResponse = {
  requestId: '508c529a-0bde-49e4-8179-19366f69f31f'
}

const avcCat = [
  {
    catName: 'Web',
    catId: 30
  },
  {
    catName: 'Printer',
    catId: 21
  },
  {
    catName: 'Audio/Video',
    catId: 3
  }
]

const avcApp = [{
  appName: 'BBC',
  avcAppAndCatId: {
    catId: 30,
    appId: 1754
  }
}, {
  appName: 'AppsFlyer',
  avcAppAndCatId: {
    catId: 30,
    appId: 2334
  }
}, {
  appName: 'BJNP',
  avcAppAndCatId: {
    catId: 21,
    appId: 2481
  }
}, {
  appName: '050 plus',
  avcAppAndCatId: {
    catId: 3,
    appId: 1123
  }
}]

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, options, ...otherProps }) => {
    if (options) {
      return <select
        role='combobox'
        onChange={e => onChange(e.target.value)}
        {...otherProps}>
        {options.map((option: { value: string }) =>
          <option value={option.value}>{option.value}</option>)}
      </select>
    }

    return <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>
  }

  // @ts-ignore
  Select.Option = ({ children, options, ...otherProps }) => {
    return <option role='option' {...otherProps}>{children}</option>
  }

  const Slider = (props: (SliderSingleProps) & React.RefAttributes<unknown>) => {
    const { min, max, onChange: sliderOnChange } = props
    return <input
      data-testid='mock-slider'
      type='range'
      value={0}
      min={min}
      max={max}
      onChange={(event) => sliderOnChange ? sliderOnChange(Number(event.target.value)) : null}
    />
  }

  return { ...antd, Select, Slider }
})

const systemDefinedSection = async () => {
  await screen.findByRole('option', { name: 'Web' })

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[1],
    screen.getByRole('option', { name: 'All' })
  )

  await screen.findByRole('option', { name: 'BBC' })

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[1],
    screen.getByRole('option', { name: 'Web' })
  )

  await screen.findByRole('option', { name: 'BBC' })

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[2],
    screen.getByRole('option', { name: 'BBC' })
  )
}

describe('ApplicationDrawer Component', () => {
  it('Render ApplicationDrawer component successfully with new added profile', async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(queryApplication)
        )
      ), rest.post(
        AccessControlUrls.addAppPolicy.url,
        (_, res, ctx) => res(
          ctx.json(applicationResponse)
        )
      ), rest.get(
        AccessControlUrls.getAvcCategory.url,
        (_, res, ctx) => res(
          ctx.json(avcCat)
        )
      ), rest.get(
        AccessControlUrls.getAvcApp.url,
        (_, res, ctx) => res(
          ctx.json(avcApp)
        )
      ))

    render(
      <Provider>
        <Form>
          <ApplicationDrawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1-test')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add application rule/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), 'app1rule1')

    await systemDefinedSection()

    await userEvent.click(screen.getByText(/block applications/i))

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/rules \(1\)/i)

    await userEvent.click(screen.getAllByText('Save')[0])

    mockServer.use(rest.post(
      AccessControlUrls.getAppPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryApplicationUpdate)
      )
    ))

    await screen.findByRole('option', { name: 'app1-test' })

  })

  it('Render ApplicationDrawer component successfully with UserDefined rule', async () => {
    mockServer.use(rest.post(
      AccessControlUrls.getAppPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryApplication)
      )
    ), rest.post(
      AccessControlUrls.addAppPolicy.url,
      (_, res, ctx) => res(
        ctx.json(applicationResponse)
      )
    ), rest.get(
      AccessControlUrls.getAvcApp.url,
      (_, res, ctx) => res(
        ctx.json(avcApp)
      )
    ), rest.get(
      AccessControlUrls.getAvcCategory.url,
      (_, res, ctx) => res(
        ctx.json(avcCat)
      )
    ) )

    render(
      <Provider>
        <Form>
          <ApplicationDrawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('option', { name: 'app1' })

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1')

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1-test')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add application rule/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), 'app1rule1')

    await userEvent.click(screen.getByText(/user defined/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /application name/i
    }), 'userDefinedApp')

    await userEvent.type(screen.getByRole('textbox', {
      name: /destination ip/i
    }), '1.1.1.1')

    await userEvent.type(screen.getByRole('textbox', {
      name: /netmask/i
    }), '255.255.0.0')

    await userEvent.type(screen.getByRole('textbox', {
      name: /destination port/i
    }), '22')

    await userEvent.click(screen.getByText(/block applications/i))

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/rules \(1\)/i)

    await userEvent.click(screen.getAllByText('Save')[0])
  })

  it('Render ApplicationDrawer component successfully with edit and del action', async () => {
    mockServer.use(rest.post(
      AccessControlUrls.getAppPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryApplication)
      )
    ), rest.post(
      AccessControlUrls.addAppPolicy.url,
      (_, res, ctx) => res(
        ctx.json(applicationResponse)
      )
    ), rest.get(
      AccessControlUrls.getAvcApp.url,
      (_, res, ctx) => res(
        ctx.json(avcApp)
      )
    ), rest.get(
      AccessControlUrls.getAvcCategory.url,
      (_, res, ctx) => res(
        ctx.json(avcCat)
      )
    ))

    render(
      <Provider>
        <Form>
          <ApplicationDrawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('option', { name: 'app1' })

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1')

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1-test')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add application rule/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), 'app1rule1')

    await userEvent.click(screen.getByText(/user defined/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /application name/i
    }), 'userDefinedApp')

    await userEvent.type(screen.getByRole('textbox', {
      name: /destination ip/i
    }), '1.1.1.1')

    await userEvent.type(screen.getByRole('textbox', {
      name: /netmask/i
    }), '255.255.0.0')

    await userEvent.type(screen.getByRole('textbox', {
      name: /destination port/i
    }), '22')

    await userEvent.click(screen.getByText(/block applications/i))

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/rules \(1\)/i)

    await userEvent.click(screen.getByText('app1rule1'))

    await userEvent.click(screen.getByRole('button', {
      name: 'Edit'
    }))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), '-modify')

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText('app1rule1-modify')

    await userEvent.click(screen.getByText('app1rule1-modify'))

    await userEvent.click(screen.getByRole('button', {
      name: /delete/i
    }))

    await screen.findByText(/delete rule/i)

    await userEvent.click(screen.getByText(/delete rule/i))

    await screen.findByText(/rules \(0\)/i)

  })

  it('Render ApplicationDrawer component successfully for access control part', async () => {
    mockServer.use(rest.post(
      AccessControlUrls.getAppPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryApplication)
      )
    ), rest.post(
      AccessControlUrls.addAppPolicy.url,
      (_, res, ctx) => res(
        ctx.json(applicationResponse)
      )
    ), rest.get(
      AccessControlUrls.getAvcCategory.url,
      (_, res, ctx) => res(
        ctx.json(avcCat)
      )
    ), rest.get(
      AccessControlUrls.getAvcApp.url,
      (_, res, ctx) => res(
        ctx.json(avcApp)
      )
    ))

    render(
      <Provider>
        <Form>
          <ApplicationDrawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', requestId: 'requestId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add application rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), 'app1rule1')

    await screen.findByRole('option', { name: 'Web' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[1],
      screen.getByRole('option', { name: 'Web' })
    )

    await screen.findByRole('option', { name: 'BBC' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[2],
      screen.getByRole('option', { name: 'BBC' })
    )

    await userEvent.click(screen.getByText(/qos/i))

    await screen.findByRole('option', { name: 'DSCP' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[3],
      screen.getByRole('option', { name: 'DSCP' })
    )

    await userEvent.click(screen.getByText(/rate limit/i))

    await userEvent.click(screen.getByText(/max uplink rate:/i))

    await userEvent.click(screen.getByText(/max downlink rate:/i))

    fireEvent.change(screen.getAllByTestId('mock-slider')[0], { target: { value: '10' } })

    fireEvent.change(screen.getAllByTestId('mock-slider')[1], { target: { value: '20' } })

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText('app1rule1')

  })


  it('Render ApplicationDrawer component in viewMode successfully', async () => {
    mockServer.use(rest.post(
      AccessControlUrls.getAppPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryApplication)
      )
    ), rest.get(
      AccessControlUrls.getAppPolicy.url,
      (_, res, ctx) => res(
        ctx.json(applicationDetail)
      )
    ), rest.get(
      AccessControlUrls.getAvcCategory.url,
      (_, res, ctx) => res(
        ctx.json(avcCat)
      )
    ), rest.get(
      AccessControlUrls.getAvcApp.url,
      (_, res, ctx) => res(
        ctx.json(avcApp)
      )
    ))

    render(
      <Provider>
        <Form>
          <ApplicationDrawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', requestId: 'requestId1' }
        }
      }
    )

    await screen.findByRole('option', { name: 'app1' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'app1' })
    )

    await userEvent.click(screen.getByText(/edit details/i))

    await screen.findByText(/rules \(2\)/i)

    await screen.findByText(/audio/i)

    await userEvent.click(screen.getAllByText('Cancel')[0])
  })
})
