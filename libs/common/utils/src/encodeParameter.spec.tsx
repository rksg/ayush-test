import { fixedEncodeURIComponent, encodeParameter } from './encodeParameter'

describe('fixedEncodeURIComponent', () => {
  it('Should return encoded string', () => {
    expect(fixedEncodeURIComponent('test~!@#$%^&*()'))
      .toEqual('test~%21%40%23%24%25%5E%26%2A%28%29')
  })
})
describe('encodeParameter', () => {
  it('encodes a value', () => {
    expect(encodeParameter<{ value: string }>({ value: 'test~!@#$%^&*()' }))
      .toEqual('%7B%22value%22%3A%22test~%21%40%23%24%25%5E%26%2A%28%29%22%7D')
  })
})
