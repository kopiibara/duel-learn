const express = require('express')
const router = express.Router()
const cors = require('cors')
const passport = require('passport');

const {test, signUpUser, loginUser, getProfile} = require('../controllers/authController')

router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
)

router.get('/' , test)
router.post('/sign-up', signUpUser)
router.post('/login', loginUser)
router.get('/welcome', getProfile)




module.exports = router