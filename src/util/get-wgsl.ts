export async function get_wgsl(url: string) {
  const resp = await fetch(url)
  return await resp.text()
}