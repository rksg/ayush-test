import { replaceStrings } from './replaceStrings'

describe('replaceStrings', () => {
  it('convert template correctly', () => {
    expect(replaceStrings(undefined, {})).toEqual('')
    expect(replaceStrings('without template', {})).toEqual('without template')
    expect(replaceStrings('with @@template', {})).toEqual('with ')
    expect(replaceStrings('with @@template', { template: 'value' })).toEqual('with value')
    expect(replaceStrings('with %%template', { template: 'value' })).toEqual('with value')
    expect(replaceStrings('with @@template1, %%template2, and @@template3', {
      template1: 'value1',
      template2: 'value2',
      template3: 'value3'
    })).toEqual('with value1, value2, and value3')
  })
})
