import mongoose from "mongoose";

const cakeSchema = new mongoose.Schema(
  {
    // Basic cake information
    name: {
      type: String,
      required: [true, "Cake name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    // Name of a category managed from the Categories page — kept as a plain
    // label so a category the admin just added can be used straight away.
    category: {
      type: String,
      required: [true, "Cake category is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    flavor: {
      type: String,
      required: [true, "Cake flavor is required"],
      trim: true,
    },

    // Pricing and inventory
    price: {
      type: Number,
      required: [true, "Cake price is required"],
      min: [0, "Price cannot be negative"],
    },

    stock: {
      type: Number,
      required: [true, "Cake stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    // Cake description and appearance
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    style: {
      type: String,
      trim: true,
      enum: [
        "Chocolate Cake",
        "Pink Cake",
        "Wedding Cake",
        "Cream Cake",
        "Velvet Cake",
        "Lemon Cake",
        "Other",
      ],
      default: "Other",
    },

    // Image URL from Cloudinary or another image host
    photo: {
      type: String,
      required: [true, "Cake photo is required"],
      trim: true,
    },

    // Availability
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for searching and filtering cakes
cakeSchema.index({ category: 1, isAvailable: 1 });

const Cake = mongoose.model("Cake", cakeSchema);

export default Cake;
