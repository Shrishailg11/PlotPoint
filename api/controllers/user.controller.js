import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';

export const updateUser = async (req, res, next) => {
  try {
    if (!req.user || !req.params.id) {
      return next(errorHandler(401, 'Unauthorized'));
    }

    // compare strings
    if (req.user.id.toString() !== req.params.id.toString()) {
      return next(errorHandler(401, 'You can only update your own account!'));
    }

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return next(errorHandler(404, 'User not found'));
    }

    const updates = {};

    // Check username - allow empty strings
    if (req.body.hasOwnProperty('username') && req.body.username !== existingUser.username) {
      // Only check for uniqueness if username is not empty
      if (req.body.username && req.body.username.trim() !== '') {
        const usernameExists = await User.findOne({ 
          username: req.body.username,
          _id: { $ne: req.params.id } 
        });
        if (usernameExists) return next(errorHandler(400, 'Username already taken'));
      }
      updates.username = req.body.username;
    }

    // Check email - allow empty strings
    if (req.body.hasOwnProperty('email') && req.body.email !== existingUser.email) {
      // Only check for uniqueness if email is not empty
      if (req.body.email && req.body.email.trim() !== '') {
        const emailExists = await User.findOne({ 
          email: req.body.email,
          _id: { $ne: req.params.id } 
        });
        if (emailExists) return next(errorHandler(400, 'Email already taken'));
      }
      updates.email = req.body.email;
    }

    // Check password - only update if provided
    if (req.body.hasOwnProperty('password') && req.body.password) {
      updates.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // Check avatar - allow any value including empty string
    if (req.body.hasOwnProperty('avatar') && req.body.avatar !== existingUser.avatar) {
      updates.avatar = req.body.avatar;
    }

    if (Object.keys(updates).length === 0) {
      return next(errorHandler(400, 'No valid fields provided for update'));
    }

    console.log('Updates to apply:', updates); // Debug log

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, 'User update failed'));
    }

    const { password, ...rest } = updatedUser._doc;

    console.log('Updated user:', rest); // Debug log

    // Return only updated user object
    res.status(200).json(rest);

  } catch (error) {
    console.error('Update error:', error); // Debug log
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if(!req.user || !req.params.id) return next(errorHandler(401, "Unauthorized to delete this account"))
  
  // compare strings - ensure user can only delete their own account
  if (req.user.id.toString() !== req.params.id.toString()) {
    return next(errorHandler(401, 'You can only delete your own account!'));
  }
  
  try {
    await User.findByIdAndDelete(req.params.id)
    
    // Clear the authentication cookie after successful deletion
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure flag in production
      sameSite: 'strict'
    });
    
    res.status(200).json({message: "User deleted successfully"})
  } catch (error) {
    next(error);
  }
}