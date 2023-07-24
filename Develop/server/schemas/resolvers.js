const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async function (parent, args, context) {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("book");
        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
    users: async function () {
      return User.find().select("-__v -password").populate("book");
    },
    user: async function (parent, { username }) {
      return User.findOne({ username })
        .select("-__v -password")
        .populate("book");
    },
  },

  Mutation: {
    login: async function (parent, { email, password }) {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user);
      return { token: token, user: user };
    },

    addUser: async function (parent, args) {
      const user = await User.create(args);
      const token = signToken(user);
      return { token: token, user: user };
    },

    saveBook: async function (parent, { bookInput }, context) {
      console.log(context.user);
      console.log(bookInput);
      if (context.user) {
        const book = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookInput } },
          { new: true }
        );
        return book;
      }
      throw new AuthenticationError("You need to be logged in!");
    },

    removeBook: async function (parent, args, context) {
      console.log(args);
      if (context.user) {
        const book = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: args } },
          { new: true }
        );
        return book;
      }
      throw new AuthenticationError("You need to be logged in!");
    },

    removeBook: async function (parent, args, context) {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
