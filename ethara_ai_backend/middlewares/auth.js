const jwt = require('jsonwebtoken')
require("dotenv").config()

// auth , isAdmin , isStudent

exports.auth = (req, res, next) => {

    try {

        // HTTP headers are case-insensitive --> authorization or Authorization [ title case is prefer ]

        //Think --> console.log( req.headers['Authorization'] ) -> title case must be work :(

        const token = req.cookies.token || req.headers['authorization'].split(' ')[1];

        if (!token || token === undefined) {
            return res.status(401).json({ success: false, message: `Please provide the token!` })
        }


        // know --> you can also use callback function  instead of try catch block
        try {
            const userInfo = jwt.verify(token, process.env.JWT_SECRECT_KEY);

            // send user information to the upcoming middleware
            req.userInfo = userInfo;

        } catch (err) {
            console.log(err, 'jwt verification  , auth middleware!')
            return res.status(400).json({
                success: false,
                message: `You are not authenticate! ${err.message}`
            })
        }

        next();


    } catch (error) {
        console.log(error, 'error in auth middleware');
        return res.status(400).json({ success: false, message: 'you are not authenticate person!' })
    }
};