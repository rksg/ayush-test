describe('dataApiURL', ()=>{
  const OLD_ENV = process.env
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })
  afterEach(()=>{
    process.env = OLD_ENV
  })
  it('should return correct url', ()=>{
    expect(require('./index').dataApiURL)
      .toEqual(
        'http://localhost:3000/api/a4rc/api/rsa-data-api/graphql/analytics')
  })
  it('should return correct url for production', ()=>{
    process.env['NODE_ENV'] = 'production'
    expect(require('./index').dataApiURL)
      .toEqual(
        'https://devalto.ruckuswireless.com/api/a4rc/api/rsa-data-api/graphql/analytics')
  })
})