import { replaceStrings } from './replaceStrings'

describe('replaceStrings', () => {
  it('convert template correctly', () => {
    expect(replaceStrings(undefined, {})).toEqual('')
    expect(replaceStrings('', {})).toEqual('')
    expect(replaceStrings('without template', {})).toEqual('without template')
    expect(replaceStrings('with @@template', {})).toEqual('-')
    expect(replaceStrings('with @@template', undefined)).toEqual('-')
    expect(replaceStrings('with @@template', { template: 'value' })).toEqual('with value')
    expect(replaceStrings('with %%template', { template: 'value' })).toEqual('with value')
    expect(replaceStrings('with @@template1, %%template2, and @@template3', {
      template1: 'value1',
      template2: 'value2',
      template3: 'value3'
    })).toEqual('with value1, value2, and value3')
    expect(replaceStrings('@@apName & @@apName2, @@ xxx', {
      apName: 'AP 1',
      apName2: 'AP 2'
    })).toEqual('AP 1 & AP 2, @@ xxx')
  })

  it('convert template with custom callback', () => {
    const data = {
      apName: 'AP 1'
    }
    const template = replaceStrings('@@apName', data, (key) => `<b>${data[key]}</b>`)
    expect(template).toEqual('<b>AP 1</b>')
  })
})
