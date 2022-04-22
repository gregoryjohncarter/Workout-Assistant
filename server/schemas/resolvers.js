const { User, Exercise } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (_parent, _args, context) => {
        if (context.user) {
            const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password');
  
            return userData;
        }
        throw new AuthenticationError('You are not logged in.');
    }
    },
    Mutation: {
      addUser: async (_parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
  
        return { token, user };
  
    },
    login: async (_parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
            throw new AuthenticationError('User not found!');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
            throw new AuthenticationError('Incorrect Password!');
        }
  
        const token = signToken(user);
        return { token, user };
    },
    
    saveExercise: async (_parent, { exerciseData }, context) => {
        if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { savedExercises: exerciseData } },
                { new: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError('Please log in.');
    },
    removeExercise: async (_parent, { exerciseId }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedExercises: { exerciseId } } },
                { new: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError('Please log in');
    }
  }
      };
      
      module.exports = resolvers;