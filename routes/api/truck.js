const express = require('express');
const Truck = require('../../models/Truck');
const router = express.Router();
const auth = require('../middleware/auth');


router.post('/trucks', auth, async (req, res) => {
  try {
    const {assignedTo, status, type, sizes} = req.body;
    const createdBy = req.user.userId;

    const truck = new Truck({createdBy, assignedTo, status, type, sizes});

    await truck.save();

    res.status(200).json({message: 'Successfully created new truck'});
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again.',
      error: e,
    });
  }
});


router.delete('/trucks/:type', auth, async (req, res) => {
  try {
    await Truck.findOneAndDelete(
        {type: req.params.type, createdBy: req.user.userId},
        (error) => {
          if (error) {
            return res.status(500).json({message: 'Failed to delete'});
          }
        });

    res.json('Successfully delete a truck');
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


router.get('/trucks', auth, async (req, res) => {
  try {
    const trucks = await Truck.find({createdBy: req.user.userId});
    res.json(trucks);
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


router.patch('/trucks', auth, async (req, res) => {
  if (req.body.assignedTo) {
    try {
      await Truck.findOneAndUpdate(
          {type: req.body.type, createdBy: req.user.userId},
          {assignedTo: req.user.userId}, {new: true}, (error) => {
            if (error) {
              // eslint-disable-next-line max-len
              return res.status(500).json({message: 'Failed to update assign status'});
            }
          });
      res.json({message: 'Assign status has has been changed'});
    } catch (e) {
      res.status(500).json({message: 'Something went wrong. Try again later'});
    }
  } else if (req.body.assignedTo === null) {
    try {
      await Truck.findOneAndUpdate(
          {type: req.body.type, createdBy: req.user.userId},
          {assignedTo: null}, {new: true}, (error) => {
            if (error) {
              // eslint-disable-next-line max-len
              return res.status(500).json({message: 'Failed to update assign status'});
            }
          });
      res.json({message: 'Assign status has has been changed'});
    } catch (e) {
      res.status(500).json({
        message: 'Something went wrong. Try again later',
        error: e,
      });
    }
  }
});


module.exports = router;
