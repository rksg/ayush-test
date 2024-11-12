import React from 'react'

import userEvent         from '@testing-library/user-event'
import { CarouselProps } from 'antd'

import { fakeIncidentVlan, overlapsRollup }                             from '@acx-ui/analytics/utils'
import { Provider, dataApi, dataApiURL, store }                         from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, within, screen, waitFor } from '@acx-ui/test-utils'

import { ImpactedSwitch } from './services'

import { ImpactedSwitchVLANsTable } from '.'

const { click, keyboard } = userEvent

jest.mock('antd', () => {
  const original = jest.requireActual('antd')
  const React = jest.requireActual('react')
  return {
    ...original,
    // Mock Carousel due to AntD carousel does not trigger necessary event
    Carousel: React.forwardRef((props: CarouselProps, ref: React.ForwardedRef<unknown>) => {
      const [current, setCurrent] = React.useState(0)
      const carouselRef = React.useRef({
        goTo: (index: number) => setCurrent(index)
      })

      React.useImperativeHandle(ref, () => carouselRef.current)

      // eslint-disable-next-line testing-library/no-node-access
      const children = props.children!
      return <>
        {React.cloneElement(props.prevArrow!, {
          onClick: () => props.beforeChange?.(current, current - 1)
        })}
        {children}
        {React.cloneElement(props.nextArrow!, {
          onClick: () => props.beforeChange?.(current, current + 1)
        })}
      </>
    })
  }
})

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock

// mac and portmac the same
const sample1: ImpactedSwitch[] = [{
  name: 'Switch 1',
  mac: '10:00:00:00:00:01',
  ports: [{
    portNumber: '1/1/1',
    portMac: '10:00:00:00:00:01',
    vlans: [
      { id: 1, name: 'DEFAULT-VLAN' },
      { id: 11, name: '' }
    ],
    untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    mismatchedVlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
    mismatchedUntaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    connectedDevice: {
      mac: '20:00:00:00:00:02',
      portMac: '20:00:00:00:00:02',
      name: 'Switch 2',
      type: 'Bridge, Router',
      isAP: false,
      port: 'GigabitEthernet1/1/1',
      description: 'Unknown',
      vlans: [{ id: 11, name: '' }],
      untaggedVlan: null
    }
  }, {
    portNumber: '1/1/2',
    portMac: '10:00:00:00:00:01',
    vlans: [
      { id: 1, name: 'DEFAULT-VLAN' },
      { id: 11, name: '' },
      { id: 4, name: '' }
    ],
    untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    mismatchedVlans: [{ id: 11, name: '' }, { id: 4, name: '' }],
    mismatchedUntaggedVlan: null,
    connectedDevice: {
      mac: '20:00:00:00:00:02',
      portMac: '20:00:00:00:00:02',
      name: 'Switch 2',
      type: 'Bridge, Router',
      isAP: false,
      port: 'GigabitEthernet1/1/2',
      description: 'Unknown',
      vlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
      untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' }
    }
  }]
}, {
  name: 'Switch 2',
  mac: '20:00:00:00:00:02',
  ports: [{
    portNumber: '1/1/1',
    portMac: '20:00:00:00:00:02',
    vlans: [{ id: 11, name: '' }],
    untaggedVlan: null,
    mismatchedVlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
    mismatchedUntaggedVlan: null,
    connectedDevice: {
      mac: '10:00:00:00:00:01',
      portMac: '10:00:00:00:00:01',
      name: 'Switch 1',
      type: 'Bridge, Router',
      isAP: false,
      port: '1/1/1',
      description: 'Unknown',
      vlans: [
        { id: 1, name: 'DEFAULT-VLAN' },
        { id: 11, name: '' }
      ],
      untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' }
    }
  }, {
    portNumber: '1/1/2',
    portMac: '20:00:00:00:00:03',
    vlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
    untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    mismatchedVlans: [{ id: 11, name: 'DEFAULT-VLAN' }, { id: 4, name: '' }],
    mismatchedUntaggedVlan: null,
    connectedDevice: {
      mac: '10:00:00:00:00:02',
      portMac: '10:00:00:00:00:02',
      name: 'Switch 1',
      type: 'Bridge, Router',
      isAP: false,
      port: '1/1/2',
      description: 'Unknown',
      vlans: [
        { id: 1, name: 'DEFAULT-VLAN' },
        { id: 11, name: '' },
        { id: 4, name: '' }
      ],
      untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' }
    }
  }]
}]

