export interface Comment {
  id: string
  postId: string
  userId: string
  username: string
  avatar: string | null
  content: string
  createdAt: string
}

export async function getComments(postId: string): Promise<Comment[]> {
  const res = await fetch(`/api/posts/${postId}/comments`)
  if (!res.ok) throw new Error("Erreur lors du chargement des commentaires")
  return res.json()
}

export async function addComment(postId: string, content: string, token: string): Promise<Comment> {
  const res = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error("Erreur lors de l'envoi du commentaire")
  return res.json()
}
