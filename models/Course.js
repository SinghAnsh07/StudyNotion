const mongoose = require("mongoose");

const courseSchemea = new mongoose.Schema({
    courseName:{
        type:String,
        time:true,
    },
    courseDescription:{
        type:String,
        time:true,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    WhatYouWillLearn:{
        type:String,
        time:true,
    },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section",

        }
    ],
    ratingandReviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview",
        }
    ],
    price:{
        type:Number,
        required:true,
    },
    thumbnail:{
        type:String,

    },
    tag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tag",
    },
    studentsEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }
    ]
});

module.exports = mongoose.model("Course", courseSchemea);