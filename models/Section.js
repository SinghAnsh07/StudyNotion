const mongoose = require("mongoose");

const sectionSchemea = new mongoose.Schema({
    
    sectionName:{
        type:String,
    },
    subSection:[
        {
            type:mongoose.Schema.Types.ObjectID,
            required:true,
            ref:"subSection",
        }
    ]
});

module.exports = mongoose.model("Section", sectionSchemea);