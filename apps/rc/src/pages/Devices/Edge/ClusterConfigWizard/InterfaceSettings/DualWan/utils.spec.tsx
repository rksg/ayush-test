import { getDisplayPortString, getDisplayWanRole } from './utils'


describe('getDisplayPortString', () => {
  it('should return the correct string when given valid inputs', () => {
    expect(getDisplayPortString('Node1', 'Port1')).toBe('Node1 / Port1')
    expect(getDisplayPortString('Node2', 'Port2')).toBe('Node2 / Port2')
  })

  it('should return an empty string when given empty inputs', () => {
    expect(getDisplayPortString('', '')).toBe('')
  })
})

describe('getDisplayWanRole', () => {
  it('should return an empty string for priority 0', () => {
    expect(getDisplayWanRole(0)).toBe('')
  })

  it('should return "Active" for priority 1', () => {
    expect(getDisplayWanRole(1)).toBe('Active')
  })

  it('should return "Backup" for priority other than 0 or 1', () => {
    expect(getDisplayWanRole(2)).toBe('Backup')
    expect(getDisplayWanRole(3)).toBe('Backup')
    expect(getDisplayWanRole(-1)).toBe('Backup')
  })
})