type Props = {
  templateType: string
}

export default function TemplatePreview({ templateType }: Props) {

  return (

    <div className="border rounded-xl p-6 bg-gray-50">

      <h2 className="text-lg font-semibold mb-4">
        Template Preview
      </h2>

      <div className="text-gray-600">

        {templateType === "ANAGRAM" && "Rearrange letters to form words"}
        {templateType === "FLASHCARD" && "Flip cards to learn concepts"}
        {templateType === "HANGMAN" && "Guess the hidden word"}
        {templateType === "MAZE_CHASE" && "Navigate maze to find answers"}
        {templateType === "SPIN_THE_WHEEL" && "Spin wheel to get questions"}
        {templateType === "WORD_SEARCH" && "Find hidden words"}

      </div>

    </div>

  )

}