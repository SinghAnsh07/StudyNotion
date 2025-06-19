const Category = require("../models/categories");

// Create Category handler function
exports.createCategory = async (req, res) => {
    try {
        // Fetch data
        const { name, description } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // Create entry in DB
        const categoryDetails = await Category.create({
            name,
            description,
        });
        console.log(categoryDetails);

        // Return response
        return res.status(200).json({
            success: true,
            message: "Category Created Successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all categories handler function
exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: true, description: true });

        res.status(200).json({
            success: true,
            message: "All categories returned successfully",
            allCategories,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};