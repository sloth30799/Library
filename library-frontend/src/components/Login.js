import { useMutation } from "@apollo/client"
import { useEffect, useState } from "react"
import { LOGIN } from "../queries"
import { useNavigate } from "react-router-dom"

const Login = ({ token, setToken }) => {
    const [login, result] = useMutation(LOGIN)
    const navigate = useNavigate()

    useEffect(() => {
        if (result.data) {
            const resultToken = result.data.login.value
            console.log(
                "🚀 ~ file: Login.js:11 ~ useEffect ~ resultToken:",
                token
            )

            setToken(resultToken)

            localStorage.setItem("library-user-token", resultToken)
        }
    }, [result.data])

    const handleLogin = (event) => {
        event.preventDefault()

        const username = event.target.name.value
        const password = event.target.password.value

        login({ variables: { username, password } })

        navigate("/add")
    }

    return (
        <form onSubmit={handleLogin}>
            <div>
                name
                <input type="text" name="name" />
            </div>
            <div>
                password
                <input type="password" name="password" />
            </div>
            <button>login</button>
        </form>
    )
}

export default Login
