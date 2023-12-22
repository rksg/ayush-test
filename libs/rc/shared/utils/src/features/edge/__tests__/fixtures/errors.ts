export const mockValidationFailedDataWithDefinedCode = {
  errors: [{
    code: 'EDGE-10104',
    message: 'Insufficient licenses for tenant {0} to add new edge'
  }],
  requestId: 'test'
}

export const mockValidationFailedDataWithUndefinedCode = {
  errors: [{
    code: 'test123',
    message: 'Undefined message'
  }],
  requestId: 'test'
}