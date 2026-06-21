export default function (bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return {
      val: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)),
      sizes: sizes[i]
  }
}
