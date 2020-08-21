export function bigIntToBuffer256(num: bigint): Uint8Array {
  const buffer = new Uint8Array(32)

  for (var i = buffer.length - 1; i >= 0; i--) {
    var byte = num % 256n
    buffer[i] = Number(byte)
    num = (num - byte) / 256n
  }

  return buffer;
}

export function bufferToBigInt(buffer: Uint8Array): bigint {
  let value = 0n
  for (var i = 0; i < buffer.length; i++) {
    value *= 256n
    value = value + BigInt(buffer[i])
  }
  return value
}

export const arrayCompare = (a: Uint8Array | any[], b: Uint8Array | any[]) =>
	a.every((value: any, index: any) => b[index] === value)
