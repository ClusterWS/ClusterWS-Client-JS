export function logError<T>(data: T): any {
  return console.log(data)
}

export function uint8ArrayToString(buffer: any): string {
  let result: string = ''
  let addition: number = 65535
  const length: number = buffer.length
  for (let i: number = 0; i < length; i += addition) {
    if (i + addition > length)
      addition = length - i
    result += String.fromCharCode.apply(null, buffer.subarray(i, i + addition))
  }
  return result
}

export function stringToArrayBuffer(str: string): any {
  const length: number = str.length
  const uint: any = new Uint8Array(length)
  for (let i: number = 0; i < length; i++) uint[i] = str.charCodeAt(i)
  return uint.buffer
}