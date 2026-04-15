import { useState } from "react"

export default function FlashcardBuilder({ value, onChange }: any) {

    const [cards, setCards] = useState(value?.data?.cards || [])

    function update(newCards: any) {

        setCards(newCards)

        onChange({

            data: { cards: newCards }

        })

    }

    function add() {

        update([...cards, { front: "", back: "" }])

    }

    function change(i: number, key: string, val: string) {

        const copy = [...cards]

        copy[i][key] = val

        update(copy)

    }

    function remove(i: number) {

        update(cards.filter((_: any, index: number) => index !== i))

    }

    return (

        <div>

            <h3>Flashcards</h3>

            {cards.map((c: any, i: number) => (

                <div key={i}>

                    <input
                        placeholder="front"
                        value={c.front}
                        onChange={(e) => change(i, "front", e.target.value)}
                    />

                    <input
                        placeholder="back"
                        value={c.back}
                        onChange={(e) => change(i, "back", e.target.value)}
                    />

                    <button onClick={() => remove(i)}>delete</button>

                </div>

            ))}

            <button onClick={add}>Add card</button>

        </div>

    )

}