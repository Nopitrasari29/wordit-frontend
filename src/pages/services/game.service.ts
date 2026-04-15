const API_URL = "http://localhost:3000/api"

function getToken() {
  return localStorage.getItem("token")
}

/* ================================
   GET ALL GAMES (Explore)
================================ */

export async function getGames(params?: any) {

  const query = new URLSearchParams()

  if (params?.educationLevel) query.append("educationLevel", params.educationLevel)
  if (params?.templateType) query.append("templateType", params.templateType)
  if (params?.search) query.append("search", params.search)
  if (params?.page) query.append("page", params.page)
  if (params?.limit) query.append("limit", params.limit)

  const res = await fetch(`${API_URL}/games?${query.toString()}`)

  const json = await res.json()

  if (!res.ok) throw new Error(json.message)

  return json.data
}

/* ================================
   GET GAME DETAIL
================================ */

export async function getGame(id: string) {

  const res = await fetch(`${API_URL}/games/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  const json = await res.json()

  if (!res.ok) throw new Error(json.message)

  return json.data
}

/* ================================
   GET MY GAMES (Teacher Dashboard)
================================ */

export async function getMyGames() {

  const res = await fetch(`${API_URL}/games/user/my-games`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  const json = await res.json()

  if (!res.ok) throw new Error(json.message)

  return json.data
}

/* ================================
   CREATE GAME
================================ */

export async function createGame(data: any) {

  const res = await fetch(`${API_URL}/games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })

  const json = await res.json()

  if (!res.ok) throw new Error(json.message)

  return json.data
}

/* ================================
   UPDATE GAME
================================ */

export async function updateGame(id: string, data: any) {

  const res = await fetch(`${API_URL}/games/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })

  const json = await res.json()

  if (!res.ok) throw new Error(json.message)

  return json.data
}

/* ================================
   DELETE GAME
================================ */

export async function deleteGame(id: string) {

  const res = await fetch(`${API_URL}/games/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  const json = await res.json()

  if (!res.ok) throw new Error(json.message)

  return json.data
}

/* ================================
   PUBLISH GAME
================================ */

export async function publishGame(id: string) {

  const res = await fetch(`${API_URL}/games/${id}/publish`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  const json = await res.json()

  if (!res.ok) throw new Error(json.message)

  return json.data
}