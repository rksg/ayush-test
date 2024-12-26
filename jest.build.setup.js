require('./jest.setup')
console.info = jest.fn()
console.log = jest.fn()
jest.setTimeout(40000)
