const Category = require("../models/Category");

// get Random Integer
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// ================ create Category ================
exports.createCategory = async (req, res) => {
  try {
    //fetch data
    const { name, description } = req.body;

    //validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //create entry in DB
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    // console.log(categoryDetails);

    //return response
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    console.log("Error while creating Category");
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while creating Category",
      message: error.message,
    });
  }
};

// ================ delete Category ================
exports.deleteCategory = async (req, res) => {
  try {
    // extract data
    const { categoryId } = req.body;

    // validation
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId is required",
      });
    }

    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log("Error while deleting Category");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting Category",
      error: error.message,
    });
  }
};

// ================ get All Category ================
exports.showAllCategories = async (req, res) => {
  try {
    // get all category from DB
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );

    //return response
    res.status(200).json({
      success: true,
      data: allCategories,
      message: "All Categories fetched successfully",
    });
  } catch (error) {
    console.log("Error while fetching all Categories");
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================ Get Category Page Details ================
exports.getCategoryPageDetails = async (req, res) => {
  try {
    //get categoryId
    const { categoryId } = req.body;
    // console.log("PRINTING CATEGORY ID: ", categoryId);

    //get courses for specified categoryId
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    // console.log('selectedCategory = ', selectedCategory)
    // Handle the case when the category is not found
    if (!selectedCategory) {
      // console.log("Category not found.")
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // //get courses for different categories
    // const differentCategories = await Category.find({
    //   _id: { $ne: categoryId },
    // })
    //   .populate("courses")
    //   .exec();

    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      // console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        data: null,
        message: "No courses found for the selected category.",
      });
    }

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec();

    //console.log("Different COURSE", differentCategory)
    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();

    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    // console.log("mostSellingCourses: ", mostSellingCourses);
    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      message: error.message,
    });
  }
};
