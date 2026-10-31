import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    shareOfOrders: {
      type: Number,
      default: 0,
      min: [0, "Share of orders cannot be negative"],
      max: [100, "Share of orders cannot exceed 100%"],
    },

    chartColor: {
      type: String,
      default: "#6366F1",
      match: [
        /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
        "Please provide a valid hex color",
      ],
    },
  },
  {
    timestamps: true,
  }
);

const categoryModel = mongoose.model('Cake-Categories',categorySchema)

export default categoryModel