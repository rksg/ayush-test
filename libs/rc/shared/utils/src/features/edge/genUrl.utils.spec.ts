import { getUrl, Device, CommonOperation, CommonCategory, activeTab, activeSubTab } from './genUrl.utils'

describe('genUrl util', () => {
  it('should gen list url with default category correctly', () => {
    const result = getUrl({
      feature: Device.Edge,
      oper: CommonOperation.List
    })
    expect(result).toBe('/devices/edge/list')
  })
  it('should gen add url with default category correctly', () => {
    const result = getUrl({
      feature: Device.Edge,
      oper: CommonOperation.Add
    })
    expect(result).toBe('/devices/edge/add')
  })
  it('should gen edit url with default category correctly', () => {
    const result = getUrl({
      feature: Device.Edge,
      oper: CommonOperation.Edit,
      params: { id: 'testId' }
    })
    expect(result).toBe('/devices/edge/testId/edit')
  })
  it('should gen detail url with default category correctly', () => {
    const result = getUrl({
      feature: Device.Edge,
      oper: CommonOperation.Detail,
      params: { id: 'testId' }
    })
    expect(result).toBe('/devices/edge/testId/details')
  })
  it('should gen list url with given category correctly', () => {
    const result = getUrl({
      category: CommonCategory.Policy,
      feature: Device.Edge,
      oper: CommonOperation.Detail,
      params: { id: 'testId' }
    })
    expect(result).toBe('/policy/edge/testId/details')
  })
  it('should add extra path before correctly', () => {
    const result = getUrl({
      feature: Device.Edge,
      oper: CommonOperation.Detail,
      before: ['test'],
      params: { id: 'testId' }
    })
    expect(result).toBe('/test/devices/edge/testId/details')
  })
  it('should add extra path after correctly', () => {
    const result = getUrl({
      feature: Device.Edge,
      oper: CommonOperation.Detail,
      after: [activeTab, activeSubTab],
      params: { id: 'testId', activeTab: 'testActiveTab', activeSubTab: 'testActiveSubTab' }
    })
    expect(result).toBe('/devices/edge/testId/details/testActiveTab/testActiveSubTab')
  })
  it('should change id key correctly', () => {
    const result = getUrl({
      feature: Device.Edge,
      oper: CommonOperation.Detail,
      idKey: 'testIdKey',
      params: { testIdKey: 'testId' }
    })
    expect(result).toBe('/devices/edge/testId/details')
  })
})