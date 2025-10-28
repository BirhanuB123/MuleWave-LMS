const Payment = require('../models/Payment');
const Course = require('../models/Course');
const paypal = require('../config/paypal');

// @desc    Create PayPal payment
// @route   POST /api/payments/create
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Get course details
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create payment object
    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
      },
      transactions: [{
        item_list: {
          items: [{
            name: course.title,
            sku: course._id.toString(),
            price: course.price.toFixed(2),
            currency: 'USD',
            quantity: 1
          }]
        },
        amount: {
          currency: 'USD',
          total: course.price.toFixed(2)
        },
        description: `Enrollment in ${course.title}`
      }]
    };

    paypal.payment.create(create_payment_json, async (error, payment) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: 'Error creating PayPal payment'
        });
      } else {
        // Save payment to database
        const newPayment = await Payment.create({
          user: req.user.id,
          course: courseId,
          amount: course.price,
          paymentMethod: 'paypal',
          status: 'pending'
        });

        // Get approval URL
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            return res.status(200).json({
              success: true,
              data: {
                paymentId: newPayment._id,
                approvalUrl: payment.links[i].href
              }
            });
          }
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Execute PayPal payment
// @route   POST /api/payments/execute
// @access  Private
exports.executePayment = async (req, res) => {
  try {
    const { paymentId, PayerID, paymentDbId } = req.body;

    const execute_payment_json = {
      payer_id: PayerID
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error(error.response);
        
        // Update payment status to failed
        await Payment.findByIdAndUpdate(paymentDbId, {
          status: 'failed'
        });

        return res.status(500).json({
          success: false,
          message: 'Error executing PayPal payment'
        });
      } else {
        // Update payment status to completed
        const updatedPayment = await Payment.findByIdAndUpdate(
          paymentDbId,
          {
            status: 'completed',
            paypalPaymentId: paymentId,
            paypalPayerId: PayerID
          },
          { new: true }
        );

        res.status(200).json({
          success: true,
          data: updatedPayment
        });
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

