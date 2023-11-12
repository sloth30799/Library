const mongoose = require("mongoose")
const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const { GraphQLError } = require("graphql")
const jwt = require("jsonwebtoken")
const Author = require("./models/Author")
const Book = require("./models/Book")
const User = require("./models/User")

mongoose.set("strictQuery", false)

require("dotenv").config()

const MONGODB_URI = process.env.MONGODB_URI

console.log("connecting to", MONGODB_URI)

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("connected to MongoDB")
    })
    .catch((error) => {
        console.log("error connection to MongoDB:", error.message)
    })

const typeDefs = `
    type Book {
        title: String!
        published: Int!
        author: Author!
        genres: [String!]!
        id: ID!
    }

    type Author {
        name: String!
        born: String
        bookCount: Int!
    }

    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }

    type Token {
        value: String!
    }  

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
        me: User
    }

    type Mutation {
        addBook (
            title: String!,
            author: String!,
            published: Int!,
            genres: [String!]!
        ): Book!

        editAuthor (
            name: String!,
            setBornTo: Int!
        ): Author

        createUser(
            username: String!
            favoriteGenre: String!
        ): User

        login(
            username: String!
            password: String!
        ): Token
    }
`

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            let query = {}

            if (args.author && args.genre) {
                const author = await Author.findOne({ name: args.author })

                query = {
                    author: author._id,
                    genres: args.genre,
                }
            } else if (args.author) {
                const author = await Author.findOne({ name: args.author })

                query = { author: author._id }
            } else if (args.genre) {
                query = { genres: args.genre }
            }

            return await Book.find(query).populate("author")
        },
        allAuthors: async () => Author.find({}),
        me: (root, args, context) => {
            return context.currentUser
        },
    },

    Author: {
        bookCount: async (root) => {
            const books = await Book.find({ author: root._id })
            const bookCount = books.length
            return bookCount
        },
    },

    Mutation: {
        addBook: async (root, args, context) => {
            const currentUser = context.currentUser

            if (!currentUser) {
                throw new GraphQLError("not authenticated", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                })
            }

            if (args.title.length < 5) {
                throw new GraphQLError(
                    "Book title must be at least 3 characters long",
                    {
                        extensions: {
                            code: "BAD_USER_INPUT",
                            invalidArgs: args.title,
                        },
                    }
                )
            }

            if (args.author.length < 4) {
                throw new GraphQLError(
                    "Author name must be at least 3 characters long",
                    {
                        extensions: {
                            code: "BAD_USER_INPUT",
                            invalidArgs: args.author,
                        },
                    }
                )
            }

            const book = new Book({ ...args })

            const authorExist = await Author.findOne({ name: args.author })

            if (!authorExist) {
                const author = new Author({
                    name: args.author,
                    born: null,
                })

                const savedAuthor = await author.save()
                book.author = savedAuthor._id
            } else {
                book.author = authorExist._id
            }

            const savedBook = await book.save()

            return savedBook
        },

        editAuthor: async (root, args, context) => {
            const currentUser = context.currentUser

            if (!currentUser) {
                throw new GraphQLError("not authenticated", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                })
            }

            const author = Author.find({ name: args.name })
            if (!author) {
                return null
            }

            const updatedAuthor = await Author.findOneAndUpdate(
                { name: args.name },
                {
                    $set: { born: args.setBornTo },
                },
                {
                    returnDocument: "after",
                }
            )

            return updatedAuthor
        },

        createUser: async (root, args) => {
            const user = new User({ ...args })

            return user.save().catch((error) => {
                throw new GraphQLError("Creating the user failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.username,
                        error,
                    },
                })
            })
        },

        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || args.password !== "secret") {
                throw new GraphQLError("wrong credentials", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                })
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null

        if (auth && auth.startsWith("Bearer ")) {
            const decodedToken = jwt.verify(
                auth.substring(7),
                process.env.JWT_SECRET
            )

            const currentUser = await User.findById(decodedToken.id)

            return { currentUser }
        }
    },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
})
