const express = require('express');
const router = express.Router();
const userOtp = require('../model/userOtp');
const {sendOTP} = require('../utils/otp');

router.post('/sendotp',async(req,res)=>{
    const {phone} = req.body;

    const otp =Math.floor(100000 + Math.random() * 900000).toString();

    try{
        const user = await userOtp.findOneAndUpdate(
            {phone},
            {otp,otpExpiration:Date.now() + 600000},
            {upsert:true,new:true}
        )

        await sendOTP(phone,otp);

        res.status(200).json({success: true, message:"OTP sent successfully"})
    }catch(error){
        console.error('error sending otp',error);
        res.status(500).json({success:false, message:'failed to send'})
    }
})

router.post('/verifyotp',async(req,res)=>{
    const {phone,otp} = req.body;

    try{
        const user = await userOtp.findOne({phone,otp});

        if(!user || user.otpExpiration < Date.now()){
            return res.status(400).json({success:false,message:'invalid OTP'})
        }

        user.otp = undefined;
        user.otpExpiration = undefined;
        await user.save();

        res.status(200).json({success:true,message:'OTP verified successfully'});
    }catch(error){
        console.error('Error verifying OTP',error);
        res.status(500).json({success:false,message:'failed to verify'})
    }
})

module.exports = router;