import {
  fixedEncodeURIComponent,
  decodeFixedURIComponent,
  encodeURIComponentAndCovertToBase64,
  decodeBase64String
} from './encodeDecodeUtil'

describe('fixedEncodeURIComponent', () => {
  it('Should return encoded string', () => {
    expect(fixedEncodeURIComponent('test~!@#$%^&*()')).toEqual(
      'test%7E%21%2540%2523%2524%2525%255E%2526%2A%28%29'
    )
  })
})
describe('decodeFixedURIComponent', () => {
  it('Should return decoded string', () => {
    expect(decodeFixedURIComponent('test~%21%2540%2523%2524%2525%255E%2526%2A%28%29')).toEqual(
      'test~!@#$%^&*()'
    )
  })
})

describe('encodeURIComponentAndCovertToBase64', () => {
  it('Should return base 64 encoded string', () => {
    expect(
      encodeURIComponentAndCovertToBase64(
        JSON.stringify({ a: 1, b: '~!@#$%^&*()', c: '漢字',d: 'test!@#$%^%^&*()_+' })
      )
    ).toEqual(
      // eslint-disable-next-line max-len
      'JTdCJTIyYSUyMiUzQTElMkMlMjJiJTIyJTNBJTIyfiElNDAlMjMlMjQlMjUlNUUlMjYqKCklMjIlMkMlMjJjJTIyJTNBJTIyJUU2JUJDJUEyJUU1JUFEJTk3JTIyJTJDJTIyZCUyMiUzQSUyMnRlc3QhJTQwJTIzJTI0JTI1JTVFJTI1JTVFJTI2KigpXyUyQiUyMiU3RA=='
    )
  })
})
describe('decodeBase64String', () => {
  it('Should return base 64 encoded string', () => {
    expect(
      JSON.parse(decodeBase64String(
        // eslint-disable-next-line max-len
        'JTdCJTIyYSUyMiUzQTElMkMlMjJiJTIyJTNBJTIyfiElNDAlMjMlMjQlMjUlNUUlMjYqKCklMjIlMkMlMjJjJTIyJTNBJTIyJUU2JUJDJUEyJUU1JUFEJTk3JTIyJTJDJTIyZCUyMiUzQSUyMnRlc3QhJTQwJTIzJTI0JTI1JTVFJTI1JTVFJTI2KigpXyUyQiUyMiU3RA=='
      )
      )).toEqual(
      { a: 1, b: '~!@#$%^&*()', c: '漢字',d: 'test!@#$%^%^&*()_+' }
    )
  })
})