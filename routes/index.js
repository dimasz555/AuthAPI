const express = require("express"),
  router = express.Router(),
  // authRouter = require("./auth.router"),
  controller = require('../controllers/auth.controller')

const { users } = require('../models');


// router.use("/auth", authRouter);


router.get('/login', async (req,res) => {
  return res.render('login')
})
router.get('/register', async (req,res) => {
  return res.render('register')
})
router.get('/reset-password', async (req,res) => {
  return res.render('reset-password')
})
router.get('/set-password/:key', async (req, res) => {
  try {
      console.log(req.params.key)
      const findData = await users.findFirst({
          where: {
              resetPasswordToken: req.params.key
          }
      })
      if(!findData) {
          return res.render('error')
      }

      return res.render('set-password', { user: findData});
  } catch (error) {
      console.log(error)
      return res.render('error')
  }
  
});

router.get('/welcome', async (req,res) => {
  return res.render('welcome') 
})



router.post('/api/v1/auth/register',controller.register);
router.post('/api/v1/auth/login', controller.login);
router.post('/api/v1/reset-password', controller.resetPassword);
router.post('/api/v1/set-password', controller.setPassword);

module.exports = router;
