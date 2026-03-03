export async function uploadFile(file: File, token: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message ?? "Erreur lors du téléversement")
  }

  const data = await res.json() as { url: string }
  return data.url
}
