export const cleanseColumn = (str: string) => {
  if (str) {
    str = str.replace(/[. \- %()#&>]/g, '_')
    const rex = new RegExp('^[0-9]')
    str = rex.test(str) ? `_${str}` : str
  }
  return str
}
