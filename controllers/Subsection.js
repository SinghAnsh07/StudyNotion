const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create SubSection

exports.createSubSection = async (req, res) => {
    try{
            //fecth data from Req body
            const {sectionId, title, timeDuration, description} = req.body;
            //extract file/video
            const video  = req.files.videoFile;
            //validation
            if(!sectionId || !title || !timeDuration || !description || !video) {
                return res.status(400).json({
                    success:false,
                    message:'All fields are required',
                });
            }
            //upload video to cloudinary
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            //create a sub-section
            const subSectionDetails = await SubSection.create({
                title:title,
                timeDuration:timeDuration,
                description:description,
                videoUrl:uploadDetails.secure_url,
            })
            //update section with this sub section ObjectId
            const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                        {$push:{
                                                            subSection:subSectionDetails._id,
                                                        }},
                                                        {new:true});
            //HW: log updated section here, after adding populate query
            //return response
            return res.status(200).json({
                succcess:true,
                message:'Sub Section Created Successfully',
                updatedSection,
            });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message,
        })
    }
};

//HW: updateSubSection
exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, title, description, timeDuration } = req.body;
        const video = req.files?.videoFile;

        // Fetch the existing sub-section
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // If video is provided, upload it and update URL
        if (video) {
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
        }

        // Update text fields if they are provided
        if (title) subSection.title = title;
        if (description) subSection.description = description;
        if (timeDuration) subSection.timeDuration = timeDuration;

        await subSection.save();

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: subSection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update SubSection",
            error: error.message,
        });
    }
};

//HW:deleteSubSection

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;

        // Validate existence
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // Delete the sub-section
        await SubSection.findByIdAndDelete(subSectionId);

        // Pull from section.subSection array
        await Section.findByIdAndUpdate(
            sectionId,
            {
                $pull: { subSection: subSectionId },
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete SubSection",
            error: error.message,
        });
    }
};
