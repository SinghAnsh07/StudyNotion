const User = require ("../models/User");
const OTP = require ("../models/OTP");
const otpGenerator = require("otp-generator");


//sendOTP
exports.sendOTP = async (req, res) => {

    try{
        //fetch email from requests body
        const { email } = req.body;

        //check if user already exists
        const checkUserPresent = await User.findOne({ email }); 

        //if user already exists
        if (checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }

        //generate otp
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false, 
            specialChars: false,
            alphabets: false,
            lowerCaseAlphabets: false,
        });
        console.log("OTP generated: ", otp);

        //check unique otp or not
        const result = await OTP.findOne({otp:  otp });
        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                alphabets: false,
                lowerCaseAlphabets: false,
            })
        }    

        const otpPayload = {email, otp};

        //create an entry in DB
        const otpBody = await OTP.create(otpPayload);
        console.log("OTP created: ", otpBody);

        //return response success
        return res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        })
    }
    catch(error){
        console.log("Error: ", error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//signup
exports.signUp = async (req, res) => {
    //fetch data from request ki body

    try{
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
        // validate krr lo

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:'Please fill all the fields',
            })
        }
        // 2 password match krlo
        if(password !== confirmPassword){
            return res.status(403).json({
                success:false,
                message:'Passwords do not match',
            });
        }
        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(403).json({
                success:false,
                message:'User already exists',
            });
        }
        //find most recent OTP stored for the user
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        if(recentOTP && recentOTP.otp !== otp){
            return res.status(403).json({
                success:false,
                message:'Invalid OTP',
            });
        }
        //validate OTP
        if(recentOTP.length == 0){
            return res.status(400).json({
                success:false,
                message:'No OTP found',
            });
        }else if (otp !== recentOTP.otp){
            return res.status(403).json({
                success:false,
                message:'Invalid OTP',
            });
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        //entry create in DB

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            contactNumber:null,
            about:null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,
        });
        //return res
        return res.status(201).json({
            success:true,
            message:'User created successfully',
            user,
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered, please try again",
        });
    }
    

}

//login
exports.login = async (req, res) => {
    try {
        //get data from req body
        const {email, password} = req.body;
        // validation data
        if(!email || !password) {
            return res.status(403). json({
                success:false,
                message:'All fields are required, please try again',
            });
        }
        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registrered, please signup first",
            });
        }
        //generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            });
            user.token = token;
            user.password= undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            })

        }
        else {
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }
        
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });
    }
};


//changePassword
//TODO: HOMEWORK
exports.changePassword = async (req, res) => {
    //get data from req body
    //get oldPassword, newPassword, confirmNewPassowrd
    //validation

    //update pwd in DB
    //send mail - Password updated
    //return response
}


