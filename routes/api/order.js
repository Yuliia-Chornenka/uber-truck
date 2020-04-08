const express = require('express');
const Truck = require('../../models/Truck');
const Load = require('../../models/Load');
const router = express.Router();
const auth = require('../middleware/auth');

/*  Search for a truck, when shipper post a load  */
router.post('/orders', auth, async (req, res) => {
  try {
    const {width, height, length, weight} = req.body;

    const truck = await Truck.findOne(
        {'sizes.width': {$gte: width}, 'sizes.height': {$gte: height},
          'sizes.length': {$gte: length}, 'sizes.weight': {$gte: weight},
          'status': 'IS', 'assignedTo': {$ne: null}},
        (error) => {
          if (error) {
            return res.status(500).json({message: 'Failed to find a truck'});
          }
        });

    if (truck) {
      res.json(truck);
    } else {
      res.status(404).json({message: 'Did not find a truck'});
    }
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});

/*  Update a load, when the truck was found/driver change state*/
router.patch('/orders/:id', auth, async (req, res) => {
  try {
    // eslint-disable-next-line max-len
    const {status, state, assignedTo, truckId, truckStatus, logsMessage, logsTime} = req.body;

    const newLogsMessage = {
      message: logsMessage,
      time: logsTime,
    };

    console.log('LOGS:', newLogsMessage);

    const order = await Load.findById(req.params.id, (error) => {
      if (error) {
        return res.status(500).json({message: 'Failed to find a load'});
      }
    });

    order.logs.push(newLogsMessage);

    const updateOrder = await Load.findByIdAndUpdate(req.params.id,
        {'assignedTo': assignedTo, 'status': status, 'state': state,
          'truckId': truckId, 'logs': order.logs}, {new: true}, (error) => {
          if (error) {
            return res.status(500).json({message: 'Failed to update'});
          }
        });

    await Truck.findByIdAndUpdate(truckId,
        {'status': truckStatus}, {new: true}, (error) => {
          if (error) {
            return res.status(500).json({message: 'Failed to update'});
          }
        });

    res.json(updateOrder);
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});

/*  Pagination  */
router.get('/orders/:page/:limit', auth, async (req, res) => {
  try {
    const options = {
      sort: {createdTime: -1},
      page: req.params.page,
      limit: req.params.limit,
    };

    await Load.paginate(
        {assignedTo: req.user.userId}, options, function(error, result) {
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
router.get('/orders/:page/:limit/:status', auth, async (req, res) => {
  try {
    const options = {
      sort: {createdTime: -1},
      page: req.params.page,
      limit: req.params.limit,
    };

    await Load.paginate(
        {assignedTo: req.user.userId, status: req.params.status},
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

router.get('/orders/:id', auth, async (req, res) => {
  try {
    const load = await Load.findById(req.params.id);
    res.json(load);
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


module.exports = router;
