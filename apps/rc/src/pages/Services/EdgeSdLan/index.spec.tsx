import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }               from '@acx-ui/store'
import { render, screen }         from '@acx-ui/test-utils'

import { AddEdgeSdLan, EdgeSdLanDetail, EdgeSdLanTable, EditEdgeSdLan } from '.'

jest.mock('./P1/AddEdgeSdLan', () => () => {
  return <div data-testid='AddEdgeSdLan' />
})
jest.mock('./P1/EditEdgeSdLan', () => () => {
  return <div data-testid='EditEdgeSdLan' />
})
jest.mock('./P1/EdgeSdLanTable', () => () => {
  return <div data-testid='EdgeSdLanTable' />
})
jest.mock('./P1/EdgeSdLanDetail', () => () => {
  return <div data-testid='EdgeSdLanDetail' />
})

jest.mock('./P2/AddEdgeSdLan', () => () => {
  return <div data-testid='AddEdgeSdLanP2' />
})
jest.mock('./P2/EditEdgeSdLan', () => () => {
  return <div data-testid='EditEdgeSdLanP2' />
})
jest.mock('./P2/EdgeSdLanTable', () => () => {
  return <div data-testid='EdgeSdLanTableP2' />
})
jest.mock('./P2/EdgeSdLanDetail', () => () => {
  return <div data-testid='EdgeSdLanDetailP2' />
})

jest.mock('./multiVenue/AddEdgeSdLan', () => () => {
  return <div data-testid='AddEdgeMvSdLan' />
})
jest.mock('./multiVenue/EditEdgeSdLan', () => () => {
  return <div data-testid='EditEdgeMvSdLan' />
})
jest.mock('./multiVenue/EdgeSdLanTable', () => () => {
  return <div data-testid='EdgeMvSdLanTable' />
})
jest.mock('./multiVenue/EdgeSdLanDetail', () => () => {
  return <div data-testid='EdgeMvSdLanDetail' />
})

describe('All enabled', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))

  it('should navigate to create multi-venue Edge SD-LAN page', async () => {
    render(<Provider><AddEdgeSdLan /></Provider>)
    expect(screen.getByTestId('AddEdgeMvSdLan')).toBeVisible()
  })
  it('should navigate to edit multi-venue Edge SD-LAN page', async () => {
    render(<Provider><EditEdgeSdLan /></Provider>)
    expect(screen.getByTestId('EditEdgeMvSdLan')).toBeVisible()
  })
  it('should navigate to Edge multi-venue SD-LAN list page', async () => {
    render(<Provider><EdgeSdLanTable /></Provider>)
    expect(screen.getByTestId('EdgeMvSdLanTable')).toBeVisible()
  })
  it('should navigate to Edge SD-LAN P2 detail page', async () => {
    render(<Provider><EdgeSdLanDetail /></Provider>)
    expect(screen.getByTestId('EdgeMvSdLanDetail')).toBeVisible()
  })
})

describe('Only P1 enabled', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockImplementation(flag =>
    flag === Features.EDGES_TOGGLE || flag === Features.EDGES_SD_LAN_TOGGLE
  ))

  it('should navigate to create Edge SD-LAN P1 page', async () => {
    render(<Provider><AddEdgeSdLan /></Provider>)
    expect(screen.getByTestId('AddEdgeSdLan')).toBeVisible()
  })

  it('should navigate to edit Edge SD-LAN P1 page', async () => {
    render(<Provider><EditEdgeSdLan /></Provider>)
    expect(screen.getByTestId('EditEdgeSdLan')).toBeVisible()
  })
  it('should navigate to Edge SD-LAN P1 list page', async () => {
    render(<Provider><EdgeSdLanTable /></Provider>)
    expect(screen.getByTestId('EdgeSdLanTable')).toBeVisible()
  })
  it('should navigate to Edge SD-LAN P1 detail page', async () => {
    render(<Provider><EdgeSdLanDetail /></Provider>)
    expect(screen.getByTestId('EdgeSdLanDetail')).toBeVisible()
  })
})