// mac and portmac differ
const sample2: ImpactedSwitch[] = [{
  name: 'Sol-DBlade-System',
  mac: '60:9C:9F:D8:B4:80',
  ports: [{
    portNumber: '1/1/48',
    portMac: '60:9C:9F:D8:B4:AF',
    vlans: [
      { id: 30, name: '' },
      { id: 150, name: 'KC Vlan150' }
    ],
    untaggedVlan: { id: 1646, name: 'Site BA Dblade' },
    mismatchedVlans: [{ id: 30, name: '' }],
    mismatchedUntaggedVlan: null,
    connectedDevice: {
      mac: 'D4:C1:9E:0E:7D:40',
      portMac: 'D4:C1:9E:0E:7D:71',
      name: 'Site-B-SW1',
      type: 'Bridge',
      isAP: false,
      port: '10GigabitEthernet1/2/1',
      description: 'Ruckus Wireless, Inc. ICX7450-48-HPOE, IronWare Version 09.0.10hT211',
      vlans: [{ id: 150, name: 'Site-A Tunneled WLAN' }],
      untaggedVlan: { id: 1646, name: 'Site-B-DP' }
    }
  }]
}, {
  name: 'Site-B-SW1',
  mac: 'D4:C1:9E:0E:7D:40',
  ports: [{
    portNumber: '1/2/1',
    portMac: 'D4:C1:9E:0E:7D:71',
    vlans: [{ id: 150, name: 'Site-A Tunneled WLAN' }],
    untaggedVlan: { id: 1646, name: 'Site-B-DP' },
    mismatchedVlans: [{ id: 30, name: '' }],
    mismatchedUntaggedVlan: null,
    connectedDevice: {
      mac: '60:9C:9F:D8:B4:80',
      portMac: '60:9C:9F:D8:B4:AF',
      name: 'Sol-DBlade-System',
      type: 'Bridge',
      isAP: false,
      port: '10GigabitEthernet1/1/48',
      description: 'Ruckus Wireless, Inc. ICX7750-48F, IronWare Version 08.0.95jT201',
      vlans: [
        { id: 30, name: '' },
        { id: 150, name: 'KC Vlan150' }
      ],
      untaggedVlan: { id: 1646, name: 'Site BA Dblade' }
    }
  }]
}]

// Switch > AP
const sample3: ImpactedSwitch[] = [{
  name: 'Switch 1',
  mac: '10:00:00:00:00:01',
  ports: [{
    portNumber: '1/1/1',
    portMac: '10:00:00:00:00:02',
    vlans: [
      { id: 1, name: 'DEFAULT-VLAN' },
      { id: 11, name: '' }
    ],
    untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    mismatchedVlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
    mismatchedUntaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    connectedDevice: {
      mac: '00:00:00:00:00:01',
      portMac: '00:00:00:00:00:02',
      name: 'AP 1',
      type: 'Access Point',
      isAP: true,
      port: '1/1/1',
      description: 'Unknown',
      vlans: [{ id: 11, name: '' }],
      untaggedVlan: null
    }
  }]
}]

// ID_NAME_LIST_MISMATCHED
const sample4: ImpactedSwitch[] = [{
  name: 'Switch 1',
  mac: '10:00:00:00:00:01',
  ports: [{
    portNumber: '1/1/1',
    portMac: '10:00:00:00:00:02',
    vlans: [
      { id: 1, name: 'DEFAULT-VLAN' },
      { id: 11, name: '' },
      { id: 99999, name: 'ID_NAME_LIST_MISMATCHED' }
    ],
    untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    mismatchedVlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
    mismatchedUntaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    connectedDevice: {
      mac: '20:00:00:00:00:02',
      portMac: '20:00:00:00:00:02',
      name: 'Switch 2',
      type: 'Bridge, Router',
      isAP: false,
      port: 'GigabitEthernet1/1/1',
      description: 'Unknown',
      vlans: [{ id: 11, name: '' }, { id: 99999, name: 'ID_NAME_LIST_MISMATCHED' }],
      untaggedVlan: null
    }
  }]
}, {
  name: 'Switch 2',
  mac: '20:00:00:00:00:01',
  ports: [{
    portNumber: '1/1/1',
    portMac: '20:00:00:00:00:02',
    vlans: [{ id: 11, name: '' }, { id: 99999, name: 'ID_NAME_LIST_MISMATCHED' }],
    untaggedVlan: null,
    mismatchedVlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
    mismatchedUntaggedVlan: null,
    connectedDevice: {
      mac: '10:00:00:00:00:01',
      portMac: '10:00:00:00:00:02',
      name: 'Switch 1',
      type: 'Bridge, Router',
      isAP: false,
      port: '1/1/1',
      description: 'Unknown',
      vlans: [
        { id: 1, name: 'DEFAULT-VLAN' },
        { id: 11, name: '' },
        { id: 99999, name: 'ID_NAME_LIST_MISMATCHED' }
      ],
      untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' }
    }
  }]
}]

