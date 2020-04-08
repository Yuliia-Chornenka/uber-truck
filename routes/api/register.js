const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const router = express.Router();

const validate = require('../middleware/valid');
const userValid = require('../../validation-schema/auth');

router.post('/register', validate(userValid.register),
    async (req, res) => {
      try {
        const {email, username, password, position} = req.body;

        const userExist = await User.findOne({email});
        if (userExist) {
          // eslint-disable-next-line max-len
          return res.status(409).json({message: 'This email is already registered'});
        }

        const hashPassword = await bcrypt.hash(password, 18);
        // eslint-disable-next-line max-len
        const user = new User({email, username, password: hashPassword, position});

        await user.save();

        res.status(200).json({message: 'Successfully register'});
      } catch (e) {
        res.status(500).json({
          message: 'Something went wrong. Try again.',
          error: e,
        });
      }
    });


module.exports = router;
