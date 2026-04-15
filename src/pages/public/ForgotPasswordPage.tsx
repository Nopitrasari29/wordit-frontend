import { useState } from "react"
import { Link } from "react-router-dom"

export default function ForgotPasswordPage() {

    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")

    function submit(e: any) {

        e.preventDefault()

        setMessage("If the email exists, reset instructions will be sent.")

    }

    return (

        <div style={{ maxWidth: 400, margin: "auto" }}>

            <h1>Forgot Password</h1>

            <form onSubmit={submit}>

                <input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button type="submit">

                    Send Reset Link

                </button>

            </form>

            {message && <p>{message}</p>}

            <div style={{ marginTop: 20 }}>

                <Link to="/login">

                    Back to Login

                </Link>

            </div>

        </div>

    )
}