// no matching VLANs
const sample5: ImpactedSwitch[] = [{
  name: 'Switch 1',
  mac: '10:00:00:00:00:01',
  ports: [{
    portNumber: '1/1/1',
    portMac: '10:00:00:00:00:01',
    vlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
    untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    mismatchedVlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
    mismatchedUntaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
    connectedDevice: {
      mac: '20:00:00:00:00:02',
      portMac: '20:00:00:00:00:02',
      name: 'Switch 2',
      type: 'Bridge, Router',
      isAP: false,
      port: 'GigabitEthernet1/1/1',
      description: 'Unknown',
      vlans: [{ id: 111, name: '' }],
      untaggedVlan: null
    }
  }]
}, {
  name: 'Switch 2',
  mac: '20:00:00:00:00:02',
  ports: [{
    portNumber: '1/1/1',
    portMac: '20:00:00:00:00:02',
    vlans: [{ id: 111, name: '' }],
    untaggedVlan: null,
    mismatchedVlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
    mismatchedUntaggedVlan: null,
    connectedDevice: {
      mac: '10:00:00:00:00:01',
      portMac: '10:00:00:00:00:01',
      name: 'Switch 1',
      type: 'Bridge, Router',
      isAP: false,
      port: '1/1/1',
      description: 'Unknown',
      vlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
      untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' }
    }
  }]
}]

const response = (data: ImpactedSwitch[] = [
  ...sample1,
  ...sample2,
  ...sample3
]) => ({
  incident: {
    impactedSwitchVLANs: data
  }
})

describe('ImpactedSwitchVLANsTable', () => {
  beforeEach(() => store.dispatch(dataApi.util.resetApiState()))

  const getSlide = async (index: number) => (await screen.findByTestId(`carousel-slide-${index}`))

  const ensureSlideIs = async (index: number, state: 'visible' | 'hidden') =>
    waitFor(async () => expect(await getSlide(index))
      .toHaveAttribute('data-visible', String(state === 'visible')))

  it('should render', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response() })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(within(rows[2]).getAllByRole('cell')[1].textContent).toMatch('Sol-DBlade-System')
  })

  it('should hide chart when under druidRollup', async () => {
    jest.mocked(mockOverlapsRollup).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response() })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    await screen.findByText('Data granularity at this level is not available')
    jest.mocked(mockOverlapsRollup).mockReturnValue(false)
  })

  it('click row on table navigate to correct slide', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response() })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')

    await ensureSlideIs(0, 'visible')
    await ensureSlideIs(2, 'hidden')
    await click(rows[2])
    await ensureSlideIs(2, 'visible')
    await ensureSlideIs(0, 'hidden')
  })

  it('navigate with carousel arrow', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response() })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    const prev = await screen.findByTestId('carousel-prev-button')
    const next = await screen.findByTestId('carousel-next-button')

    await ensureSlideIs(0, 'visible')
    await ensureSlideIs(1, 'hidden')

    await click(next)
    await ensureSlideIs(1, 'visible')
    await ensureSlideIs(0, 'hidden')

    await click(prev)
    await ensureSlideIs(0, 'visible')
    await ensureSlideIs(1, 'hidden')
  })

  it('render slide without any matched VLANs', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response(sample5) })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    expect(await screen.findByText('No matched VLANs')).toBeVisible()
  })

  it('render popover table', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response() })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    const slide = within(await getSlide(0))
    const buttons = await slide.findAllByRole('button', { name: 'More details' })
    expect(buttons).toHaveLength(2)

    await click(buttons[0])

    const popover = await screen.findByRole('tooltip')
    expect(popover).toBeInTheDocument()

    const tbody = within(await findTBody(popover))
    expect(await tbody.findAllByRole('row')).toHaveLength(2)
  })

  it('handle ID_NAME_LIST_MISMATCHED to show footnote in popover', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response(sample4) })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    const slide = within(await getSlide(0))
    const buttons = await slide.findAllByRole('button', { name: 'More details' })
    expect(buttons).toHaveLength(2)

    await click(buttons[0])

    const popover = await screen.findByRole('tooltip')
    expect(popover).toBeInTheDocument()

    expect(screen.queryAllByText('99999')).toHaveLength(0)

    expect(await within(popover).findByText(/some VLANs could be missing/)).toBeInTheDocument()
  })

  it('close popover by clicking outside', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response() })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    const slide = within(await getSlide(0))
    const buttons = await slide.findAllByRole('button', { name: 'More details' })
    expect(buttons).toHaveLength(2)

    await click(buttons[0])

    const popover = await screen.findByRole('tooltip')
    expect(popover).toBeInTheDocument()

    await click(document.body)

    expect(popover).not.toBeInTheDocument()
  })

  it('close popover by Escape key', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response() })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    const slide = within(await getSlide(0))
    const buttons = await slide.findAllByRole('button', { name: 'More details' })
    expect(buttons).toHaveLength(2)

    await click(buttons[0])

    const popover = await screen.findByRole('tooltip')
    expect(popover).toBeInTheDocument()

    await keyboard('{Escape}')

    expect(popover).not.toBeInTheDocument()
  })

  it('close popover by CloseIcon', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response() })
    render(<ImpactedSwitchVLANsTable incident={fakeIncidentVlan} />, { wrapper: Provider })

    const slide = within(await getSlide(0))
    const buttons = await slide.findAllByRole('button', { name: 'More details' })
    expect(buttons).toHaveLength(2)

    await click(buttons[0])

    const popover = await screen.findByRole('tooltip')
    expect(popover).toBeInTheDocument()

    await click(await within(popover).findByTestId('CloseSymbol'))

    expect(popover).not.toBeInTheDocument()
  })
})
