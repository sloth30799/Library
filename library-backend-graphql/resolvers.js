const { PubSub } = require("graphql-subscriptions")
const pubsub = new PubSub()
const { GraphQLError } = require("graphql")
const Author = require("./models/Author")
const Book = require("./models/Book")
const User = require("./models/User")

const resolvers = {
    Query: {
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
        allAuthors: async () => {
            const authors = await Author.find({})

            const books = await Book.find({}).populate("author")

            const authorWithBookCount = books.reduce((t, b) => {
                if (Object.hasOwn(t, b.author.name)) {
                    t[b.author.name] += 1
                } else {
                    t[b.author.name] = 1
                }

                return t
            }, {})

            const finalAuthors = authors.map((a) => {
                return {
                    name: a.name,
                    born: a.born,
                    bookCount: authorWithBookCount[a.name],
                }
            })

            return finalAuthors
        },
        me: (root, args, context) => {
            return context.currentUser
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
                book.author = authorExist
            }

            const bookAdded = await book.save()

            pubsub.publish("BOOK_ADDED", { bookAdded })

            return bookAdded
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

    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
        },
    },
}

module.exports = resolvers
