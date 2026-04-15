import { startSession, finishSession } from "./GamePlayController"

class GameSessionController {

    session: any = null

    async start(gameId: string) {

        this.session = await startSession(gameId)

        return this.session

    }

    async finish(result: any) {

        if (!this.session) return

        await finishSession(this.session.id, result)

    }

}

export default new GameSessionController()