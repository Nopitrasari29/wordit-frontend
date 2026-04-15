export function autoSave(key: string, data: any) {

    localStorage.setItem(key, JSON.stringify(data))

}

export function loadAutoSave(key: string) {

    const saved = localStorage.getItem(key)

    if (!saved) return null

    return JSON.parse(saved)

}

export function clearAutoSave(key: string) {

    localStorage.removeItem(key)

}