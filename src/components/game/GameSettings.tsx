type Settings = {
    timer: number
    shuffle: boolean
    attempts: number
}

type Props = {
    settings: Settings
    setSettings: (s: Settings) => void
}

export default function GameSettings({ settings, setSettings }: Props) {

    return (

        <div className="border p-4 rounded-xl bg-gray-50">

            <h3 className="font-bold mb-4">

                Game Settings

            </h3>

            <div className="mb-3">

                <label className="block text-sm mb-1">

                    Timer per Question

                </label>

                <input
                    type="number"
                    className="border p-2 w-full rounded"
                    value={settings.timer}
                    onChange={(e) =>
                        setSettings({
                            ...settings,
                            timer: Number(e.target.value)
                        })
                    }
                />

            </div>

            <div className="mb-3">

                <label className="flex gap-2 items-center">

                    <input
                        type="checkbox"
                        checked={settings.shuffle}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                shuffle: e.target.checked
                            })
                        }
                    />

                    Shuffle Questions

                </label>

            </div>

            <div>

                <label className="block text-sm mb-1">

                    Max Attempts

                </label>

                <input
                    type="number"
                    className="border p-2 w-full rounded"
                    value={settings.attempts}
                    onChange={(e) =>
                        setSettings({
                            ...settings,
                            attempts: Number(e.target.value)
                        })
                    }
                />

            </div>

        </div>

    )

}