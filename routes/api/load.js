const express = require('express');
const Load = require('../../models/Load');
const router = express.Router();
const auth = require('../middleware/auth');

const validate = require('../middleware/valid');
const loadValid = require('../../validation-schema/load');

/*  Create a load by shipper  */
router.post('/loads', validate(loadValid.load), auth,
    async (req, res) => {
      try {
        // eslint-disable-next-line max-len
        const {createdTime, assignedTo, status, state, payload, dimensions, logs} = req.body;
        const createdBy = req.user.userId;

        const load = new Load({createdBy, createdTime, assignedTo, status,
          state, payload, dimensions, logs});

        await load.save();

        res.json(load);
      } catch (e) {
        res.status(500).json({
          message: 'Something went wrong. Try again.',
          error: e,
        });
      }
    });


/*  Pagination  */
router.get('/loads/:page/:limit', auth, async (req, res) => {
  try {
    const options = {
      sort: {createdTime: -1},
      page: req.params.page,
      limit: req.params.limit,
    };

    await Load.paginate(
        {createdBy: req.user.userId}, options, function(error, result) {
          if (error) {
            // eslint-disable-next-line max-len
            res.status(500).json({message: 'Something went wrong. Try again later.'});
          } else {
            res.json(result);
          }
        });
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});

/*  Filter  */
router.get('/loads/:page/:limit/:status', auth, async (req, res) => {
  try {
    const options = {
      sort: {createdTime: -1},
      page: req.params.page,
      limit: req.params.limit,
    };

    await Load.paginate(
        {createdBy: req.user.userId, status: req.params.status},
        options, function(error, result) {
          if (error) {
            // eslint-disable-next-line max-len
            res.status(500).json({message: 'Something went wrong. Try again later.'});
          } else {
            res.json(result);
          }
        });
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});

/*  Delete a load by shipper  */
router.delete('/loads/:id', auth, async (req, res) => {
  try {
    await Load.findByIdAndDelete(req.params.id, (error) => {
      if (error) {
        return res.status(500).json({message: 'Failed to delete'});
      }
    });

    res.json('Successfully delete a load');
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});

/*  Update a load by shipper  */
router.patch('/loads/:id', auth, async (req, res) => {
  try {
    const {width, height, length, weight} = req.body;

    const updateLoad = await Load.findByIdAndUpdate(req.params.id,
        {'dimensions.width': width, 'dimensions.height': height,
          'dimensions.length': length, 'payload': weight},
        {new: true}, (error) => {
          if (error) {
            return res.status(500).json({message: 'Failed to update'});
          }
        });

    res.json(updateLoad);
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


module.exports = router;