describe('Only P2 enabled', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockImplementation(flag =>
    flag === Features.EDGES_TOGGLE || flag === Features.EDGES_SD_LAN_HA_TOGGLE
  ))

  it('should navigate to create Edge SD-LAN P2 page', async () => {
    render(<Provider><AddEdgeSdLan /></Provider>)
    expect(screen.getByTestId('AddEdgeSdLanP2')).toBeVisible()
  })
  it('should navigate to edit Edge SD-LAN P2 page', async () => {
    render(<Provider><EditEdgeSdLan /></Provider>)
    expect(screen.getByTestId('EditEdgeSdLanP2')).toBeVisible()
  })
  it('should navigate to Edge SD-LAN P2 list page', async () => {
    render(<Provider><EdgeSdLanTable /></Provider>)
    expect(screen.getByTestId('EdgeSdLanTableP2')).toBeVisible()
  })
  it('should navigate to Edge SD-LAN P2 detail page', async () => {
    render(<Provider><EdgeSdLanDetail /></Provider>)
    expect(screen.getByTestId('EdgeSdLanDetailP2')).toBeVisible()
  })
})

describe('P1 & P2 enabled', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockImplementation(flag =>
    flag === Features.EDGES_TOGGLE || flag === Features.EDGES_SD_LAN_HA_TOGGLE
      || flag === Features.EDGES_SD_LAN_TOGGLE
  ))

  it('should navigate to create Edge SD-LAN P2 page', async () => {
    render(<Provider><AddEdgeSdLan /></Provider>)
    expect(screen.getByTestId('AddEdgeSdLanP2')).toBeVisible()
  })
  it('should navigate to edit Edge SD-LAN P2 page', async () => {
    render(<Provider><EditEdgeSdLan /></Provider>)
    expect(screen.getByTestId('EditEdgeSdLanP2')).toBeVisible()
  })
  it('should navigate to Edge SD-LAN P2 list page', async () => {
    render(<Provider><EdgeSdLanTable /></Provider>)
    expect(screen.getByTestId('EdgeSdLanTableP2')).toBeVisible()
  })
  it('should navigate to Edge SD-LAN P2 detail page', async () => {
    render(<Provider><EdgeSdLanDetail /></Provider>)
    expect(screen.getByTestId('EdgeSdLanDetailP2')).toBeVisible()
  })
})

describe('All NOT enabled', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(false))

  it('should navigate to create multi-venue Edge SD-LAN page', async () => {
    render(<Provider><AddEdgeSdLan /></Provider>)
    expect(screen.queryByTestId('AddEdgeMvSdLan')).toBe(null)
    expect(screen.queryByTestId('AddEdgeSdLanP2')).toBe(null)
    expect(screen.queryByTestId('AddEdgeSdLanP1')).toBe(null)
  })
  it('should navigate to edit multi-venue Edge SD-LAN page', async () => {
    render(<Provider><EditEdgeSdLan /></Provider>)
    expect(screen.queryByTestId('EditEdgeMvSdLan')).toBe(null)
    expect(screen.queryByTestId('EditEdgeSdLanP2')).toBe(null)
    expect(screen.queryByTestId('EditEdgeSdLanP1')).toBe(null)
  })
  it('should navigate to Edge SD-LAN P2 list page', async () => {
    render(<Provider><EdgeSdLanTable /></Provider>)
    expect(screen.queryByTestId('EdgeMvSdLanTable')).toBe(null)
    expect(screen.queryByTestId('EdgeSdLanTableP2')).toBe(null)
    expect(screen.queryByTestId('EdgeSdLanTableP1')).toBe(null)
  })
  it('should navigate to Edge SD-LAN P2 detail page', async () => {
    render(<Provider><EdgeSdLanDetail /></Provider>)
    expect(screen.queryByTestId('EdgeSdLanDetailP2')).toBe(null)
    expect(screen.queryByTestId('EdgeSdLanDetailP1')).toBe(null)
  })
})